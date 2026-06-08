package com.luxeway.dto.review;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

public class ReviewDTOs {

    @Data
    public static class CreateReviewRequest {
        @NotBlank(message = "Booking ID is required")
        private String bookingId;

        @NotNull @Min(1) @Max(5)
        private Integer rating;

        @NotNull @Min(1) @Max(5)
        private Integer cleanliness;

        @NotNull @Min(1) @Max(5)
        private Integer accuracy;

        @NotNull @Min(1) @Max(5)
        private Integer communication;

        @NotNull @Min(1) @Max(5)
        private Integer valueRating;

        @Size(max = 2000)
        private String comment;
    }

    @Data
    public static class RespondRequest {
        @NotBlank(message = "Response is required")
        @Size(max = 1000)
        private String response;
    }

    @Data
    public static class ReviewResponse {
        private String id;
        private String vehicleId;
        private String bookingId;
        private ReviewerInfo reviewer;
        private Integer rating;
        private Integer cleanliness;
        private Integer accuracy;
        private Integer communication;
        private Integer valueRating;
        private Double averageRating;
        private String comment;
        private String ownerResponse;
        private Integer helpful;
        private String createdAt;
        private String updatedAt;

        @Data
        public static class ReviewerInfo {
            private String id;
            private String displayName;
            private String avatar;
        }
    }

    @Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ReviewStatsResponse {
        private Double averageRating;
        private Long totalReviews;
        private java.util.Map<Integer, Long> ratingDistribution; // Star ratings 1 to 5
        private Double cleanlinessAverage;
        private Double accuracyAverage;
        private Double communicationAverage;
        private Double valueAverage;
    }
}
