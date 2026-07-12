package com.luxeway.service.ai;

import com.luxeway.dto.ai.*;
import com.luxeway.entity.Analytics;
import com.luxeway.entity.Booking;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.AnalyticsRepository;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Orchestrates parallel ML prediction calls and assembles the dashboard snapshot.
 *
 * Data flow (per spec Task 11):
 * <ol>
 *   <li>Fetch 90-day analytics from {@link AnalyticsRepository}.</li>
 *   <li>Fetch bookings, vehicles, and customers from their repositories.</li>
 *   <li>Build JSON payloads and fire 5 {@link CompletableFuture#supplyAsync} calls in parallel.</li>
 *   <li>Assemble {@link AIPredictiveDashboardDTO} after all futures complete.</li>
 *   <li>Call {@link InsightGeneratorService#generateInsights} to enrich the dashboard.</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIPredictiveService {

    private final AnalyticsRepository analyticsRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final MLSidecarClient sidecarClient;
    private final InsightGeneratorService insightGenerator;

    private static final int FORECAST_HORIZON = 14;

    /**
     * Builds a full {@link AIPredictiveDashboardDTO} by fetching recent platform data
     * and firing all ML prediction tasks in parallel.
     *
     * @return assembled dashboard snapshot, never null.
     */
    public AIPredictiveDashboardDTO buildDashboard() {
        log.info("AIPredictiveService: building AI predictive dashboard");

        // ---- Fetch 90-day analytics ----
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(89);
        List<Analytics> analyticsList = analyticsRepository
                .findByRecordDateBetweenOrderByRecordDateAsc(startDate, endDate);

        List<AnalyticsDataPoint> analyticsPayload = analyticsList.stream()
                .map(a -> AnalyticsDataPoint.builder()
                        .date(a.getRecordDate().toString())
                        .revenue(a.getRevenue() != null ? a.getRevenue().doubleValue() : 0.0)
                        .bookingsCount(a.getBookingsCount() != null ? a.getBookingsCount() : 0)
                        .build())
                .collect(Collectors.toList());

        // ---- Fetch vehicles (for utilization) ----
        List<Vehicle> vehicles = vehicleRepository.findAll();
        Map<String, List<Double>> utilizationByCategory = buildUtilizationMap(vehicles);

        // ---- Fetch customers with bookings (for churn) ----
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().name().equals("CUSTOMER"))
                .collect(Collectors.toList());
        List<Booking> allBookings = bookingRepository.findAll();
        List<CustomerDataPoint> churnPayload = buildChurnPayload(customers, allBookings);

        // Platform averages for churn scoring
        double platformAvgFreq = churnPayload.stream()
                .mapToLong(c -> c.getBookings() != null ? c.getBookings().size() : 0)
                .average().orElse(1.0);
        double platformAvgSpend = churnPayload.stream()
                .mapToDouble(c -> c.getBookings() != null ? c.getBookings().stream()
                        .mapToDouble(b -> {
                            Object total = b.get("total");
                            return total instanceof Number ? ((Number) total).doubleValue() : 0.0;
                        }).sum() : 0.0)
                .average().orElse(1.0);

        // ---- Fire 5 parallel ML calls ----
        CompletableFuture<RevenueForecastDTO> revFuture = CompletableFuture.supplyAsync(
                () -> sidecarClient.forecastRevenue(analyticsPayload, FORECAST_HORIZON));
        CompletableFuture<BookingDemandDTO> demandFuture = CompletableFuture.supplyAsync(
                () -> sidecarClient.forecastDemand(analyticsPayload, FORECAST_HORIZON));
        CompletableFuture<VehicleUtilizationDTO> utilFuture = CompletableFuture.supplyAsync(
                () -> sidecarClient.forecastUtilization(utilizationByCategory, 7));
        CompletableFuture<List<ChurnRiskDTO>> churnFuture = CompletableFuture.supplyAsync(
                () -> sidecarClient.scoreChurn(churnPayload, platformAvgFreq, platformAvgSpend));
        CompletableFuture<List<AnomalyDTO>> anomalyFuture = CompletableFuture.supplyAsync(
                () -> sidecarClient.detectAnomalies(analyticsPayload));

        // Wait for all futures
        CompletableFuture.allOf(revFuture, demandFuture, utilFuture, churnFuture, anomalyFuture).join();

        RevenueForecastDTO revResult = getOrNull(revFuture);
        BookingDemandDTO demandResult = getOrNull(demandFuture);
        VehicleUtilizationDTO utilResult = getOrNull(utilFuture);
        List<ChurnRiskDTO> churnResult = getOrEmpty(churnFuture);
        List<AnomalyDTO> anomalyResult = getOrEmpty(anomalyFuture);

        boolean sidecarWarning = (revResult != null && revResult.isWarningFlag())
                || (demandResult != null && demandResult.isWarningFlag())
                || (utilResult != null && utilResult.isWarningFlag());

        AIPredictiveDashboardDTO dashboard = AIPredictiveDashboardDTO.builder()
                .revenueForecast(revResult)
                .bookingDemand(demandResult)
                .vehicleUtilization(utilResult)
                .churnRisks(churnResult)
                .anomalies(anomalyResult)
                .generatedAt(Instant.now())
                .sidecarWarning(sidecarWarning)
                .build();

        // Generate insights
        List<InsightDTO> insights = insightGenerator.generateInsights(dashboard);
        dashboard.setInsights(insights);

        log.info("AIPredictiveService: dashboard assembled (sidecarWarning={})", sidecarWarning);
        return dashboard;
    }

    // ---------------------------------------------------------------- helpers

    /**
     * Groups vehicles by category and computes a utilization rate series
     * (ratio of bookings to capacity per period, simplified as booking count / max).
     */
    private Map<String, List<Double>> buildUtilizationMap(List<Vehicle> vehicles) {
        Map<String, List<Double>> map = new LinkedHashMap<>();
        for (Vehicle v : vehicles) {
            String category = v.getCategory() != null ? v.getCategory().name() : "UNKNOWN";
            double rate = v.getStatus() == VehicleStatus.AVAILABLE ? 0.3
                    : v.getStatus() == VehicleStatus.RENTED ? 1.0 : 0.0;
            map.computeIfAbsent(category, k -> new ArrayList<>()).add(rate);
        }
        return map;
    }

    /** Builds CustomerDataPoint payload from user + booking data. */
    private List<CustomerDataPoint> buildChurnPayload(List<User> customers, List<Booking> allBookings) {
        Map<String, List<Booking>> bookingsByRenter = allBookings.stream()
                .filter(b -> b.getRenter() != null)
                .collect(Collectors.groupingBy(b -> b.getRenter().getId()));

        return customers.stream().map(u -> {
            List<Booking> userBookings = bookingsByRenter.getOrDefault(u.getId(), Collections.emptyList());
            List<Map<String, Object>> bookingMaps = userBookings.stream().map(b -> {
                Map<String, Object> bm = new HashMap<>();
                bm.put("bookingId", b.getId());
                bm.put("status", b.getStatus().name());
                bm.put("total", b.getTotal() != null ? b.getTotal().doubleValue() : 0.0);
                bm.put("createdAt", b.getCreatedAt() != null ? b.getCreatedAt().toString() : "");
                return bm;
            }).collect(Collectors.toList());

            return CustomerDataPoint.builder()
                    .userId(u.getId())
                    .displayName(u.getDisplayName() != null ? u.getDisplayName() : u.getFullName())
                    .email(u.getEmail())
                    .bookings(bookingMaps)
                    .build();
        }).collect(Collectors.toList());
    }

    private <T> T getOrNull(CompletableFuture<T> future) {
        try { return future.get(); } catch (Exception ex) {
            log.warn("ML future failed: {}", ex.getMessage()); return null;
        }
    }

    private <T> List<T> getOrEmpty(CompletableFuture<List<T>> future) {
        try {
            List<T> result = future.get();
            return result != null ? result : Collections.emptyList();
        } catch (Exception ex) {
            log.warn("ML future (list) failed: {}", ex.getMessage()); return Collections.emptyList();
        }
    }
}
