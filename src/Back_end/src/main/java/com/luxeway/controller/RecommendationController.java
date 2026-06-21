package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.Car;
import com.luxeway.entity.Motorbike;
import com.luxeway.entity.User;
import com.luxeway.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendation Engine", description = "AI similarity and contextual recommendations carousels endpoints")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/cars/similar/{carId}")
    @Operation(summary = "Get similar cars matching target specifications")
    public ResponseEntity<ApiResponse<List<Car>>> getSimilarCars(
            @PathVariable String carId,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Similar cars loaded", 
                recommendationService.getSimilarCars(carId, limit)));
    }

    @GetMapping("/motorbikes/similar/{bikeId}")
    @Operation(summary = "Get similar motorbikes matching target specifications")
    public ResponseEntity<ApiResponse<List<Motorbike>>> getSimilarMotorbikes(
            @PathVariable String bikeId,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Similar motorbikes loaded", 
                recommendationService.getSimilarMotorbikes(bikeId, limit)));
    }

    @GetMapping("/cars/popular")
    @Operation(summary = "Get popular cars matching optional city filter")
    public ResponseEntity<ApiResponse<List<Car>>> getPopularCars(
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Popular cars loaded", 
                recommendationService.getPopularCars(city, limit)));
    }

    @GetMapping("/motorbikes/popular")
    @Operation(summary = "Get popular motorbikes matching optional city filter")
    public ResponseEntity<ApiResponse<List<Motorbike>>> getPopularMotorbikes(
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Popular motorbikes loaded", 
                recommendationService.getPopularMotorbikes(city, limit)));
    }

    @GetMapping("/cars/personal")
    @Operation(summary = "Get personalized car recommendations for current user")
    public ResponseEntity<ApiResponse<List<Car>>> getPersonalizedCars(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "6") int limit) {
        String userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success("Personalized cars loaded", 
                recommendationService.getRecommendedCarsForUser(userId, limit)));
    }

    @GetMapping("/motorbikes/personal")
    @Operation(summary = "Get personalized motorbike recommendations for current user")
    public ResponseEntity<ApiResponse<List<Motorbike>>> getPersonalizedMotorbikes(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "6") int limit) {
        String userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success("Personalized motorbikes loaded", 
                recommendationService.getRecommendedMotorbikesForUser(userId, limit)));
    }
}
