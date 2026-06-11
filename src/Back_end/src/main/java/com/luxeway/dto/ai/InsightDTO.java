package com.luxeway.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * An AI-generated insight card surfaced on the admin dashboard.
 * Title ≤ 100 chars, description ≤ 500 chars.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightDTO {

    /** Unique category key (REVENUE_FORECAST, DEMAND_PEAK, CHURN_ALERT, ANOMALY, UTILIZATION). */
    private String type;

    /** Short title, max 100 chars. */
    private String title;

    /** Detailed human-readable description, max 500 chars. */
    private String description;

    /** Severity: INFO, WARNING, CRITICAL. */
    private String severity;

    /** Confidence value in [0.0, 1.0] used for sorting. */
    private double confidence;

    /** CTA button label shown on the insight card (optional). */
    private String actionLabel;
}
