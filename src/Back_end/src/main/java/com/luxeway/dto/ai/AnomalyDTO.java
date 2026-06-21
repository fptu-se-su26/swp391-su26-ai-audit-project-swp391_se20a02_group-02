package com.luxeway.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single anomaly detection record returned by the Python ML sidecar.
 * Contains date, metric type, Z-score, and severity classification.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AnomalyDTO {

    private String date;

    @JsonProperty("metric_type")
    private String metric;

    @JsonProperty("actual_value")
    private double actualValue;

    @JsonProperty("expected_value")
    private double expectedValue;

    @JsonProperty("z_score")
    private double zScore;

    private String severity;
}
