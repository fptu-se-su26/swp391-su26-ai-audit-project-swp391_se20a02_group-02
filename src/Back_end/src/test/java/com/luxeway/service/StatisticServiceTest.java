package com.luxeway.service;

import com.luxeway.enums.VehicleCategory;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.ReviewRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatisticServiceTest {

    @Mock private VehicleRepository vehicleRepository;
    @Mock private UserRepository userRepository;
    @Mock private ReviewRepository reviewRepository;

    @InjectMocks
    private StatisticService statisticService;

    @Test
    void getLandingPageStats_ValidData_ReturnsCorrectStats() {
        // Given
        when(vehicleRepository.count()).thenReturn(150L);
        when(userRepository.count()).thenReturn(500L);
        when(vehicleRepository.countDistinctCity()).thenReturn(10L);
        when(reviewRepository.getAverageRating()).thenReturn(4.567);
        
        when(vehicleRepository.countByCategoryAndStatus(any(VehicleCategory.class), any(VehicleStatus.class)))
            .thenReturn(5L);

        // When
        Map<String, Object> stats = statisticService.getLandingPageStats();

        // Then
        assertEquals(150L, stats.get("qualityVehicles"));
        assertEquals(500L, stats.get("happyClients"));
        assertEquals(10L, stats.get("provinces"));
        assertEquals(4.57, (Double) stats.get("averageRating"), 0.001);

        @SuppressWarnings("unchecked")
        Map<String, Long> categoryCounts = (Map<String, Long>) stats.get("categoryCounts");
        assertEquals(VehicleCategory.values().length, categoryCounts.size());
        assertTrue(categoryCounts.containsKey(VehicleCategory.SEDAN.name().toLowerCase()));
        assertEquals(5L, categoryCounts.get(VehicleCategory.SEDAN.name().toLowerCase()));
    }

    @Test
    void getLandingPageStats_NullRatingAndException_HandlesGracefully() {
        // Given
        when(vehicleRepository.count()).thenReturn(150L);
        when(userRepository.count()).thenReturn(500L);
        when(vehicleRepository.countDistinctCity()).thenThrow(new RuntimeException("DB error"));
        when(reviewRepository.getAverageRating()).thenReturn(null);

        // When
        Map<String, Object> stats = statisticService.getLandingPageStats();

        // Then
        assertEquals(0L, stats.get("provinces"));
        assertEquals(0.0, (Double) stats.get("averageRating"), 0.0);
    }
}
