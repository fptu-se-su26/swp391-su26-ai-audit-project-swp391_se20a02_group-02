package com.luxeway.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single churn risk record returned by the Python ML sidecar.
 * Contains user identification and RFM-based scoring metrics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChurnRiskDTO {

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("display_name")
    private String displayName;

    private String email;

    @JsonProperty("churn_score")
    private double churnScore;

    @JsonProperty("risk_level")
    private String riskLevel;

    @JsonProperty("recency_days")
    private int recencyDays;

    @JsonProperty("total_bookings")
    private int totalBookings;

    @JsonProperty("total_spend")
    private double totalSpend;

    @JsonProperty("days_since_last_booking")
    private int daysSinceLastBooking;
}
