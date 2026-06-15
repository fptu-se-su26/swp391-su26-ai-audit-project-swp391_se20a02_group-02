package com.luxeway.agent.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

/**
 * FleetActionPlan — the synthesised output of the FleetOptimizationOrchestrator.
 * Mirrors the Python FleetActionPlan Pydantic model.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetActionPlan {

    @JsonProperty("plan_id")
    private String planId;

    @JsonProperty("generated_at")
    private String generatedAt;

    @JsonProperty("valid_until")
    private String validUntil;

    // ── High-level KPIs ──────────────────────────────────────────────────────

    @JsonProperty("vehicle_type")
    private String vehicleType;

    @JsonProperty("expected_demand_increase")
    private Double expectedDemandIncrease;

    @JsonProperty("recommended_price_increase")
    private Double recommendedPriceIncrease;

    @JsonProperty("vehicles_to_relocate")
    private Integer vehiclesToRelocate;

    @JsonProperty("vip_discount")
    private Boolean vipDiscount;

    // ── Sub-plans ────────────────────────────────────────────────────────────

    private List<VehicleRelocation> relocations;

    @JsonProperty("pricing_actions")
    private List<PricingAction> pricingActions;

    @JsonProperty("churn_campaigns")
    private List<ChurnCampaignAction> churnCampaigns;

    // ── Health ───────────────────────────────────────────────────────────────

    @JsonProperty("system_health")
    private String systemHealth;

    @JsonProperty("active_anomalies")
    private Integer activeAnomalies;

    @JsonProperty("confidence_score")
    private Double confidenceScore;

    @JsonProperty("requires_human_review")
    private Boolean requiresHumanReview;

    @JsonProperty("review_reason")
    private String reviewReason;

    @JsonProperty("synthesis_reasoning")
    private String synthesisReasoning;

    // ── Inner DTOs ───────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VehicleRelocation {
        @JsonProperty("vehicle_type") private String vehicleType;
        @JsonProperty("from_location") private String fromLocation;
        @JsonProperty("to_location") private String toLocation;
        private Integer count;
        private String reason;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PricingAction {
        @JsonProperty("vehicle_type") private String vehicleType;
        @JsonProperty("current_price") private Double currentPrice;
        @JsonProperty("recommended_price") private Double recommendedPrice;
        @JsonProperty("change_pct") private Double changePct;
        @JsonProperty("valid_until") private String validUntil;
        private String rationale;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChurnCampaignAction {
        @JsonProperty("customer_ids") private List<String> customerIds;
        @JsonProperty("campaign_type") private String campaignType;
        @JsonProperty("discount_pct") private Double discountPct;
        @JsonProperty("estimated_retention_rate") private Double estimatedRetentionRate;
    }
}
