package com.luxeway.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionRecommendationDTO {
    private String id;
    private String title;
    private String description;
    private String priority; // HIGH, MEDIUM, LOW
    private String expectedImpact;
    private String actionLabel;
    private String actionType; // PRICING, MARKETING, FLEET, SYSTEM
}
