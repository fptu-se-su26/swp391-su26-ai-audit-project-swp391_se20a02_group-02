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
 * Payload DTO sent to the Python ML sidecar for churn risk scoring.
 * Maps Java camelCase to Python snake_case via @JsonProperty.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomerDataPoint {

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("display_name")
    private String displayName;

    private String email;

    /** List of booking records with keys: bookingId, status, total, createdAt */
    private List<Map<String, Object>> bookings;
}
