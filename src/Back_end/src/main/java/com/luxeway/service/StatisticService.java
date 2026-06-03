package com.luxeway.service;

import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import com.luxeway.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

// BUG-16 FIX: Refactored to use @RequiredArgsConstructor (constructor injection) instead of @Autowired field injection.
// Constructor injection is the recommended pattern used throughout the rest of the codebase.
@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public Map<String, Object> getLandingPageStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalVehicles = vehicleRepository.count();
        long totalClients = userRepository.count();
        
        // Count distinct cities from vehicles
        long totalProvinces = 0;
        try {
            totalProvinces = vehicleRepository.countDistinctCity();
        } catch (Exception e) {
            log.warn("Failed to count distinct cities: {}", e.getMessage());
        }

        double averageRating = 0.0;
        try {
            Double avg = reviewRepository.getAverageRating();
            if (avg != null) {
                averageRating = Math.round(avg * 100.0) / 100.0;
            }
        } catch (Exception e) {
            log.warn("Failed to get average rating: {}", e.getMessage());
        }

        stats.put("qualityVehicles", totalVehicles);
        stats.put("provinces", totalProvinces);
        stats.put("happyClients", totalClients);
        stats.put("averageRating", averageRating);

        // Calculate dynamic vehicle counts per category
        Map<String, Long> categoryCounts = new HashMap<>();
        for (com.luxeway.enums.VehicleCategory category : com.luxeway.enums.VehicleCategory.values()) {
            categoryCounts.put(category.name().toLowerCase(), 
                vehicleRepository.countByCategoryAndStatus(category, com.luxeway.enums.VehicleStatus.AVAILABLE));
        }
        stats.put("categoryCounts", categoryCounts);

        return stats;
    }
}
