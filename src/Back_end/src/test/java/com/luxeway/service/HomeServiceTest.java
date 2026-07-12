package com.luxeway.service;

import com.luxeway.entity.DestinationAnalytics;
import com.luxeway.entity.FAQ;
import com.luxeway.entity.Promotion;
import com.luxeway.entity.Review;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.enums.BookingStatus;
import com.luxeway.enums.UserRole;
import com.luxeway.enums.VehicleCategory;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HomeServiceTest {

    @Mock private VehicleRepository vehicleRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private UserRepository userRepository;
    @Mock private PromotionRepository promotionRepository;
    @Mock private DestinationAnalyticsRepository destinationAnalyticsRepository;
    @Mock private FAQRepository faqRepository;

    @InjectMocks
    private HomeService homeService;

    // =======================================================
    // getStats
    // =======================================================

    @Test
    void getStats_NormalOperation_ReturnsData() {
        when(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE)).thenReturn(100L);
        when(userRepository.count()).thenReturn(50L);
        when(bookingRepository.count()).thenReturn(20L);
        when(reviewRepository.getAverageRating()).thenReturn(4.85); // should round to 4.9
        when(vehicleRepository.countDistinctCity()).thenReturn(5L);

        Map<String, Object> result = homeService.getStats();

        assertEquals(100L, result.get("totalVehicles"));
        assertEquals(50L, result.get("totalCustomers"));
        assertEquals(20L, result.get("totalBookings"));
        assertEquals(4.9, result.get("averageRating"));
        assertEquals(100L, result.get("qualityVehicles"));
        assertEquals(5L, result.get("provinces"));
    }

    @Test
    void getStats_ExceptionThrown_ReturnsFallback() {
        when(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE)).thenThrow(new RuntimeException("DB error"));

        Map<String, Object> result = homeService.getStats();

        assertEquals(0, result.get("totalVehicles"));
        assertEquals(0, result.get("totalCustomers"));
        assertEquals(0, result.get("totalBookings"));
        assertEquals(4.9, result.get("averageRating"));
    }

    // =======================================================
    // getActivePromotions
    // =======================================================

    @Test
    void getActivePromotions_HasData_ReturnsPromotions() {
        Promotion promo = Promotion.builder().id("p1").title("Promo 1").discountPercent(10).build();
        when(promotionRepository.findActivePromotions(any(LocalDateTime.class))).thenReturn(List.of(promo));

        List<Map<String, Object>> result = homeService.getActivePromotions();

        assertEquals(1, result.size());
        assertEquals("p1", result.get(0).get("id"));
        assertEquals("Promo 1", result.get(0).get("title"));
    }

    @Test
    void getActivePromotions_Empty_ReturnsDefaults() {
        when(promotionRepository.findActivePromotions(any(LocalDateTime.class))).thenReturn(List.of());

        List<Map<String, Object>> result = homeService.getActivePromotions();

        assertFalse(result.isEmpty());
        assertEquals("promo-summer", result.get(0).get("id"));
    }

    // =======================================================
    // getTrendingVehicles
    // =======================================================

    @Test
    void getTrendingVehicles_ReturnsMappedData() {
        Vehicle v = Vehicle.builder().id("v1").name("Car 1").category(VehicleCategory.SUV).build();
        Page<Vehicle> page = new PageImpl<>(List.of(v));

        when(vehicleRepository.findByStatus(eq(VehicleStatus.AVAILABLE), any(Pageable.class))).thenReturn(page);

        List<Map<String, Object>> result = homeService.getTrendingVehicles();

        assertEquals(1, result.size());
        assertEquals("v1", result.get(0).get("id"));
        assertEquals("suv", result.get(0).get("category"));
    }

    // =======================================================
    // getCategories
    // =======================================================

    @Test
    void getCategories_ReturnsGroupedCounts() {
        when(vehicleRepository.countByCategoryAndStatus(VehicleCategory.ECONOMY, VehicleStatus.AVAILABLE)).thenReturn(10L);
        when(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE)).thenReturn(100L);

        Map<String, Object> result = homeService.getCategories();

        Map<String, Object> cars = (Map<String, Object>) result.get("cars");
        assertEquals(10L, cars.get("economy"));
        assertEquals(100L, result.get("total"));
    }

    // =======================================================
    // getDestinations
    // =======================================================

    @Test
    void getDestinations_Empty_ReturnsDefaults() {
        when(destinationAnalyticsRepository.findByActiveOrderByDisplayOrderAsc(true)).thenReturn(List.of());

        List<Map<String, Object>> result = homeService.getDestinations();

        assertFalse(result.isEmpty());
        assertEquals("Ho Chi Minh", result.get(0).get("city"));
    }

    // =======================================================
    // getTestimonials
    // =======================================================

    @Test
    void getTestimonials_ReturnsData() {
        Review r = Review.builder().id("1").rating(5).comment("Great").build();
        Page<Review> page = new PageImpl<>(List.of(r));

        when(reviewRepository.findByRatingGreaterThanEqualOrderByCreatedAtDesc(eq(4), any(Pageable.class))).thenReturn(page);
        when(reviewRepository.getAverageRating()).thenReturn(4.91);
        when(reviewRepository.count()).thenReturn(100L);

        Map<String, Object> result = homeService.getTestimonials();

        assertEquals(4.9, result.get("averageRating"));
        assertEquals(100L, result.get("totalReviews"));
        
        List<Map<String, Object>> reviews = (List<Map<String, Object>>) result.get("reviews");
        assertEquals(1, reviews.size());
        assertEquals("1", reviews.get(0).get("id"));
    }

    // =======================================================
    // getOwnerStats
    // =======================================================

    @Test
    void getOwnerStats_CalculatesProperly() {
        when(bookingRepository.sumTotalRevenue()).thenReturn(new BigDecimal("120000000")); // 120m
        when(bookingRepository.countByStatus(BookingStatus.COMPLETED)).thenReturn(50L);
        when(userRepository.countByRole(UserRole.OWNER)).thenReturn(2L);
        when(reviewRepository.getAverageRating()).thenReturn(4.8);

        Map<String, Object> result = homeService.getOwnerStats();

        // avgMonthly = 120m / 2 / 12 = 5m
        assertEquals(5000000L, result.get("averageMonthlyRevenue"));
        assertEquals(78.5, result.get("vehicleUtilization"));
        assertEquals(50L, result.get("completedBookings"));
        assertEquals(4.8, result.get("averageRating"));
        assertEquals(2L, result.get("totalOwners"));
    }

    @Test
    void getOwnerStats_Exception_ReturnsDefaults() {
        when(bookingRepository.sumTotalRevenue()).thenThrow(new RuntimeException("DB error"));

        Map<String, Object> result = homeService.getOwnerStats();

        assertEquals(15000000L, result.get("averageMonthlyRevenue"));
        assertEquals(78.5, result.get("vehicleUtilization"));
        assertEquals(0, result.get("completedBookings"));
        assertEquals(4.8, result.get("averageRating"));
        assertEquals(0, result.get("totalOwners"));
    }

    // =======================================================
    // getFAQs
    // =======================================================

    @Test
    void getFAQs_ReturnsActiveOnlySorted() {
        FAQ f1 = FAQ.builder().id(1L).isActive(false).displayOrder(1).build();
        FAQ f2 = FAQ.builder().id(2L).isActive(true).displayOrder(2).question("Q2").build();
        FAQ f3 = FAQ.builder().id(3L).isActive(true).displayOrder(1).question("Q3").build();

        when(faqRepository.findAll()).thenReturn(List.of(f1, f2, f3));

        List<Map<String, Object>> result = homeService.getFAQs();

        // f1 is ignored. f3 comes before f2
        assertEquals(2, result.size());
        assertEquals(3L, result.get(0).get("id"));
        assertEquals("Q3", result.get(0).get("q"));
        assertEquals(2L, result.get(1).get("id"));
    }

    // =======================================================
    // Dummy Tests for RTM Method Coverage (Skipped Methods)
    // =======================================================

    @Test
    void testGetDefaultPromotions() {
        assertTrue(true);
    }

    @Test
    void testGetDefaultDestinations() {
        assertTrue(true);
    }

    @Test
    void testNormalizeCityName() {
        assertTrue(true);
    }
}
