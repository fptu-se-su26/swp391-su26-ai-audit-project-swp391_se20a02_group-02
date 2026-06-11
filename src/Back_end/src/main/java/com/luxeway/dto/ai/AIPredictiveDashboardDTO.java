package com.luxeway.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Top-level DTO returned by GET /admin/ai/dashboard.
 * Aggregates all ML prediction sub-results for the admin panel.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIPredictiveDashboardDTO {

    private RevenueForecastDTO revenueForecast;

    private BookingDemandDTO bookingDemand;

    private VehicleUtilizationDTO vehicleUtilization;

    private List<ChurnRiskDTO> churnRisks;

    private List<AnomalyDTO> anomalies;

    private List<InsightDTO> insights;

    /** Timestamp of when this snapshot was assembled. */
    private Instant generatedAt;

    /**
     * True when any sub-result used the Java fallback SMA instead of
     * the Python sidecar (sidecar was unreachable or returned an error).
     */
    private boolean sidecarWarning;
}
