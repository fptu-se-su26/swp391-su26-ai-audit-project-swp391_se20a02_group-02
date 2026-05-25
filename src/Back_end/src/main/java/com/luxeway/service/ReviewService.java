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
        return reviewRepository.findByRatingGreaterThanEqualOrderByCreatedAtDesc(5, pageable)
                .map(this::toResponse);
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
        resp.setComment(r.getComment());
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
