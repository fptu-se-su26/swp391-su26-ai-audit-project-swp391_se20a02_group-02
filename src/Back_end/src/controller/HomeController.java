package com.luxeway.controller;

import com.luxeway.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/home")
@RequiredArgsConstructor
@Tag(name = "Landing Page Home", description = "Public endpoints to power the landing page sections")
public class HomeController {

    private final HomeService homeService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/stats")
    @Operation(summary = "Get landing page statistics: total vehicles, customers, bookings, avg rating")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(homeService.getStats());
    }

    @GetMapping("/promotions")
    @Operation(summary = "Get active promotional banners for the landing page")
    public ResponseEntity<List<Map<String, Object>>> getPromotions() {
        return ResponseEntity.ok(homeService.getActivePromotions());
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending/most booked vehicles (Netflix-style carousel)")
    public ResponseEntity<List<Map<String, Object>>> getTrending() {
        return ResponseEntity.ok(homeService.getTrendingVehicles());
    }

    @GetMapping("/categories")
    @Operation(summary = "Get vehicle counts per category (Cars and Motorbikes separated)")
    public ResponseEntity<Map<String, Object>> getCategories() {
        return ResponseEntity.ok(homeService.getCategories());
    }

    @GetMapping("/destinations")
    @Operation(summary = "Get popular destinations with vehicle counts and average prices")
    public ResponseEntity<List<Map<String, Object>>> getDestinations() {
        return ResponseEntity.ok(homeService.getDestinations());
    }

    @GetMapping("/testimonials")
    @Operation(summary = "Get featured customer testimonials and overall rating")
    public ResponseEntity<Map<String, Object>> getTestimonials() {
        return ResponseEntity.ok(homeService.getTestimonials());
    }

    @GetMapping("/owner-stats")
    @Operation(summary = "Get aggregate owner statistics to power the 'Become an Owner' section")
    public ResponseEntity<Map<String, Object>> getOwnerStats() {
        return ResponseEntity.ok(homeService.getOwnerStats());
    }

    @GetMapping("/faqs")
    @Operation(summary = "Get FAQ list ordered by display_order (admin managed)")
    public ResponseEntity<List<Map<String, Object>>> getFaqs() {
        return ResponseEntity.ok(homeService.getFAQs());
    }

    @GetMapping("/vehicles")
    @Operation(summary = "Get home page vehicles: latest approved and popular/trending vehicles")
    public ResponseEntity<Map<String, Object>> getHomeVehicles() {
        return ResponseEntity.ok(homeService.getHomeVehicles());
    }

    @GetMapping("/health")
    @Operation(summary = "Public health check to verify database connection")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        boolean isConnected = homeService.checkDatabaseConnection();
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("status", isConnected ? "SUCCESS" : "ERROR");
        response.put("message", isConnected ? "LuxeWay Backend is running!" : "Database connection failed");
        response.put("database_connected", isConnected);
        response.put("timestamp", System.currentTimeMillis());

        if (isConnected) {
            try {
                String dbName = jdbcTemplate.queryForObject("SELECT DB_NAME()", String.class);
                String serverName = jdbcTemplate.queryForObject("SELECT @@SERVERNAME", String.class);
                Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
                Integer carCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM cars", Integer.class);
                Integer vehicleCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM vehicles", Integer.class);
                
                response.put("db_name", dbName);
                response.put("server_name", serverName);
                response.put("user_count", userCount);
                response.put("car_count", carCount);
                response.put("vehicle_count", vehicleCount);
            } catch (Exception e) {
                response.put("diagnostic_error", e.getMessage());
            }
        }
        
        return isConnected 
            ? ResponseEntity.ok(response) 
            : ResponseEntity.status(500).body(response);
    }
}
