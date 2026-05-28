package com.luxeway.service;

import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import com.luxeway.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class StatisticService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public Map<String, Object> getLandingPageStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalVehicles = vehicleRepository.count();
        long totalClients = userRepository.count();
        
        // Count distinct cities from vehicles
        long totalProvinces = 0;
        try {
            totalProvinces = vehicleRepository.countDistinctCity();
        } catch (Exception e) {}

        double averageRating = 0.0;
        try {
            Double avg = reviewRepository.getAverageRating();
            if (avg != null) {
                averageRating = Math.round(avg * 100.0) / 100.0;
            }
        } catch (Exception e) {}

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
