package com.luxeway.controller;

import com.luxeway.dto.ai.*;
import com.luxeway.entity.Booking;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.repository.AnalyticsRepository;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import com.luxeway.service.ai.MLSidecarClient;
import com.luxeway.service.ai.PredictionCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * REST controller exposing all AI Predictive Analytics endpoints.
 *
 * All routes are protected — only ADMIN or SUPER_ADMIN may call them.
 * POST endpoints are subject to per-admin rate limiting: ≤ 10 requests per 60 seconds.
 */
@Slf4j
@RestController
@RequestMapping("/admin/ai")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@RequiredArgsConstructor
public class AIPredictiveController {

    private final PredictionCacheService cacheService;
    private final MLSidecarClient sidecarClient;
    private final AnalyticsRepository analyticsRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    // ---- Per-admin rate limiting: max 10 POST requests within 60 seconds ----
    private final ConcurrentHashMap<String, Deque<Long>> rateLimitMap = new ConcurrentHashMap<>();
    private static final int RATE_LIMIT = 10;
    private static final long WINDOW_MS = 60_000L;

    // ---------------------------------------------------------------- GET /dashboard

    /**
     * Returns the cached dashboard snapshot.
     * If the cache is not yet populated (still warming up), returns HTTP 202 with a
     * placeholder insight informing the client to retry.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        AIPredictiveDashboardDTO cached = cacheService.getCached();
        if (cached == null) {
            AIPredictiveDashboardDTO warming = AIPredictiveDashboardDTO.builder()
                    .insights(List.of(InsightDTO.builder()
                            .type("SYSTEM")
                            .title("Dashboard is warming up")
                            .description("The AI predictive dashboard is being computed. Please try again in a moment.")
                            .severity("INFO")
                            .confidence(0.0)
                            .build()))
                    .generatedAt(java.time.Instant.now())
                    .sidecarWarning(false)
                    .build();
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(warming);
        }
        return ResponseEntity.ok(cached);
    }

    // ---------------------------------------------------------------- POST /revenue/forecast

    @PostMapping("/revenue/forecast")
    public ResponseEntity<?> revenueForecast(
            @RequestParam(defaultValue = "14") int horizon,
            Authentication auth) {
        if (horizon < 1 || horizon > 30) {
            return ResponseEntity.badRequest().body(Map.of("error", "horizon must be between 1 and 30"));
        }
        ResponseEntity<?> rateCheck = checkRateLimit(auth);
        if (rateCheck != null) return rateCheck;

        List<AnalyticsDataPoint> data = fetchAnalyticsPayload();
        RevenueForecastDTO result = sidecarClient.forecastRevenue(data, horizon);
        return ResponseEntity.ok(result);
    }

    // ---------------------------------------------------------------- POST /bookings/demand

    @PostMapping("/bookings/demand")
    public ResponseEntity<?> bookingDemand(
            @RequestParam(defaultValue = "14") int horizon,
            Authentication auth) {
        if (horizon < 1 || horizon > 30) {
            return ResponseEntity.badRequest().body(Map.of("error", "horizon must be between 1 and 30"));
        }
        ResponseEntity<?> rateCheck = checkRateLimit(auth);
        if (rateCheck != null) return rateCheck;

        List<AnalyticsDataPoint> data = fetchAnalyticsPayload();
        BookingDemandDTO result = sidecarClient.forecastDemand(data, horizon);
        return ResponseEntity.ok(result);
    }

    // ---------------------------------------------------------------- POST /vehicles/utilization

    @PostMapping("/vehicles/utilization")
    public ResponseEntity<?> vehicleUtilization(
            @RequestParam(defaultValue = "7") int days,
            Authentication auth) {
        ResponseEntity<?> rateCheck = checkRateLimit(auth);
        if (rateCheck != null) return rateCheck;

        List<Vehicle> vehicles = vehicleRepository.findAll();
        Map<String, List<Double>> byCategory = new LinkedHashMap<>();
        for (Vehicle v : vehicles) {
            String cat = v.getCategory() != null ? v.getCategory().name() : "UNKNOWN";
            double rate = switch (v.getStatus()) {
                case RENTED -> 1.0;
                case AVAILABLE -> 0.3;
                default -> 0.0;
            };
            byCategory.computeIfAbsent(cat, k -> new ArrayList<>()).add(rate);
        }
        VehicleUtilizationDTO result = sidecarClient.forecastUtilization(byCategory, days);
        return ResponseEntity.ok(result);
    }

    // ---------------------------------------------------------------- GET /users/churn

    @GetMapping("/users/churn")
    public ResponseEntity<List<ChurnRiskDTO>> usersChurn() {
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().name().equals("CUSTOMER"))
                .collect(Collectors.toList());
        List<Booking> allBookings = bookingRepository.findAll();
        Map<String, List<Booking>> byRenter = allBookings.stream()
                .filter(b -> b.getRenter() != null)
                .collect(Collectors.groupingBy(b -> b.getRenter().getId()));

        List<CustomerDataPoint> payload = customers.stream().map(u -> {
            List<Booking> userBkgs = byRenter.getOrDefault(u.getId(), Collections.emptyList());
            List<Map<String, Object>> bkgMaps = userBkgs.stream().map(b -> {
                Map<String, Object> m = new HashMap<>();
                m.put("bookingId", b.getId());
                m.put("status", b.getStatus().name());
                m.put("total", b.getTotal() != null ? b.getTotal().doubleValue() : 0.0);
                m.put("createdAt", b.getCreatedAt() != null ? b.getCreatedAt().toString() : "");
                return m;
            }).collect(Collectors.toList());
            return CustomerDataPoint.builder()
                    .userId(u.getId())
                    .displayName(u.getDisplayName() != null ? u.getDisplayName() : u.getFullName())
                    .email(u.getEmail())
                    .bookings(bkgMaps)
                    .build();
        }).collect(Collectors.toList());

        double avgFreq = payload.stream()
                .mapToLong(c -> c.getBookings() != null ? c.getBookings().size() : 0)
                .average().orElse(1.0);
        double avgSpend = payload.stream()
                .mapToDouble(c -> c.getBookings() != null ? c.getBookings().stream()
                        .mapToDouble(b -> {
                            Object t = b.get("total");
                            return t instanceof Number ? ((Number) t).doubleValue() : 0.0;
                        }).sum() : 0.0)
                .average().orElse(1.0);

        List<ChurnRiskDTO> result = sidecarClient.scoreChurn(payload, avgFreq, avgSpend);
        return ResponseEntity.ok(result);
    }

    // ---------------------------------------------------------------- GET /anomalies

    @GetMapping("/anomalies")
    public ResponseEntity<List<AnomalyDTO>> anomalies() {
        List<AnalyticsDataPoint> data = fetchAnalyticsPayload();
        List<AnomalyDTO> result = sidecarClient.detectAnomalies(data);
        return ResponseEntity.ok(result);
    }

    // ---------------------------------------------------------------- GET /insights

    @GetMapping("/insights")
    public ResponseEntity<List<InsightDTO>> insights() {
        AIPredictiveDashboardDTO cached = cacheService.getCached();
        if (cached == null || cached.getInsights() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(cached.getInsights());
    }

    // ---------------------------------------------------------------- GET /analytics/payload

    @GetMapping("/analytics/payload")
    public ResponseEntity<List<AnalyticsDataPoint>> getAnalyticsPayload() {
        return ResponseEntity.ok(fetchAnalyticsPayload());
    }

    private List<AnalyticsDataPoint> fetchAnalyticsPayload() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(89);
        return analyticsRepository.findByRecordDateBetweenOrderByRecordDateAsc(start, end)
                .stream()
                .map(a -> AnalyticsDataPoint.builder()
                        .date(a.getRecordDate().toString())
                        .revenue(a.getRevenue() != null ? a.getRevenue().doubleValue() : 0.0)
                        .bookingsCount(a.getBookingsCount() != null ? a.getBookingsCount() : 0)
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Sliding-window per-admin rate limiter for POST endpoints.
     */
    @GetMapping("/rate-limit/status")
    public ResponseEntity<?> getRateLimitStatus(Authentication auth) {
        if (auth == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        ResponseEntity<?> rateCheck = checkRateLimit(auth);
        if (rateCheck != null) return rateCheck;
        return ResponseEntity.ok(Map.of("allowed", true));
    }

    private ResponseEntity<?> checkRateLimit(Authentication auth) {
        if (auth == null) return null;
        String subject = auth.getName();
        long now = System.currentTimeMillis();
        Deque<Long> timestamps = rateLimitMap.computeIfAbsent(subject, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            // Remove timestamps older than 60 seconds
            timestamps.removeIf(ts -> now - ts > WINDOW_MS);
            if (timestamps.size() >= RATE_LIMIT) {
                log.warn("Rate limit exceeded for admin: {}", subject);
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of("error", "Rate limit exceeded: max " + RATE_LIMIT + " POST requests per 60 seconds"));
            }
            timestamps.addLast(now);
        }
        return null;
    }
}
