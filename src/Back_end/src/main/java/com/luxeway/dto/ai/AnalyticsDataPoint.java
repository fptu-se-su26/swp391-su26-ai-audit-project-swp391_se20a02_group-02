package com.luxeway.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload DTO sent to the Python ML sidecar for analytics-based forecasts.
 * Maps Java camelCase to Python snake_case via @JsonProperty.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDataPoint {

    private String date;

    private double revenue;

    @JsonProperty("bookings_count")
    private int bookingsCount;
}
