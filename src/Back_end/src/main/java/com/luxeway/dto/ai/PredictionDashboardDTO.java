package com.luxeway.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Unified Prediction Dashboard DTO shared between Backend & Frontend.
 * All prediction modal components read directly from this single DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionDashboardDTO {

    private SummaryPayload summary;
    private BusinessImpactPayload businessImpact;
    private List<ForecastPointPayload> forecast;
    private List<ForecastPointPayload> forecastChart; // Pre-calculated chart ready for render
    private ConfidencePayload confidence;
    private TelemetryPayload telemetry;
    private List<FeatureImportancePayload> featureImportance;
    private List<RecommendationPayload> recommendations;
    private ModelInformationPayload modelInformation;
    private ModelInformationPayload modelInfo; // Alias for modelInformation
    private List<HistoricalDataPayload> historicalData;
    private ConfidenceIntervalPayload confidenceInterval;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryPayload {
        private String title;
        private String summaryText;
        private String urgency; // IMMEDIATE, SEASONAL, ROUTINE
        private List<String> keyTakeaways;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusinessImpactPayload {
        private Double revenueOpportunity;
        private Double occupancyRate;
        private Integer bookingsDelta;
        private Double roiPercentage;
        private String trendDirection; // UP, DOWN, STABLE
        private String impactText;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastPointPayload {
        private String date;
        private Double actual;
        private Double predicted;
        private Double lowerBound;
        private Double upperBound;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfidencePayload {
        private Double score;
        private String rating; // HIGH, MEDIUM, LOW
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TelemetryPayload {
        private Integer inferenceTimeMs;
        private Integer trainingWindowDays;
        private Double mape;
        private Double r2Score;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeatureImportancePayload {
        private String key;
        private String label;
        private int importancePercentage;
        private String impactDirection; // POSITIVE or NEGATIVE
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationPayload {
        private String id;
        private String title;
        private String priority; // HIGH, MEDIUM, LOW
        private String reason; // AI reason / description
        private String description;
        private String impact; // Expected business impact
        private String expectedImpact;
        private String action; // Action button label
        private String actionLabel;
        private String actionType; // PRICING, MARKETING, FLEET, SYSTEM
        private String source; // Model / Engine source
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModelInformationPayload {
        private String modelName;
        private String version;
        private String algorithm;
        private String processing;
        private String input;
        private String output;
        private Double confidence;
        private Integer trainingWindow;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoricalDataPayload {
        private String date;
        private Double value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfidenceIntervalPayload {
        private Double lowerBound;
        private Double upperBound;
        private Double confidenceLevel; // e.g. 0.95
    }
}
