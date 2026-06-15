package com.luxeway.service.ai;

import com.luxeway.dto.ai.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Generates human-readable {@link InsightDTO} cards from a completed dashboard snapshot.
 *
 * Rules (per spec Task 12):
 * <ul>
 *   <li>REVENUE_FORECAST: trendDirection + trendSlope as % change per week.</li>
 *   <li>DEMAND_PEAK: peakDay name, INFO severity.</li>
 *   <li>CHURN_ALERT: WARNING if any score ≥ 60, CRITICAL if any ≥ 80.</li>
 *   <li>ANOMALY: WARNING/CRITICAL per anomaly in dashboard.anomalies().</li>
 *   <li>UTILIZATION: mention lowestCategory with current utilization rate.</li>
 *   <li>Fallback INFO insight when nothing notable.</li>
 *   <li>Sort: CRITICAL → WARNING → INFO; within same severity sort by confidence.</li>
 *   <li>Cap at 8 entries.</li>
 * </ul>
 */
@Slf4j
@Service
public class InsightGeneratorService {

    private static final int MAX_INSIGHTS = 8;

    public List<InsightDTO> generateInsights(AIPredictiveDashboardDTO dashboard) {
        if (dashboard == null) return Collections.emptyList();

        List<InsightDTO> insights = new ArrayList<>();

        // ---- Revenue Forecast ----
        RevenueForecastDTO rev = dashboard.getRevenueForecast();
        if (rev != null) {
            String dir = rev.getTrendDirection() != null ? rev.getTrendDirection() : "STABLE";
            double weeklyChange = rev.getTrendSlope() * 7.0;
            double pct = rev.getPredictions() != null && !rev.getPredictions().isEmpty()
                    && rev.getPredictions().get(0).getPredictedRevenue() != null
                    && rev.getPredictions().get(0).getPredictedRevenue() > 0
                    ? (weeklyChange / rev.getPredictions().get(0).getPredictedRevenue()) * 100.0
                    : 0.0;
            String severity = "UP".equals(dir) ? "INFO" : "DOWN".equals(dir) ? "WARNING" : "INFO";
            String title = "Revenue Trend: " + dir;
            String description = String.format(
                    "Revenue is trending %s with a slope of %.1f VND/day (~%.1f%% change per week). R² score: %.2f.",
                    dir.toLowerCase(), rev.getTrendSlope(), pct, rev.getR2Score());
            insights.add(InsightDTO.builder()
                    .type("REVENUE_FORECAST")
                    .title(truncate(title, 100))
                    .description(truncate(description, 500))
                    .severity(severity)
                    .confidence(rev.getR2Score())
                    .actionLabel("View Revenue Forecast")
                    .build());
        }

        // ---- Demand Peak ----
        BookingDemandDTO demand = dashboard.getBookingDemand();
        if (demand != null && demand.getPeakDay() != null) {
            String title = "Peak Demand: " + demand.getPeakDay();
            String description = String.format(
                    "Highest booking demand is expected on %s. Average daily demand: %.1f bookings/day.",
                    demand.getPeakDay(), demand.getAvgDailyDemand());
            insights.add(InsightDTO.builder()
                    .type("DEMAND_PEAK")
                    .title(truncate(title, 100))
                    .description(truncate(description, 500))
                    .severity("INFO")
                    .confidence(0.8)
                    .actionLabel("View Demand Forecast")
                    .build());
        }

        // ---- Churn Alert ----
        List<ChurnRiskDTO> churnList = dashboard.getChurnRisks();
        if (churnList != null && !churnList.isEmpty()) {
            long criticalCount = churnList.stream().filter(c -> c.getChurnScore() >= 80).count();
            long highCount = churnList.stream().filter(c -> c.getChurnScore() >= 60).count();
            if (highCount > 0) {
                String severity = criticalCount > 0 ? "CRITICAL" : "WARNING";
                String title = criticalCount > 0
                        ? criticalCount + " Customer(s) at Critical Churn Risk"
                        : highCount + " Customer(s) at High Churn Risk";
                String description = String.format(
                        "%d customers have a churn score ≥ 60 (including %d with score ≥ 80). Immediate re-engagement recommended.",
                        highCount, criticalCount);
                double maxScore = churnList.stream().mapToDouble(ChurnRiskDTO::getChurnScore).max().orElse(0.0);
                insights.add(InsightDTO.builder()
                        .type("CHURN_ALERT")
                        .title(truncate(title, 100))
                        .description(truncate(description, 500))
                        .severity(severity)
                        .confidence(maxScore / 100.0)
                        .actionLabel("View Churn Risks")
                        .build());
            }
        }

        // ---- Anomaly Insights ----
        List<AnomalyDTO> anomalies = dashboard.getAnomalies();
        if (anomalies != null) {
            for (AnomalyDTO anomaly : anomalies) {
                String sev = "CRITICAL".equals(anomaly.getSeverity()) ? "CRITICAL" : "WARNING";
                String title = sev + " Anomaly: " + anomaly.getMetric() + " on " + anomaly.getDate();
                String description = String.format(
                        "Anomaly detected in %s on %s. Actual: %.0f vs expected: %.0f (z-score: %.2f).",
                        anomaly.getMetric(), anomaly.getDate(),
                        anomaly.getActualValue(), anomaly.getExpectedValue(), anomaly.getZScore());
                insights.add(InsightDTO.builder()
                        .type("ANOMALY")
                        .title(truncate(title, 100))
                        .description(truncate(description, 500))
                        .severity(sev)
                        .confidence(Math.min(1.0, Math.abs(anomaly.getZScore()) / 5.0))
                        .actionLabel("Investigate Anomaly")
                        .build());
            }
        }

        // ---- Utilization Insight ----
        VehicleUtilizationDTO util = dashboard.getVehicleUtilization();
        if (util != null && util.getLowestCategory() != null) {
            double rate = util.getCurrentRates() != null
                    ? util.getCurrentRates().getOrDefault(util.getLowestCategory(), 0.0)
                    : 0.0;
            String title = "Low Utilization: " + util.getLowestCategory();
            String description = String.format(
                    "Vehicle category '%s' has the lowest utilization rate at %.1f%%. Consider promotional pricing to boost bookings.",
                    util.getLowestCategory(), rate * 100.0);
            insights.add(InsightDTO.builder()
                    .type("UTILIZATION")
                    .title(truncate(title, 100))
                    .description(truncate(description, 500))
                    .severity("INFO")
                    .confidence(1.0 - rate)
                    .actionLabel("View Utilization")
                    .build());
        }

        // ---- Fallback INFO (no notable events) ----
        boolean hasChurnAlerts = churnList != null && churnList.stream().anyMatch(c -> c.getChurnScore() >= 60);
        boolean hasAnomalies = anomalies != null && !anomalies.isEmpty();
        boolean isStableTrend = rev == null || "STABLE".equals(rev.getTrendDirection());
        if (!hasChurnAlerts && !hasAnomalies && isStableTrend) {
            insights.add(InsightDTO.builder()
                    .type("PLATFORM_STATUS")
                    .title("Platform Metrics are Stable")
                    .description("Platform metrics are stable. No anomalies, churn risks, or revenue concerns detected.")
                    .severity("INFO")
                    .confidence(1.0)
                    .actionLabel(null)
                    .build());
        }

        // Sort: CRITICAL → WARNING → INFO; within same severity sort by confidence desc
        insights.sort(Comparator
                .comparingInt(InsightGeneratorService::severityOrder)
                .thenComparingDouble(i -> -i.getConfidence()));

        return insights.stream().limit(MAX_INSIGHTS).collect(Collectors.toList());
    }

    private static int severityOrder(InsightDTO insight) {
        return switch (insight.getSeverity()) {
            case "CRITICAL" -> 0;
            case "WARNING" -> 1;
            default -> 2; // INFO
        };
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }
}
