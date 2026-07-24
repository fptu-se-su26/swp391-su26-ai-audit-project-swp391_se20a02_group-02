package com.luxeway.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionDetailDTO {
    private String type;
    private String title;
    private String subtitle;
    
    // 1. Executive Summary
    private String summaryText;
    private String businessImpactText;
    private String urgency;
    private List<String> keyTakeaways;
    
    // 2. Business Impact
    private Double revenueOpportunity;
    private Double occupancyRate;
    private Integer bookingsDelta;
    private Double roiPercentage;
    private String trendDirection;
    
    // 3. Forecast Chart Points
    private List<ForecastPoint> forecastPoints;
    
    // 4. Model Telemetry Metrics
    private Double confidenceScore;
    private String confidenceRating;
    private String modelName;
    private Integer inferenceTimeMs;
    private Integer trainingWindowDays;
    private Double mape;
    private Double r2Score;
    
    // 5. Feature Importance Breakdown (XAI)
    private List<FeatureImportanceDTO> featureImportance;
    
    // 6. Action Recommendations
    private List<ActionRecommendationDTO> recommendations;
    
    // Data Lineage
    private List<String> dataSources;
}
