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

    @MockBean
    private PredictionCacheService cacheService;
    @MockBean
    private MLSidecarClient mlSidecarClient;
    @MockBean
    private AnalyticsRepository analyticsRepository;
    @MockBean
    private BookingRepository bookingRepository;
    @MockBean
    private VehicleRepository vehicleRepository;
    @MockBean
    private UserRepository userRepository;
    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    private RevenueForecastDTO stubRevenue(int horizon) {
        List<ForecastPoint> pts = new java.util.ArrayList<>();
        for (int i = 0; i < horizon; i++) {
            pts.add(ForecastPoint.builder()
                    .date(java.time.LocalDate.now().plusDays(i + 1))
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

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDashboard_returns200() throws Exception {
        when(cacheService.getCached()).thenReturn(AIPredictiveDashboardDTO.builder().build());
        mockMvc.perform(get("/api/v1/admin/ai/dashboard"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void revenueForecast_horizon7_returns200WithPredictions() throws Exception {
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
        RevenueForecastDTO fallbackResult = stubRevenue(7);
        fallbackResult.setWarningFlag(true);
        when(mlSidecarClient.forecastRevenue(anyList(), anyInt())).thenReturn(fallbackResult);

        mockMvc.perform(post("/api/v1/admin/ai/revenue/forecast?horizon=7").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.warning_flag").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void usersChurn_returns200WithValidScores() throws Exception {
        List<ChurnRiskDTO> stubChurn = List.of(
                ChurnRiskDTO.builder().userId("u1").displayName("Alice").email("alice@test.com")
                        .churnScore(72.5).riskLevel("HIGH").recencyDays(45)
                        .totalBookings(3).totalSpend(150_000.0).daysSinceLastBooking(45).build()
        );
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(bookingRepository.findAll()).thenReturn(Collections.emptyList());
        when(mlSidecarClient.scoreChurn(any(), anyDouble(), anyDouble())).thenReturn(stubChurn);

        mockMvc.perform(get("/api/v1/admin/ai/users/churn"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].churn_score").value(72.5));
    }

    @Test
    @WithMockUser(username = "rate-limit-test@test.com", roles = "ADMIN")
    void revenueForecast_rateLimitExceeded_returns429() throws Exception {
        when(mlSidecarClient.forecastRevenue(anyList(), anyInt())).thenReturn(stubRevenue(1));

        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/v1/admin/ai/revenue/forecast?horizon=1").with(csrf()))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(post("/api/v1/admin/ai/revenue/forecast?horizon=1").with(csrf()))
                .andExpect(status().isTooManyRequests());
    }
}

