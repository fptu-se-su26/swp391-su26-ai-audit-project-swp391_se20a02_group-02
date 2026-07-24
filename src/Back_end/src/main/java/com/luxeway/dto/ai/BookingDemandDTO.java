package com.luxeway.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for booking demand forecast returned by the Python ML sidecar.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDemandDTO {

    @JsonProperty("daily_forecasts")
    private List<ForecastPoint> dailyForecasts;

    @JsonProperty("dow_distribution")
    private Map<String, Double> dowDistribution;

    @JsonProperty("peak_day")
    private String peakDay;

    @JsonProperty("avg_daily_demand")
    private double avgDailyDemand;

    @JsonProperty("warning_flag")
    private boolean warningFlag;

    @JsonProperty("weather_forecast")
    private String weatherForecast;

    @JsonProperty("weather_impact")
    private String weatherImpact;
}
