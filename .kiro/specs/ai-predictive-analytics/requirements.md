# Requirements Document

## Introduction

This document defines the functional and non-functional requirements for the **AI Predictive Analytics** feature of the LuxeWay admin panel. The feature extends the existing `analytics` tab in `AdminDashboard.tsx` with five AI-powered prediction capabilities — Revenue Forecasting, Booking Demand Prediction, Vehicle Utilization Forecasting, Churn Risk Detection, and Anomaly Detection — plus a natural-language AI Insights Panel. All computation is performed in pure Java on the backend using Apache Commons Math 3.6.1, with no external machine-learning services. Results are cached and refreshed every 15 minutes; all endpoints must respond within 2 seconds.

---

## Glossary

- **Analytics_Record**: A daily aggregated row in the `analytics` SQL Server table, containing date, total revenue, and booking count for that day.
- **AIPredictiveController**: The Spring Boot REST controller exposing all AI prediction endpoints under `/admin/ai/**`, secured to `ROLE_ADMIN`.
- **AIPredictiveService**: The Spring Boot service that orchestrates all five prediction sub-services and assembles the unified dashboard payload.
- **RevenueForecastService**: The service responsible for OLS Linear Regression-based revenue forecasting.
- **BookingDemandService**: The service responsible for Simple Moving Average-based booking demand forecasting.
- **VehicleUtilizationService**: The service responsible for Exponential Smoothing-based vehicle utilization forecasting.
- **ChurnRiskService**: The service responsible for RFM-based customer churn risk scoring.
- **AnomalyDetectionService**: The service responsible for Z-score-based anomaly detection on revenue and booking time series.
- **InsightGeneratorService**: The service responsible for producing up to 8 ranked, human-readable insights from the dashboard payload.
- **PredictionCacheService**: The in-memory cache service that stores the latest `AIPredictiveDashboardDTO` and refreshes it every 15 minutes via `@Scheduled`.
- **AIPredictiveDashboardDTO**: The composite data transfer object containing all five prediction results, the insight list, and a `generatedAt` timestamp.
- **ForecastPoint**: A single predicted data point with a date, predicted value, lower confidence bound, and upper confidence bound.
- **RevenueForecastDTO**: The DTO returned by `RevenueForecastService`, containing a list of `ForecastPoint` records, an R² score, a trend slope, and a trend direction.
- **BookingDemandDTO**: The DTO returned by `BookingDemandService`, containing daily forecasts, day-of-week distribution, peak day, and average daily demand.
- **VehicleUtilizationDTO**: The DTO returned by `VehicleUtilizationService`, containing per-category forecast lists and current utilization rates.
- **ChurnRiskDTO**: The DTO representing a single at-risk customer with their RFM-derived churn score, risk level, and booking history summary.
- **AnomalyDTO**: The DTO representing a detected statistical anomaly on a specific date and metric.
- **InsightDTO**: The DTO representing a single human-readable insight with a severity level, title, description, and action label.
- **OLS**: Ordinary Least Squares linear regression, implemented via `OLSMultipleLinearRegression` from Apache Commons Math 3.6.1.
- **SMA**: Simple Moving Average with a 7-day window, used for booking demand forecasting.
- **SES**: Simple Exponential Smoothing with α = 0.3, used for vehicle utilization forecasting.
- **RFM**: Recency–Frequency–Monetary scoring model used to compute customer churn risk.
- **Z-Score**: Standard score measuring how many standard deviations a data point is from its rolling window mean, used for anomaly detection.
- **AIPredictivePanel**: The new React TypeScript sub-component rendered inside the `analytics` tab of `AdminDashboard.tsx`.
- **AdminDashboard**: The existing React TypeScript admin panel component that hosts the `analytics` tab.
- **adminService**: The existing TypeScript service module in the frontend, extended with new AI prediction API methods.
- **TTL**: Time-to-live; the 15-minute cache expiry duration for the `PredictionCacheService`.
- **Horizon**: The number of future days for which a forecast is requested; valid range is 1–30 for revenue and 1–30 for booking demand.

---

## Requirements

### Requirement 1: Revenue Forecasting

**User Story:** As an admin, I want to view a 7–14 day revenue forecast based on historical data, so that I can anticipate revenue trends and plan business operations accordingly.

#### Acceptance Criteria

1. WHEN `RevenueForecastService.forecast(horizonDays)` is called with `horizonDays` ∈ [1, 30], THE `RevenueForecastService` SHALL return a `RevenueForecastDTO` whose `predictions` list contains exactly `horizonDays` `ForecastPoint` entries.
2. THE `RevenueForecastService` SHALL ensure that for every `ForecastPoint` p in the returned `predictions` list, `p.lowerBound ≤ p.predictedRevenue ≤ p.upperBound`.
3. THE `RevenueForecastService` SHALL ensure that every `predictedRevenue` value in the returned `predictions` list is greater than or equal to 0.0.
4. THE `RevenueForecastService` SHALL return an `r2Score` value in the range [0.0, 1.0], clamping any OLS-computed value below 0.0 to 0.0.
5. WHEN `OLSMultipleLinearRegression` raises a `SingularMatrixException`, THE `RevenueForecastService` SHALL fall back to a Simple Moving Average forecast, log a `WARN`-level message, and include a `WARNING`-severity insight in the dashboard.
6. WHEN fewer than 30 `Analytics_Record` entries are available, THE `RevenueForecastService` SHALL return an empty `predictions` list and set `r2Score` to 0.0.
7. THE `RevenueForecastService` SHALL incorporate day-of-week one-hot encoding as additional OLS features to capture weekly seasonality in the revenue signal.

---

### Requirement 2: Booking Demand Forecasting

**User Story:** As an admin, I want to see a booking demand forecast for the next 14 days including day-of-week patterns, so that I can allocate vehicles and staffing ahead of peak periods.

#### Acceptance Criteria

1. WHEN `BookingDemandService.forecastDemand(horizonDays)` is called with `horizonDays` ∈ [1, 30], THE `BookingDemandService` SHALL return a `BookingDemandDTO` whose `dailyForecasts` list contains exactly `horizonDays` `ForecastPoint` entries.
2. THE `BookingDemandService` SHALL ensure that every `predictedBookings` value in the `dailyForecasts` list is greater than or equal to 0.0.
3. THE `BookingDemandService` SHALL return a `dowDistribution` map containing entries for all seven days of the week (Monday through Sunday).
4. THE `BookingDemandService` SHALL return a `peakDay` value that is one of the seven day-of-week identifiers: `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`, or `SUN`.
5. THE `BookingDemandService` SHALL apply a day-of-week adjustment factor derived from the historical `dowDistribution` to each SMA-computed forecast value before returning the result.
6. WHEN fewer than 14 `Analytics_Record` entries are available, THE `BookingDemandService` SHALL return an empty `dailyForecasts` list.

---

### Requirement 3: Vehicle Utilization Forecasting

**User Story:** As an admin, I want to see per-category vehicle utilization forecasts, so that I can identify underperforming categories and make informed fleet management decisions.

#### Acceptance Criteria

1. THE `VehicleUtilizationService` SHALL ensure that every `predicted` value in every per-category `ForecastPoint` list is in the range [0.0, 1.0].
2. THE `VehicleUtilizationService` SHALL apply the SES recurrence formula `S_t = 0.3 × Y_t + 0.7 × S_{t-1}` to compute the smoothed utilization baseline for each vehicle category.
3. WHEN `VehicleUtilizationService.forecastUtilization(forecastDays)` is called with `forecastDays` ∈ [1, 30], THE `VehicleUtilizationService` SHALL return a `VehicleUtilizationDTO` where each category's forecast list contains exactly `forecastDays` `ForecastPoint` entries.
4. THE `VehicleUtilizationService` SHALL compute utilization as `bookedVehicleCount / totalVehiclesInCategory` for each day in the 30-day historical window, clamping the result to [0.0, 1.0].
5. THE `VehicleUtilizationService` SHALL set `lowestCategory` to the category name with the lowest current utilization rate and `highestCategory` to the name with the highest current utilization rate.
6. WHEN `totalVehiclesInCategory` is zero for any category, THE `VehicleUtilizationService` SHALL set the utilization rate for that category to 0.0 for all historical and forecast data points.

---

### Requirement 4: Churn Risk Detection

**User Story:** As an admin, I want to see a ranked list of at-risk customers with their churn scores, so that I can proactively engage with customers who are likely to stop using the platform.

#### Acceptance Criteria

1. THE `ChurnRiskService` SHALL ensure that every `ChurnRiskDTO` in the returned list has a `churnScore` in the range [0.0, 100.0].
2. THE `ChurnRiskService` SHALL assign `riskLevel` values according to the following thresholds: `CRITICAL` when `churnScore ≥ 80`, `HIGH` when `churnScore ∈ [60, 80)`, `MEDIUM` when `churnScore ∈ [40, 60)`, and `LOW` when `churnScore < 40`.
3. THE `ChurnRiskService` SHALL return the result list sorted in descending order by `churnScore`.
4. THE `ChurnRiskService` SHALL return at most 50 `ChurnRiskDTO` entries per invocation.
5. THE `ChurnRiskService` SHALL compute the churn score as the weighted sum: `0.40 × recencyScore + 0.35 × frequencyScore + 0.25 × monetaryScore`, where each sub-score is clamped to [0.0, 100.0] before the weighted sum is computed.
6. THE `ChurnRiskService` SHALL load all customer bookings in a single bulk query per invocation to avoid per-customer database round trips.
7. WHEN a customer has no bookings, THE `ChurnRiskService` SHALL assign a `recencyDays` value of 999 and compute the recency sub-score as 100.0.

---

### Requirement 5: Anomaly Detection

**User Story:** As an admin, I want anomalies in daily revenue and booking counts to be automatically flagged, so that I can investigate unusual business events quickly.

#### Acceptance Criteria

1. THE `AnomalyDetectionService` SHALL ensure that every `AnomalyDTO` in the returned list satisfies `|zScore| > 2.0`.
2. THE `AnomalyDetectionService` SHALL assign `severity` as `CRITICAL` when `|zScore| > 3.0` and `WARNING` when `2.0 < |zScore| ≤ 3.0`.
3. WHEN the standard deviation of a 14-day rolling window is 0.0, THE `AnomalyDetectionService` SHALL skip anomaly evaluation for that window position to prevent division-by-zero errors.
4. THE `AnomalyDetectionService` SHALL evaluate both `REVENUE` and `BOOKINGS` metrics from the last 90 days of `Analytics_Record` entries.
5. THE `AnomalyDetectionService` SHALL return the anomaly list sorted in descending order by date.
6. WHEN fewer than 14 `Analytics_Record` entries are available, THE `AnomalyDetectionService` SHALL return an empty anomaly list.

---

### Requirement 6: AI Insights Panel

**User Story:** As an admin, I want to see up to 8 ranked natural-language insights derived from the prediction results, so that I can quickly understand the most important actions to take.

#### Acceptance Criteria

1. THE `InsightGeneratorService` SHALL return at most 8 `InsightDTO` entries per invocation.
2. THE `InsightGeneratorService` SHALL assign each `InsightDTO` a `severity` value that is one of `INFO`, `WARNING`, or `CRITICAL`.
3. THE `InsightGeneratorService` SHALL ensure that every returned `InsightDTO` has a non-blank `title` and a non-blank `description`.
4. THE `InsightGeneratorService` SHALL produce insights covering at least the following types when the relevant data is present in the dashboard: `REVENUE_FORECAST`, `DEMAND_PEAK`, `CHURN_ALERT`, `ANOMALY`, and `UTILIZATION`.
5. THE `InsightGeneratorService` SHALL order the returned list by `severity`, with `CRITICAL` entries first, followed by `WARNING`, then `INFO`.
6. WHEN the `AIPredictiveDashboardDTO` contains no anomalies, no high-risk churn customers, and stable revenue trend, THE `InsightGeneratorService` SHALL return at least one `INFO`-severity insight summarizing the stable platform state.

---

### Requirement 7: Prediction Caching and Performance

**User Story:** As an admin, I want the AI dashboard to load within 2 seconds on every request, so that the analytics tab remains responsive during normal use.

#### Acceptance Criteria

1. THE `PredictionCacheService` SHALL return the cached `AIPredictiveDashboardDTO` in under 200 milliseconds on a cache hit.
2. THE `PredictionCacheService` SHALL refresh the cached `AIPredictiveDashboardDTO` every 15 minutes via a `@Scheduled(fixedRate = 900000)` invocation.
3. THE `PredictionCacheService` SHALL populate the cache on application startup via a `@PostConstruct` method so that the first request is served from cache.
4. WHEN the cache TTL has not expired, THE `AIPredictiveController` SHALL serve the `/admin/ai/dashboard` response from `PredictionCacheService` without triggering any database queries or computation.
5. WHEN an on-demand forecast endpoint (`POST /admin/ai/revenue/forecast` or `POST /admin/ai/bookings/demand`) is called, THE `AIPredictiveController` SHALL compute and return the result within 2000 milliseconds.
6. WHEN the cache is being refreshed and no cached value exists, THE `AIPredictiveController` SHALL return HTTP 202 Accepted with a partial response containing a single `INFO`-severity insight indicating that the dashboard is refreshing.

---

### Requirement 8: Access Control and Security

**User Story:** As a system administrator, I want all AI prediction endpoints to be restricted to admin users, so that customer PII and business-sensitive forecasts are not exposed to unauthorized roles.

#### Acceptance Criteria

1. THE `AIPredictiveController` SHALL require the `ROLE_ADMIN` authority on all endpoints under `/admin/ai/**`, enforced via `@PreAuthorize("hasRole('ADMIN')")`.
2. WHEN a request to any `/admin/ai/**` endpoint is made without a valid admin JWT, THE `AIPredictiveController` SHALL return HTTP 403 Forbidden.
3. THE `AIPredictiveController` SHALL never expose `ChurnRiskDTO` data (including email, display name, or spending information) through any public or non-admin endpoint.
4. THE `AIPredictiveController` SHALL accept POST requests to on-demand forecast endpoints at a maximum rate of 10 requests per minute per admin session to prevent compute abuse.

---

### Requirement 9: Frontend AI Predictive Panel

**User Story:** As an admin, I want the AI predictions to be displayed inline within the existing analytics tab, so that I can view forecasts and historical charts in a single unified view.

#### Acceptance Criteria

1. WHEN the `AIPredictivePanel` component mounts, THE `AIPredictivePanel` SHALL call `adminService.getAIPredictiveDashboard()` and display skeleton loaders until the response is received.
2. WHEN the API response is received successfully, THE `AIPredictivePanel` SHALL render all six sections: Revenue Forecast (AreaChart), Booking Demand (BarChart), Vehicle Utilization (LineChart per category), Churn Risk (ranked list), Anomaly Detection (scatter overlay), and AI Insights Panel (severity-sorted cards).
3. WHEN `adminService.getAIPredictiveDashboard()` returns null or a network error occurs, THE `AIPredictivePanel` SHALL display a dismissible error banner reading "AI Predictions temporarily unavailable." without hiding the existing historical analytics charts.
4. WHEN an admin clicks the "Refresh" button for any section, THE `AIPredictivePanel` SHALL re-trigger the corresponding API call and update only that section's data.
5. THE `AIPredictivePanel` SHALL render inside the existing `analytics` tab of `AdminDashboard.tsx` as collapsible sections appended below the current charts, without creating new pages or routes.
6. THE `AIPredictivePanel` SHALL accept `isDark: boolean` and `currency: string` props and apply the same glassmorphic card styling as the rest of `AdminDashboard.tsx`.

---

### Requirement 10: Error Handling and Data Sufficiency

**User Story:** As an admin, I want the system to gracefully handle cases where insufficient data or computation errors occur, so that the admin panel remains functional and I receive clear status feedback.

#### Acceptance Criteria

1. WHEN the `analytics` table contains fewer than 14 `Analytics_Record` entries, THE `AIPredictiveService` SHALL return an `AIPredictiveDashboardDTO` with empty prediction lists and a single `INFO`-severity insight stating that forecasts will become available after 14 days of platform operation.
2. WHEN a database query within any prediction sub-service throws a runtime exception, THE `AIPredictiveService` SHALL catch the exception, log an `ERROR`-level message, and return an `AIPredictiveDashboardDTO` with the affected sub-service's result set to an empty default value.
3. WHEN `RevenueForecastService` falls back to SMA due to a `SingularMatrixException`, THE `RevenueForecastService` SHALL include a `WARNING`-severity insight in the returned dashboard describing the simplified model usage.
4. IF the `PredictionCacheService` has not been initialized and `getCached()` is called, THEN THE `PredictionCacheService` SHALL trigger a synchronous refresh before returning, ensuring a non-null result.
