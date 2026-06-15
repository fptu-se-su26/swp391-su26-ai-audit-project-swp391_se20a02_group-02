package com.luxeway.agent.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * AgentRequest — sent from Spring Boot to the Agent Layer service.
 * Contains analytics data, customers, and vehicle utilization for orchestration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentRequest {

    @NotNull
    @JsonProperty("analytics_data")
    private List<AnalyticsDataPoint> analyticsData;

    @JsonProperty("customers")
    private List<Map<String, Object>> customers;

    @JsonProperty("vehicle_utilization")
    private Map<String, List<Double>> vehicleUtilization;

    @JsonProperty("vehicle_categories")
    private List<String> vehicleCategories;

    @Min(1) @Max(90)
    @JsonProperty("horizon_days")
    @Builder.Default
    private Integer horizonDays = 30;

    @JsonProperty("correlation_id")
    private String correlationId;

    // ── Inner DTO ────────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalyticsDataPoint {
        private String date;
        private Double revenue;
        @JsonProperty("bookings_count")
        private Integer bookingsCount;
    }
}
