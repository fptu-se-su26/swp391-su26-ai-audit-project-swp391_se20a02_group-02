package com.luxeway.service.ai;

import com.luxeway.dto.ai.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

/**
 * Pure-Java fallback implementation of all ML forecast types.
 * Uses a simple 7-day Simple Moving Average (SMA) for all forecasts.
 * All returned DTOs carry {@code warningFlag = true}.
 */
@Slf4j
@Service
public class JavaFallbackService {

    // ---------------------------------------------------------------- revenue

    public RevenueForecastDTO forecastRevenue(List<AnalyticsDataPoint> data, int horizon) {
        log.info("JavaFallbackService: computing SMA revenue forecast (horizon={})", horizon);
        List<Double> revenues = data.stream().map(AnalyticsDataPoint::getRevenue).toList();
        double sma = sma7(revenues);

        List<ForecastPoint> predictions = new ArrayList<>();
        LocalDate startDate = LocalDate.now();
        for (int i = 0; i < horizon; i++) {
            predictions.add(ForecastPoint.builder()
                    .date(startDate.plusDays(i + 1))
                    .predictedRevenue(Math.max(0.0, sma))
                    .lowerBound(Math.max(0.0, sma * 0.85))
                    .upperBound(sma * 1.15)
                    .build());
        }
        return RevenueForecastDTO.builder()
                .predictions(predictions)
                .r2Score(0.0)
                .trendSlope(0.0)
                .trendDirection("STABLE")
                .warningFlag(true)
                .build();
    }

    // ---------------------------------------------------------------- demand

    public BookingDemandDTO forecastDemand(List<AnalyticsDataPoint> data, int horizon) {
        log.info("JavaFallbackService: computing SMA demand forecast (horizon={})", horizon);
        List<Double> counts = data.stream().map(d -> (double) d.getBookingsCount()).toList();
        double sma = sma7(counts);

        List<ForecastPoint> forecasts = new ArrayList<>();
        LocalDate startDate = LocalDate.now();
        for (int i = 0; i < horizon; i++) {
            forecasts.add(ForecastPoint.builder()
                    .date(startDate.plusDays(i + 1))
                    .predictedBookings(Math.max(0.0, sma))
                    .lowerBound(Math.max(0.0, sma * 0.85))
                    .upperBound(sma * 1.15)
                    .build());
        }

        Map<String, Double> dow = new LinkedHashMap<>();
        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
        for (String d : days) dow.put(d, 1.0 / 7.0);

        return BookingDemandDTO.builder()
                .dailyForecasts(forecasts)
                .dowDistribution(dow)
                .peakDay("FRIDAY")
                .avgDailyDemand(sma)
                .warningFlag(true)
                .build();
    }

    // ---------------------------------------------------------------- utilization

    public VehicleUtilizationDTO forecastUtilization(Map<String, List<Double>> byCategory, int forecastDays) {
        log.info("JavaFallbackService: computing flat utilization forecast (days={})", forecastDays);
        Map<String, List<ForecastPoint>> forecastMap = new LinkedHashMap<>();
        Map<String, Double> currentRates = new LinkedHashMap<>();

        for (Map.Entry<String, List<Double>> entry : byCategory.entrySet()) {
            String category = entry.getKey();
            List<Double> values = entry.getValue();
            double avg = values.isEmpty() ? 0.5 : values.stream().mapToDouble(Double::doubleValue).average().orElse(0.5);
            avg = Math.max(0.0, Math.min(1.0, avg));
            currentRates.put(category, avg);

            List<ForecastPoint> pts = new ArrayList<>();
            LocalDate start = LocalDate.now();
            final double finalAvg = avg;
            for (int i = 0; i < forecastDays; i++) {
                pts.add(ForecastPoint.builder()
                        .date(start.plusDays(i + 1))
                        .predicted(finalAvg)
                        .lowerBound(Math.max(0.0, finalAvg - 0.05))
                        .upperBound(Math.min(1.0, finalAvg + 0.05))
                        .build());
            }
            forecastMap.put(category, pts);
        }

        String lowest = currentRates.entrySet().stream()
                .min(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");
        String highest = currentRates.entrySet().stream()
                .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A");

        return VehicleUtilizationDTO.builder()
                .byCategory(forecastMap)
                .currentRates(currentRates)
                .lowestCategory(lowest)
                .highestCategory(highest)
                .warningFlag(true)
                .build();
    }

    // ---------------------------------------------------------------- churn

    public List<ChurnRiskDTO> scoreChurn(List<CustomerDataPoint> customers) {
        log.info("JavaFallbackService: scoring churn for {} customers", customers.size());
        List<ChurnRiskDTO> results = new ArrayList<>();
        for (CustomerDataPoint c : customers) {
            results.add(ChurnRiskDTO.builder()
                    .userId(c.getUserId())
                    .displayName(c.getDisplayName())
                    .email(c.getEmail())
                    .churnScore(50.0)
                    .riskLevel("MEDIUM")
                    .recencyDays(90)
                    .totalBookings(c.getBookings() != null ? c.getBookings().size() : 0)
                    .totalSpend(0.0)
                    .daysSinceLastBooking(90)
                    .build());
        }
        results.sort(Comparator.comparingDouble(ChurnRiskDTO::getChurnScore).reversed());
        return results.stream().limit(50).toList();
    }

    // ---------------------------------------------------------------- anomaly

    public List<AnomalyDTO> detectAnomalies(List<AnalyticsDataPoint> data) {
        // Fallback: no anomaly detection capability, return empty list
        log.info("JavaFallbackService: anomaly detection not available, returning empty list");
        return Collections.emptyList();
    }

    // ---------------------------------------------------------------- helper

    private double sma7(List<Double> values) {
        if (values.isEmpty()) return 0.0;
        int from = Math.max(0, values.size() - 7);
        return values.subList(from, values.size()).stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }
}
