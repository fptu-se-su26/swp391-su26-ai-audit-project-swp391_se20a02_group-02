package com.luxeway.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * A single predicted data point returned by any forecast algorithm.
 * Maps Python snake_case fields to Java camelCase via @JsonProperty.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastPoint {

    private LocalDate date;

    @JsonProperty("predicted_revenue")
    private Double predictedRevenue;

    @JsonProperty("predicted_bookings")
    private Double predictedBookings;

    @JsonProperty("lower_bound")
    private double lowerBound;

    @JsonProperty("upper_bound")
    private double upperBound;

    /** Used by utilization forecasts (value in [0.0, 1.0]). */
    private Double predicted;
}
