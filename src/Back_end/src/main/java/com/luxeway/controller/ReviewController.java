package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.review.ReviewDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Vehicle review management")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Create a review for a completed booking (renter only)")
    public ResponseEntity<ApiResponse<ReviewDTOs.ReviewResponse>> createReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewDTOs.CreateReviewRequest request) {
        ReviewDTOs.ReviewResponse review = reviewService.createReview(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", review));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Get all reviews for a vehicle (public)")
    public ResponseEntity<ApiResponse<Page<ReviewDTOs.ReviewResponse>>> getVehicleReviews(
            @PathVariable String vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewDTOs.ReviewResponse> reviews = reviewService.getVehicleReviews(vehicleId, page, size);
        ApiResponse<Page<ReviewDTOs.ReviewResponse>> response = ApiResponse.<Page<ReviewDTOs.ReviewResponse>>builder()
                .success(true)
                .data(reviews)
                .meta(ApiResponse.PageMeta.builder()
                        .page(reviews.getNumber())
                        .pageSize(reviews.getSize())
                        .totalElements(reviews.getTotalElements())
                        .totalPages(reviews.getTotalPages())
                        .build())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured 5-star reviews (public)")
    public ResponseEntity<ApiResponse<Page<ReviewDTOs.ReviewResponse>>> getFeaturedReviews(
            @RequestParam(defaultValue = "3") int limit) {
        Page<ReviewDTOs.ReviewResponse> reviews = reviewService.getFeaturedReviews(limit);
        ApiResponse<Page<ReviewDTOs.ReviewResponse>> response = ApiResponse.<Page<ReviewDTOs.ReviewResponse>>builder()
                .success(true)
                .data(reviews)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all reviews (public, pageable)")
    public ResponseEntity<ApiResponse<Page<ReviewDTOs.ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String search) {
        Page<ReviewDTOs.ReviewResponse> reviews = reviewService.getAllReviews(page, size, rating, search);
        ApiResponse<Page<ReviewDTOs.ReviewResponse>> response = ApiResponse.<Page<ReviewDTOs.ReviewResponse>>builder()
                .success(true)
                .data(reviews)
                .meta(ApiResponse.PageMeta.builder()
                        .page(reviews.getNumber())
                        .pageSize(reviews.getSize())
                        .totalElements(reviews.getTotalElements())
                        .totalPages(reviews.getTotalPages())
                        .build())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get review statistics (global, or filtered by vehicle/owner)")
    public ResponseEntity<ApiResponse<ReviewDTOs.ReviewStatsResponse>> getReviewStats(
            @RequestParam(required = false) String vehicleId,
            @RequestParam(required = false) String ownerId) {
        ReviewDTOs.ReviewStatsResponse stats = reviewService.getReviewStats(vehicleId, ownerId);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    }

    @GetMapping("/owner/{ownerId}")
    @Operation(summary = "Get all reviews for an owner (public)")
    public ResponseEntity<ApiResponse<Page<ReviewDTOs.ReviewResponse>>> getOwnerReviews(
            @PathVariable String ownerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewDTOs.ReviewResponse> reviews = reviewService.getOwnerReviews(ownerId, page, size);
        ApiResponse<Page<ReviewDTOs.ReviewResponse>> response = ApiResponse.<Page<ReviewDTOs.ReviewResponse>>builder()
                .success(true)
                .data(reviews)
                .meta(ApiResponse.PageMeta.builder()
                        .page(reviews.getNumber())
                        .pageSize(reviews.getSize())
                        .totalElements(reviews.getTotalElements())
                        .totalPages(reviews.getTotalPages())
                        .build())
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/respond")
    @Operation(summary = "Owner responds to a review")
    public ResponseEntity<ApiResponse<ReviewDTOs.ReviewResponse>> respond(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewDTOs.RespondRequest request) {
        ReviewDTOs.ReviewResponse review = reviewService.respondToReview(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Response submitted", review));
    }
}
