package com.luxeway.ai;

import com.luxeway.controller.AIPredictiveController;
import com.luxeway.dto.ai.*;
import com.luxeway.repository.AnalyticsRepository;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import com.luxeway.security.JwtTokenProvider;
import com.luxeway.service.ai.MLSidecarClient;
import com.luxeway.service.ai.PredictionCacheService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@WebMvcTest(controllers = AIPredictiveController.class)
@ActiveProfiles("test")
@SuppressWarnings("all")
class AIPredictiveControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private PredictionCacheService cacheService;
    @MockBean private MLSidecarClient mlSidecarClient;
    @MockBean private AnalyticsRepository analyticsRepository;
    @MockBean private BookingRepository bookingRepository;
    @MockBean private VehicleRepository vehicleRepository;
    @MockBean private UserRepository userRepository;
    @MockBean private JwtTokenProvider jwtTokenProvider;

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private RevenueForecastDTO stubRevenue(int horizon) {
        List<ForecastPoint> pts = new ArrayList<>();
        for (int i = 0; i < horizon; i++) {
            pts.add(ForecastPoint.builder()
                    .date(LocalDate.now().plusDays(i + 1))
                    .predictedRevenue(10_000_000.0 + i * 100_000)
                    .lowerBound(9_500_000.0)
                    .upperBound(11_000_000.0)
                    .build());
        }
        return RevenueForecastDTO.builder()
                .predictions(pts)
                .r2Score(0.82)
                .trendSlope(50_000.0)
                .trendDirection("UP")
                .warningFlag(false)
                .build();
    }

    private BookingDemandDTO stubDemand(int horizon) {
        List<ForecastPoint> pts = new ArrayList<>();
        for (int i = 0; i < horizon; i++) {
            pts.add(ForecastPoint.builder()
                    .date(LocalDate.now().plusDays(i + 1))
                    .predictedBookings(50.0 + i)
                    .lowerBound(40.0)
                    .upperBound(60.0)
                    .build());
        }
        return BookingDemandDTO.builder()
                .dailyForecasts(pts)
                .peakDay("Saturday")
                .avgDailyDemand(52.0)
                .warningFlag(false)
                .build();
    }

    private VehicleUtilizationDTO stubUtilization() {
        return VehicleUtilizationDTO.builder()
                .currentRates(Collections.singletonMap("SUV", 72.5))
                .lowestCategory("SEDAN")
                .highestCategory("SUV")
                .warningFlag(false)
                .build();
    }

    // ----------------------------------------------------------------
    // RTM #15 — GET /dashboard
    // ----------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDashboard_cacheReady_returns200() throws Exception {
        when(cacheService.getCached()).thenReturn(AIPredictiveDashboardDTO.builder().build());

        mockMvc.perform(get("/api/v1/admin/ai/dashboard"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDashboard_cacheNull_returns202() throws Exception {
        when(cacheService.getCached()).thenReturn(null);

        mockMvc.perform(get("/api/v1/admin/ai/dashboard"))
                .andExpect(status().isAccepted());
    }

    // ----------------------------------------------------------------
    // RTM #16 — POST /revenue/forecast
    // ----------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void revenueForecast_horizon7_returns200WithPredictions() throws Exception {
        when(analyticsRepository.findByRecordDateBetweenOrderByRecordDateAsc(any(), any()))
                .thenReturn(Collections.emptyList());
        when(mlSidecarClient.forecastRevenue(anyList(), eq(7))).thenReturn(stubRevenue(7));

        mockMvc.perform(post("/api/v1/admin/ai/revenue/forecast?horizon=7").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.predictions").isArray())
                .andExpect(jsonPath("$.predictions.length()").value(7));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void revenueForecast_horizon0_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/admin/ai/revenue/forecast?horizon=0").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void revenueForecast_horizon31_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/admin/ai/revenue/forecast?horizon=31").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void revenueForecast_sidecarDown_returns200WithWarningFlag() throws Exception {
        when(analyticsRepository.findByRecordDateBetweenOrderByRecordDateAsc(any(), any()))
                .thenReturn(Collections.emptyList());
        RevenueForecastDTO fallback = stubRevenue(7);
        fallback.setWarningFlag(true);
        when(mlSidecarClient.forecastRevenue(anyList(), anyInt())).thenReturn(fallback);

        mockMvc.perform(post("/api/v1/admin/ai/revenue/forecast?horizon=7").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warning_flag").value(true));
    }

    // ----------------------------------------------------------------
    // RTM #17 — POST /bookings/demand
    // ----------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void bookingDemand_horizon7_returns200WithForecasts() throws Exception {
        when(analyticsRepository.findByRecordDateBetweenOrderByRecordDateAsc(any(), any()))
                .thenReturn(Collections.emptyList());
        when(mlSidecarClient.forecastDemand(anyList(), eq(7))).thenReturn(stubDemand(7));

        mockMvc.perform(post("/api/v1/admin/ai/bookings/demand?horizon=7").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.daily_forecasts").isArray())
                .andExpect(jsonPath("$.daily_forecasts.length()").value(7));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void bookingDemand_invalidHorizon_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/admin/ai/bookings/demand?horizon=0").with(csrf()))
                .andExpect(status().isBadRequest());
    }

    // ----------------------------------------------------------------
    // RTM #18 — POST /vehicles/utilization
    // ----------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void vehicleUtilization_returns200() throws Exception {
        when(vehicleRepository.findAll()).thenReturn(Collections.emptyList());
        when(mlSidecarClient.forecastUtilization(anyMap(), anyInt())).thenReturn(stubUtilization());

        mockMvc.perform(post("/api/v1/admin/ai/vehicles/utilization?days=7").with(csrf()))
                .andExpect(status().isOk());
    }

    // ----------------------------------------------------------------
    // RTM #19 — GET /users/churn
    // ----------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void usersChurn_returns200WithValidScores() throws Exception {
        List<ChurnRiskDTO> stubChurn = List.of(
                ChurnRiskDTO.builder()
                        .userId("u1")
                        .displayName("Alice")
                        .email("alice@test.com")
                        .churnScore(72.5)
                        .riskLevel("HIGH")
                        .build()
        );
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(bookingRepository.findAll()).thenReturn(Collections.emptyList());
        when(mlSidecarClient.scoreChurn(anyList(), anyDouble(), anyDouble())).thenReturn(stubChurn);

        mockMvc.perform(get("/api/v1/admin/ai/users/churn"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].churn_score").value(72.5));
    }

    // ----------------------------------------------------------------
    // RTM #20 — GET /anomalies
    // ----------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void anomalies_returns200WithAnomalyList() throws Exception {
        List<AnomalyDTO> stubAnomalies = List.of(
                AnomalyDTO.builder()
                        .date("2026-07-10")     // String field, not LocalDate
                        .metric("revenue")
                        .actualValue(5_000_000.0)
                        .expectedValue(20_000_000.0)
                        .zScore(-3.5)           // field is zScore, not deviationPercent
                        .severity("HIGH")
                        .build()
        );
        when(analyticsRepository.findByRecordDateBetweenOrderByRecordDateAsc(any(), any()))
                .thenReturn(Collections.emptyList());
        when(mlSidecarClient.detectAnomalies(anyList())).thenReturn(stubAnomalies);

        mockMvc.perform(get("/api/v1/admin/ai/anomalies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ----------------------------------------------------------------
    // RTM #21 — GET /insights
    // ----------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void insights_cacheNotNull_returnsInsightList() throws Exception {
        // AIPredictiveDashboardDTO.insights is List<InsightDTO>, not List<String>
        AIPredictiveDashboardDTO dashboard = AIPredictiveDashboardDTO.builder()
                .insights(List.of(
                        InsightDTO.builder().type("REVENUE_FORECAST").title("Revenue is up 15%").severity("INFO").confidence(0.9).build(),
                        InsightDTO.builder().type("CHURN_ALERT").title("Churn risk for 3 users").severity("WARNING").confidence(0.75).build()
                ))
                .build();
        when(cacheService.getCached()).thenReturn(dashboard);

        mockMvc.perform(get("/api/v1/admin/ai/insights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void insights_cacheNull_returnsEmptyList() throws Exception {
        when(cacheService.getCached()).thenReturn(null);

        mockMvc.perform(get("/api/v1/admin/ai/insights"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ----------------------------------------------------------------
    // RTM #22 — GET /analytics/payload
    // ----------------------------------------------------------------

    @Test
    @WithMockUser(roles = "ADMIN")
    void fetchAnalyticsPayload_returns200WithDataPoints() throws Exception {
        when(analyticsRepository.findByRecordDateBetweenOrderByRecordDateAsc(any(), any()))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/admin/ai/analytics/payload"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ----------------------------------------------------------------
    // RTM #23 — GET /rate-limit/status
    // ----------------------------------------------------------------

    @Test
    @WithMockUser(username = "check-rate@test.com", roles = "ADMIN")
    void checkRateLimit_withinLimit_returnsAllowed() throws Exception {
        mockMvc.perform(get("/api/v1/admin/ai/rate-limit/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowed").value(true));
    }

    @Test
    @WithMockUser(username = "rate-limit-test@test.com", roles = "ADMIN")
    void revenueForecast_rateLimitExceeded_returns429() throws Exception {
        when(analyticsRepository.findByRecordDateBetweenOrderByRecordDateAsc(any(), any()))
                .thenReturn(Collections.emptyList());
        when(mlSidecarClient.forecastRevenue(anyList(), anyInt())).thenReturn(stubRevenue(1));

        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/v1/admin/ai/revenue/forecast?horizon=1").with(csrf()))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(post("/api/v1/admin/ai/revenue/forecast?horizon=1").with(csrf()))
                .andExpect(status().isTooManyRequests());
    }
}
