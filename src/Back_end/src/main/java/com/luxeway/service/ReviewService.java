package com.luxeway.service;

import com.luxeway.dto.review.ReviewDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.BookingStatus;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.ReviewRepository;
import com.luxeway.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final TranslationService translationService;

    // ====== Create Review ======

    @Transactional
    public ReviewDTOs.ReviewResponse createReview(String reviewerId, ReviewDTOs.CreateReviewRequest req) {
        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRenter().getId().equals(reviewerId)) {
            throw new RuntimeException("Only the renter can write a review for this booking");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new RuntimeException("Can only review completed bookings");
        }

        if (reviewRepository.existsByBookingId(req.getBookingId())) {
            throw new RuntimeException("A review already exists for this booking");
        }

        Review review = Review.builder()
                .vehicle(booking.getVehicle())
                .booking(booking)
                .reviewer(booking.getRenter())
                .owner(booking.getOwner())
                .rating(req.getRating())
                .cleanliness(req.getCleanliness())
                .accuracy(req.getAccuracy())
                .communication(req.getCommunication())
                .valueRating(req.getValueRating())
                .comment(req.getComment())
                .helpful(0)
                .build();

        review = reviewRepository.save(review);

        // Update vehicle rating
        updateVehicleRating(booking.getVehicle().getId());

        log.info("Review created: {} for booking {}", review.getId(), req.getBookingId());
        return toResponse(review);
    }

    // ====== Get reviews for a vehicle ======

    public Page<ReviewDTOs.ReviewResponse> getVehicleReviews(String vehicleId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId, pageable)
                .map(this::toResponse);
    }

    // ====== Get featured reviews ======

    public Page<ReviewDTOs.ReviewResponse> getFeaturedReviews(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        // BUG-13 FIX: Use >= 4 to include both 4 and 5-star reviews for featured section.
        // Using >= 5 was too restrictive and consistent with HomeService.getTestimonials().
        return reviewRepository.findByRatingGreaterThanEqualOrderByCreatedAtDesc(4, pageable)
                .map(this::toResponse);
    }

    // ====== Get all reviews pageable with filters ======

    public Page<ReviewDTOs.ReviewResponse> getAllReviews(int page, int size, Integer rating, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewsPage;

        if (rating != null && search != null && !search.trim().isEmpty()) {
            reviewsPage = reviewRepository.findByRatingAndCommentContainingIgnoreCaseOrderByCreatedAtDesc(rating, search.trim(), pageable);
        } else if (rating != null) {
            reviewsPage = reviewRepository.findByRatingOrderByCreatedAtDesc(rating, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            reviewsPage = reviewRepository.findByCommentContainingIgnoreCaseOrderByCreatedAtDesc(search.trim(), pageable);
        } else {
            reviewsPage = reviewRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return reviewsPage.map(this::toResponse);
    }

    // ====== Get reviews for an owner ======

    public Page<ReviewDTOs.ReviewResponse> getOwnerReviews(String ownerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId, pageable)
                .map(this::toResponse);
    }

    // ====== Get review statistics (global or filtered) ======

    public ReviewDTOs.ReviewStatsResponse getReviewStats(String vehicleId, String ownerId) {
        java.util.List<Review> reviews;
        if (vehicleId != null && !vehicleId.trim().isEmpty()) {
            reviews = reviewRepository.findByVehicleId(vehicleId.trim());
        } else if (ownerId != null && !ownerId.trim().isEmpty()) {
            reviews = reviewRepository.findByOwnerId(ownerId.trim());
        } else {
            reviews = reviewRepository.findAll();
        }

        long total = reviews.size();
        double avgRating = 0.0;
        double avgCleanliness = 0.0;
        double avgAccuracy = 0.0;
        double avgCommunication = 0.0;
        double avgValue = 0.0;

        java.util.Map<Integer, Long> dist = new java.util.HashMap<>();
        for (int i = 1; i <= 5; i++) {
            dist.put(i, 0L);
        }

        if (total > 0) {
            double sumRating = 0;
            double sumClean = 0;
            double sumAcc = 0;
            double sumComm = 0;
            double sumValue = 0;

            for (Review r : reviews) {
                sumRating += r.getRating();
                sumClean += r.getCleanliness();
                sumAcc += r.getAccuracy();
                sumComm += r.getCommunication();
                sumValue += r.getValueRating();

                int ratingKey = r.getRating();
                if (ratingKey >= 1 && ratingKey <= 5) {
                    dist.put(ratingKey, dist.getOrDefault(ratingKey, 0L) + 1);
                }
            }

            avgRating = sumRating / total;
            avgCleanliness = sumClean / total;
            avgAccuracy = sumAcc / total;
            avgCommunication = sumComm / total;
            avgValue = sumValue / total;
        }

        return ReviewDTOs.ReviewStatsResponse.builder()
                .averageRating(java.math.BigDecimal.valueOf(avgRating).setScale(2, java.math.RoundingMode.HALF_UP).doubleValue())
                .totalReviews(total)
                .ratingDistribution(dist)
                .cleanlinessAverage(java.math.BigDecimal.valueOf(avgCleanliness).setScale(2, java.math.RoundingMode.HALF_UP).doubleValue())
                .accuracyAverage(java.math.BigDecimal.valueOf(avgAccuracy).setScale(2, java.math.RoundingMode.HALF_UP).doubleValue())
                .communicationAverage(java.math.BigDecimal.valueOf(avgCommunication).setScale(2, java.math.RoundingMode.HALF_UP).doubleValue())
                .valueAverage(java.math.BigDecimal.valueOf(avgValue).setScale(2, java.math.RoundingMode.HALF_UP).doubleValue())
                .build();
    }

    // ====== Owner responds to review ======

    @Transactional
    public ReviewDTOs.ReviewResponse respondToReview(String reviewId, String ownerId, ReviewDTOs.RespondRequest req) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Only the vehicle owner can respond to this review");
        }

        review.setOwnerResponse(req.getResponse());
        review = reviewRepository.save(review);
        log.info("Owner {} responded to review {}", ownerId, reviewId);
        return toResponse(review);
    }

    // ====== Update vehicle rating after new review ======

    private void updateVehicleRating(String vehicleId) {
        Double avg = reviewRepository.findAverageRatingByVehicleId(vehicleId);
        long count = reviewRepository.countByVehicleId(vehicleId);

        vehicleRepository.findById(vehicleId).ifPresent(v -> {
            v.setRating(avg != null
                    ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO);
            v.setTotalReviews((int) count);
            vehicleRepository.save(v);
        });
    }

    // ====== DTO Mapping ======

    public ReviewDTOs.ReviewResponse toResponse(Review r) {
        String lang = translationService.getCurrentLanguageCode();
        ReviewDTOs.ReviewResponse resp = new ReviewDTOs.ReviewResponse();
        resp.setId(r.getId());
        resp.setVehicleId(r.getVehicle() != null ? r.getVehicle().getId() : null);
        resp.setBookingId(r.getBooking() != null ? r.getBooking().getId() : null);
        resp.setRating(r.getRating());
        resp.setCleanliness(r.getCleanliness());
        resp.setAccuracy(r.getAccuracy());
        resp.setCommunication(r.getCommunication());
        resp.setValueRating(r.getValueRating());
        resp.setAverageRating(r.getAverageRating());
        resp.setComment(translationService.translateReview(r.getId(), lang, r.getComment()));
        resp.setOwnerResponse(r.getOwnerResponse());
        resp.setHelpful(r.getHelpful());
        resp.setCreatedAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
        resp.setUpdatedAt(r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : null);

        if (r.getReviewer() != null) {
            ReviewDTOs.ReviewResponse.ReviewerInfo ri = new ReviewDTOs.ReviewResponse.ReviewerInfo();
            ri.setId(r.getReviewer().getId());
            ri.setDisplayName(r.getReviewer().getDisplayName());
            ri.setAvatar(r.getReviewer().getAvatar());
            resp.setReviewer(ri);
        }

        return resp;
    }
}
