# Implementation Plan: AI Predictive Analytics for Admin Panel

## Overview

Implementation follows a 4-wave dependency order:
- **Wave 1**: Python sidecar scaffold + schemas (parallel with Java DTOs)
- **Wave 2**: Python ML algorithms + Spring Boot adapter layer
- **Wave 3**: Spring Boot orchestration + frontend service layer
- **Wave 4**: Frontend UI + integration tests + E2E validation

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "9"]
    },
    {
      "wave": 2,
      "tasks": ["2", "10"]
    },
    {
      "wave": 3,
      "tasks": ["3", "4", "5", "6", "7", "11"]
    },
    {
      "wave": 4,
      "tasks": ["8", "12"]
    },
    {
      "wave": 5,
      "tasks": ["13", "15"]
    },
    {
      "wave": 6,
      "tasks": ["14", "16"]
    },
    {
      "wave": 7,
      "tasks": ["17", "18"]
    },
    {
      "wave": 8,
      "tasks": ["19"]
    }
  ]
}
```

## Tasks

- [x] 1. Scaffold Python ML sidecar project
  - Create `src/ml_service/` directory with `main.py`, `routers/`, `models/`, `tests/` sub-directories and `__init__.py` files
  - Create `src/ml_service/main.py` with FastAPI app instance, CORS middleware, and router registration placeholders
  - Create `src/ml_service/requirements.txt` with pinned versions: `fastapi==0.111.0`, `uvicorn==0.29.0`, `scikit-learn==1.4.2`, `statsmodels==0.14.2`, `pandas==2.2.2`, `numpy==1.26.4`, `pydantic==2.7.1`, `pytest==8.2.0`, `httpx==0.27.0`, `hypothesis==6.100.0`
  - Add `GET /ml/health` endpoint returning `{"status": "ok", "version": "1.0.0"}`
  - Add `ml.service.url=http://localhost:8000` and `ml.service.timeout-ms=5000` to `src/Back_end/src/main/resources/application-sqlserver.yml`
  - _Requirements: 7.5, 10.4_

- [x] 2. Define Python Pydantic request and response schemas
  - Create `src/ml_service/models/schemas.py` with all request/response Pydantic models
  - Define `AnalyticsDataPoint(date: str, revenue: float, bookings_count: int)`
  - Define `ForecastPoint(date: str, predicted_revenue: float | None, predicted_bookings: float | None, lower_bound: float, upper_bound: float)`
  - Define `RevenueForecastRequest(data: list[AnalyticsDataPoint], horizon: int)` — validator raises 422 if `horizon` not in `[1, 30]`
  - Define `RevenueForecastResponse(predictions, r2_score, trend_slope, trend_direction, warning_flag)`
  - Define `DemandForecastRequest(data, horizon)` and `DemandForecastResponse(daily_forecasts, dow_distribution, peak_day, avg_daily_demand)`
  - Define `UtilizationRequest(by_category: dict[str, list[float]], forecast_days: int)` and `UtilizationResponse(by_category, current_rates, lowest_category, highest_category)`
  - Define `CustomerRecord(user_id, display_name, email, bookings: list[dict])`, `ChurnRequest(customers, platform_avg_frequency, platform_avg_spend)`, `ChurnResponse(results: list[dict])`
  - Define `AnomalyRequest(data: list[AnalyticsDataPoint])` and `AnomalyResponse(anomalies: list[dict])`
  - _Requirements: 1.1, 2.1, 3.3, 4.1, 5.1_

- [x] 3. Implement revenue forecast algorithm in Python
  - Create `src/ml_service/routers/revenue.py` and register `POST /ml/revenue/forecast`
  - Implement `forecast_revenue(data, horizon)` using `statsmodels.regression.linear_model.OLS`
  - Build feature matrix: day_index + one-hot DoW columns (Mon–Sat, Sun=baseline) + intercept column
  - Compute 95% CI: `1.96 * std(model.resid)`; clamp all `predicted_revenue >= 0.0` with `max(0.0, ...)`
  - Clamp `r2_score` to `[0.0, 1.0]` using `max(0.0, min(1.0, model.rsquared))`
  - Implement `_sma_revenue_fallback(df, horizon)` for when OLS raises any exception — returns `warning_flag=True`
  - Determine `trend_direction`: `"UP"` if slope > 50000, `"DOWN"` if < -50000, else `"STABLE"`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 4. Implement booking demand forecast algorithm in Python
  - Create `src/ml_service/routers/demand.py` and register `POST /ml/bookings/demand`
  - Implement `forecast_demand(data, horizon)` using 7-day SMA with day-of-week adjustment factor
  - Build `dow_distribution` dict mapping day names (`MONDAY`…`SUNDAY`) to proportional weights summing to `1.0 ± 0.001`
  - Apply `dow_factor = dow_avg[future_dow] / overall_mean` as multiplicative adjustment; clamp result `>= 0.0`
  - Compute CI per window: `1.96 * std(rolling_window_of_7)`
  - Set `peak_day` to the DoW identifier with highest average booking count
  - Return empty `daily_forecasts` list if input has fewer than 14 records
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 5. Implement vehicle utilization forecast algorithm in Python
  - Create `src/ml_service/routers/utilization.py` and register `POST /ml/vehicles/utilization`
  - Implement `forecast_utilization(by_category, forecast_days)` using `statsmodels.tsa.holtwinters.SimpleExpSmoothing` with `smoothing_level=0.3`
  - Clamp all input utilization values to `[0.0, 1.0]` before fitting with `max(0.0, min(1.0, v))`
  - Apply flat CI band `±0.05`, clamped to `[0.0, 1.0]` for lower/upper bounds
  - Handle categories with fewer than 2 data points: use last known value as flat forecast
  - Set `lowest_category` and `highest_category` from `current_rates` dict
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 6. Implement churn risk RFM scoring algorithm in Python
  - Create `src/ml_service/routers/churn.py` and register `POST /ml/churn/score`
  - Implement `score_churn(customers, platform_avg_freq, platform_avg_spend)` with weighted RFM scoring
  - Count only bookings with `status == "COMPLETED"` for all RFM calculations
  - Recency score: `clamp(recency_days / 90.0 * 100.0, 0, 100)`; set `recency_days = 999` for customers with no completed bookings
  - Frequency score: `clamp((1 - freq / (avg_freq * 2)) * 100, 0, 100)`; set to 100.0 if `avg_freq == 0`
  - Monetary score: `clamp((1 - spend / (avg_spend * 2)) * 100, 0, 100)`; set to 100.0 if `avg_spend == 0`
  - Weighted composite: `0.40 * R + 0.35 * F + 0.25 * M`
  - Risk levels: CRITICAL ≥ 80, HIGH ≥ 60, MEDIUM ≥ 40, LOW < 40
  - Sort results by `churn_score` descending; return at most 50 entries
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 7. Implement anomaly detection algorithm in Python
  - Create `src/ml_service/routers/anomaly.py` and register `POST /ml/anomalies/detect`
  - Implement `detect_anomalies(data)` using Z-score on 14-day rolling window for both `revenue` and `bookings_count` metrics
  - Skip any window position where `std == 0.0` to avoid division-by-zero
  - Flag as anomaly only when `abs(z_score) > 2.0`; set `severity = "CRITICAL"` if `abs(z_score) > 3.0`, else `"WARNING"`
  - Sort result list descending by date string
  - Return empty list if input has fewer than 14 data points
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 8. Write Python unit and property-based tests
  - Create `src/ml_service/tests/test_revenue.py`: test horizon coverage, non-negativity, CI ordering, R² bounds, OLS exception triggers fallback with `warning_flag=True`
  - Create `src/ml_service/tests/test_demand.py`: verify SMA against manual calculation, DoW weights sum to `1.0 ± 0.001`, empty-input returns empty list
  - Create `src/ml_service/tests/test_churn.py`: RFM weights, threshold boundaries (`score=80` → CRITICAL, `score=79` → HIGH), sort order descending, max 50 results, zero-booking customer gets `recency_days=999`
  - Create `src/ml_service/tests/test_anomaly.py`: Z-score threshold filter rejects `|z| <= 2.0`, `std=0` skipped, severity assignment, empty-input returns empty list
  - Add `hypothesis` property-based tests: revenue horizon coverage for all `horizon ∈ [1,30]`, churn scores all in `[0.0, 100.0]`, anomaly results all have `|z_score| > 2.0`
  - _Requirements: 1.1–1.7, 2.1–2.6, 4.1–4.7, 5.1–5.6_

- [ ] 9. Define Spring Boot Java DTOs for AI predictions
  - Create package `com.luxeway.dto.ai` under `src/Back_end/src/main/java/com/luxeway/dto/ai/`
  - Create `AIPredictiveDashboardDTO.java` as Java record: `revenueForecast`, `bookingDemand`, `vehicleUtilization`, `churnRisks`, `anomalies`, `insights`, `generatedAt`, `sidecarWarning`
  - Create `RevenueForecastDTO.java`, `ForecastPoint.java` (with `predictedRevenue`, `lowerBound`, `upperBound`, `date`)
  - Create `BookingDemandDTO.java`, `VehicleUtilizationDTO.java`, `ChurnRiskDTO.java`, `AnomalyDTO.java`, `InsightDTO.java`
  - Create `AnalyticsDataPoint.java` and `CustomerDataPoint.java` as payload DTOs for sidecar requests
  - Add `@JsonProperty` annotations where Java camelCase must map to Python snake_case response fields
  - _Requirements: 9.2, 9.6_

- [~] 10. Implement MLSidecarClient and JavaFallbackService in Spring Boot
  - Create `com.luxeway.service.ai.MLSidecarClient` annotated `@Component`
  - Inject `RestTemplate` bean configured with 5000ms connection and read timeouts
  - Read sidecar URL from `${ml.service.url:http://localhost:8000}`
  - Implement `forecastRevenue(List<AnalyticsDataPoint>, int horizon)` calling `POST {url}/ml/revenue/forecast`
  - Implement `forecastDemand`, `forecastUtilization`, `scoreChurn`, `detectAnomalies` following same pattern
  - Implement `isHealthy()` via `GET {url}/ml/health`, return `false` on any exception
  - On `ResourceAccessException` or `RestClientException`: catch, log `WARN`, delegate to `JavaFallbackService`
  - Create `com.luxeway.service.ai.JavaFallbackService` implementing 7-day SMA for all forecast types, always sets `warningFlag = true` in returned DTOs
  - Add `RestTemplate` `@Bean` with timeout config in a new `@Configuration` class or in existing `AppConfig`
  - _Requirements: 7.5, 10.4_

- [~] 11. Implement AIPredictiveService and PredictionCacheService
  - Create `com.luxeway.service.ai.AIPredictiveService` annotated `@Service`
  - In `buildDashboard()`: fetch 90-day analytics from `AnalyticsRepository`, bookings from `BookingRepository`, vehicles from `VehicleRepository`, customers from `UserRepository`
  - Build JSON payload DTOs and fire 5 `CompletableFuture.supplyAsync()` calls to `MLSidecarClient` in parallel
  - After all futures complete (`CompletableFuture.allOf(...).join()`): assemble `AIPredictiveDashboardDTO`
  - Call `InsightGeneratorService.generateInsights(dashboard)` after assembly
  - Create `com.luxeway.service.ai.PredictionCacheService` annotated `@Service`
  - Use `volatile AIPredictiveDashboardDTO cachedDashboard` field for thread-safe reads
  - `@PostConstruct` method: submit `buildDashboard()` async via `@Async` executor, do not block startup
  - `@Scheduled(fixedRate = 900000)` `refresh()` method: call `buildDashboard()` and store result
  - Return `null` (trigger 202 partial response) if cache is still null at first request
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 10.1, 10.2_

- [~] 12. Implement InsightGeneratorService
  - Create `com.luxeway.service.ai.InsightGeneratorService` annotated `@Service`
  - Generate `REVENUE_FORECAST` insight: include `trendDirection` and `trendSlope` formatted as % change per week
  - Generate `DEMAND_PEAK` insight: include `peakDay` name, INFO severity
  - Generate `CHURN_ALERT` insight (WARNING if any score ≥ 60, CRITICAL if any score ≥ 80): include count of at-risk users
  - Generate `ANOMALY` insight (WARNING/CRITICAL) for each anomaly in `dashboard.anomalies()`
  - Generate `UTILIZATION` insight: mention `lowestCategory` with its current utilization rate
  - Generate fallback `INFO` insight `"Platform metrics are stable."` when no anomalies, no churn score ≥ 60, and trendDirection is STABLE
  - Sort list: CRITICAL first → WARNING → INFO; within same severity sort by confidence (r2Score / churnScore)
  - Cap at 8 entries via `stream().limit(8)`
  - Return empty list if input `dashboard` is null
  - Ensure all `InsightDTO` have non-blank `title` (≤ 100 chars) and `description` (≤ 500 chars)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [~] 13. Implement AIPredictiveController
  - Create `com.luxeway.controller.AIPredictiveController` with `@RestController`, `@RequestMapping("/admin/ai")`, `@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")`
  - `GET /dashboard`: return `PredictionCacheService.getCached()`; if null return 202 with single INFO insight `"Dashboard is warming up"`
  - `POST /revenue/forecast?horizon={days}`: validate `horizon ∈ [1,30]` returning 400 if invalid; fetch 90-day analytics; call `MLSidecarClient.forecastRevenue()`
  - `POST /bookings/demand?horizon={days}`: same validation pattern, call `forecastDemand()`
  - `POST /vehicles/utilization?days={days}`: fetch vehicle+booking data per category, call `forecastUtilization()`
  - `GET /users/churn`: fetch customers+completed bookings, compute platform averages, call `scoreChurn()`
  - `GET /anomalies`: fetch 90-day analytics, call `detectAnomalies()`
  - `GET /insights`: return `PredictionCacheService.getCached().insights()` or empty list if cache null
  - Implement per-admin rate limiting: `ConcurrentHashMap<String, Deque<Long>>` keyed by JWT subject; reject with 429 if > 10 POST requests in last 60 seconds
  - _Requirements: 7.4, 7.5, 7.6, 8.1, 8.2, 8.4_

- [~] 14. Verify and update Spring Security configuration
  - Open `com.luxeway.config.SecurityConfig`
  - Confirm `/admin/ai/**` is protected by the existing `/admin/**` rule in `HttpSecurity` config
  - Verify `ROLE_SUPER_ADMIN` is included alongside `ROLE_ADMIN` for `/admin/**` paths
  - Confirm Spring Security returns 401 (not 403) for unauthenticated requests with missing or invalid JWT — check `AuthenticationEntryPoint` configuration
  - Ensure the `RestTemplate` bean with timeout settings is registered without conflicting with any existing `RestTemplate` beans
  - _Requirements: 8.1, 8.2, 8.3_

- [~] 15. Add AI prediction methods to adminService.ts
  - Open `src/Front_end/src/services/adminService.ts`
  - Add TypeScript interfaces: `ForecastPoint`, `RevenueForecastDTO`, `BookingDemandDTO`, `VehicleUtilizationDTO`, `ChurnRiskDTO`, `AnomalyDTO`, `InsightDTO`, `AIPredictiveDashboardDTO` (with optional `sidecarWarning?: boolean`)
  - Implement `getAIPredictiveDashboard(): Promise<AIPredictiveDashboardDTO | null>` calling `GET /admin/ai/dashboard`
  - Implement `refreshRevenueForecast(horizon: number): Promise<RevenueForecastDTO | null>` calling `POST /admin/ai/revenue/forecast?horizon={horizon}`
  - Implement `refreshBookingDemand(horizon: number): Promise<BookingDemandDTO | null>` calling `POST /admin/ai/bookings/demand?horizon={horizon}`
  - Implement `getChurnRisks(): Promise<ChurnRiskDTO[]>` calling `GET /admin/ai/users/churn`
  - Implement `getAnomalies(): Promise<AnomalyDTO[]>` calling `GET /admin/ai/anomalies`
  - Implement `getAIInsights(): Promise<InsightDTO[]>` calling `GET /admin/ai/insights`
  - All methods use existing `axiosInstance` (authenticated); catch errors and return `null` or `[]`
  - _Requirements: 9.1, 9.4_

- [~] 16. Build AIPredictivePanel.tsx component
  - Create `src/Front_end/src/components/admin/AIPredictivePanel.tsx`
  - Define `AIPredictivePanelProps { isDark: boolean; currency: string }`
  - On mount: call `adminService.getAIPredictiveDashboard()`, manage `loading`, `error`, and `aiDashboard` state
  - Show pulsing skeleton divs while `loading === true` matching existing card dimensions
  - On `null` response or network error: render dismissible amber banner `"AI Predictions temporarily unavailable."`
  - When `dashboard.sidecarWarning === true`: render yellow badge `"Using simplified forecast model"`
  - Section 1 — Revenue Forecast: `AreaChart` with three `Area` layers (`upper`, `predictedRevenue`, `lower`) using `fillOpacity` for confidence band; show `trendDirection` badge colored (green=UP, red=DOWN, gray=STABLE) and R² score label
  - Section 2 — Booking Demand: `BarChart` for `daily_forecasts`; row of 7 DoW weight chips; highlight `peakDay` chip with indigo background
  - Section 3 — Vehicle Utilization: `LineChart` with one `Line` per category in `COLORS` array; legend with current utilization % badges
  - Section 4 — Churn Risk: scrollable list of up to 50 `ChurnRiskDTO` rows with risk badge (CRITICAL=red-500, HIGH=orange-500, MEDIUM=yellow-500, LOW=green-500), `churnScore`, `daysSinceLastBooking`, `totalBookings`
  - Section 5 — Anomaly Detection: table with columns date, metric, actual vs expected, z-score, severity badge
  - Section 6 — AI Insights Panel: grid of up to 8 insight cards; `AlertTriangle` icon (red for CRITICAL, amber for WARNING), `CheckCircle` icon (green for INFO); show `title`, `description`, `actionLabel` button
  - Each of the 6 sections has a collapse toggle (Framer Motion `AnimatePresence`) and a "Refresh" button that calls the relevant single-section API method
  - All monetary values run through `convertCurrency(value, 'VND', currency)` then `formatCurrency()`
  - Apply same glassmorphic card style as `AdminDashboard.tsx`: `cn("rounded-2xl border backdrop-blur-md", isDark ? "bg-slate-900/60 border-slate-700/40" : "bg-white/80 border-slate-200")`
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [~] 17. Integrate AIPredictivePanel into AdminDashboard analytics tab
  - Open `src/Front_end/src/pages/admin/AdminDashboard.tsx`
  - Add import: `import { AIPredictivePanel } from '@/components/admin/AIPredictivePanel'`
  - Find the `analytics` tab render block (the JSX section guarded by `activeTab === 'analytics'`)
  - Append `<AIPredictivePanel isDark={isDark} currency={currency} />` as the last child element, after all existing historical analytics charts
  - Do not remove or modify any existing charts, state variables, or handlers
  - Verify TypeScript compiles with no new errors
  - _Requirements: 9.5_

- [~] 18. Write Spring Boot integration tests
  - Create `src/Back_end/src/test/java/com/luxeway/ai/AIPredictiveControllerTest.java` with `@SpringBootTest(webEnvironment = RANDOM_PORT)`
  - Use `@MockBean MLSidecarClient` stubbed to return valid DTOs for all methods
  - Test: `GET /admin/ai/dashboard` with valid admin JWT → 200 OK, response body contains `revenueForecast`, `churnRisks`, `insights`
  - Test: `GET /admin/ai/dashboard` without JWT → 401 Unauthorized
  - Test: `GET /admin/ai/dashboard` with customer-role JWT → 403 Forbidden
  - Test: `POST /admin/ai/revenue/forecast?horizon=7` with admin JWT → 200 OK, `predictions` size == 7
  - Test: `POST /admin/ai/revenue/forecast?horizon=0` → 400 Bad Request
  - Test: `POST /admin/ai/revenue/forecast?horizon=31` → 400 Bad Request
  - Test: stub `MLSidecarClient.forecastRevenue()` to throw `ResourceAccessException` → 200 OK with `sidecarWarning=true`
  - Test: 11th POST request within 60 seconds → 429 Too Many Requests
  - Test: `GET /admin/ai/users/churn` → list where all `churnScore` values are in `[0.0, 100.0]`
  - _Requirements: 7.4, 7.5, 8.1, 8.2, 8.4, 10.4_

- [~] 19. End-to-end validation and documentation
  - Start Python sidecar: `cd src/ml_service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000`
  - Start Spring Boot and React frontend; navigate to admin panel analytics tab
  - Verify first load completes within 2 seconds (cache warm-up path)
  - Verify subsequent loads return within 200ms (cache hit path)
  - Verify each "Refresh" button only re-fetches and updates its own section
  - Stop Python sidecar; verify `"Using simplified forecast model"` warning appears without page crash
  - Restart sidecar; verify next cache refresh restores full predictions
  - Verify dark mode and light mode styling match the rest of `AdminDashboard.tsx`
  - Verify currency conversion applies correctly when switching currency in UI store
  - Create `src/ml_service/README.md` with: prerequisites, local setup, Docker run command, endpoint reference table
  - Update `HOW-TO-START-BACKEND.md` with Python sidecar startup step
  - _Requirements: 7.1, 7.5, 9.3, 9.5, 10.1, 10.4_

## Notes

- **Wave execution order**: complete Wave 1 (Tasks 1 + 9) before Wave 2, etc. Tasks within the same wave can be worked in parallel.
- **Python sidecar has no DB access** — Spring Boot always fetches data from JPA and passes it as JSON payload.
- **Frontend is unchanged at the API contract level** — same DTO shapes regardless of whether sidecar or fallback computed the values.
- **`sidecarWarning` flag** propagates from Python response (`warning_flag`) → `MLSidecarClient` → `AIPredictiveDashboardDTO` → `AIPredictivePanel` banner.
- **Running tests**: Python — `pytest src/ml_service/tests/ -v`; Java — `mvn test -pl src/Back_end`.
- **Rate limiting** in Task 13 is in-memory and resets on server restart — acceptable for this scope.
