package com.luxeway.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for vehicle utilization forecast returned by the Python ML sidecar.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class VehicleUtilizationDTO {

    @JsonProperty("by_category")
    private Map<String, List<ForecastPoint>> byCategory;

    @JsonProperty("current_rates")
    private Map<String, Double> currentRates;

    @JsonProperty("lowest_category")
    private String lowestCategory;

    @JsonProperty("highest_category")
    private String highestCategory;

    @JsonProperty("warning_flag")
    private boolean warningFlag;
}
