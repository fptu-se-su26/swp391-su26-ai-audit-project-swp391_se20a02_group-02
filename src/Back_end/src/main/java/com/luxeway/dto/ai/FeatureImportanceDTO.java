package com.luxeway.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureImportanceDTO {
    private String key;
    private String label;
    private int importancePercentage;
    private String impactDirection; // POSITIVE or NEGATIVE
    private String description;
}
