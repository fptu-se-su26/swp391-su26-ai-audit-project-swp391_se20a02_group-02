package com.luxeway.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for revenue forecast returned by the Python ML sidecar.
 * Maps Python snake_case response fields to Java camelCase via @JsonProperty.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueForecastDTO {

    private List<ForecastPoint> predictions;

    @JsonProperty("r2_score")
    private double r2Score;

    @JsonProperty("trend_slope")
    private double trendSlope;

    @JsonProperty("trend_direction")
    private String trendDirection;

    @JsonProperty("warning_flag")
    private boolean warningFlag;
}
