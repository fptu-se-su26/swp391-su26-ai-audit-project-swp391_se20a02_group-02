package com.luxeway.service;

import com.luxeway.dto.review.ReviewDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.BookingStatus;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.ReviewRepository;
import com.luxeway.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * LW-177: createReview (UTC-032-001)
 */
@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private TranslationService translationService;

    @InjectMocks
    private ReviewService service;

    private User renter;
    private User owner;
    private Vehicle vehicle;
    private Booking booking;
    private Review review;

    @BeforeEach
    void setUp() {
        renter = new User();
        renter.setId("u1");
        renter.setDisplayName("Renter A");

        owner = new User();
        owner.setId("owner1");
        owner.setDisplayName("Owner B");

        vehicle = new Vehicle();
        vehicle.setId("v1");
        vehicle.setRating(BigDecimal.valueOf(4.5));
        vehicle.setTotalReviews(10);

        booking = new Booking();
        booking.setId("booking1");
        booking.setRenter(renter);
        booking.setOwner(owner);
        booking.setVehicle(vehicle);
        booking.setStatus(BookingStatus.COMPLETED);

        review = new Review();
        review.setId("rev1");
        review.setVehicle(vehicle);
        review.setBooking(booking);
        review.setReviewer(renter);
        review.setOwner(owner);
        review.setRating(5);
        review.setCleanliness(5);
        review.setAccuracy(5);
        review.setCommunication(5);
        review.setValueRating(5);
        review.setComment("Xe rất đẹp!");
        review.setHelpful(0);
    }

    // ===== LW-177: createReview =====

    /** UTCID01 (Normal): booking exists & completed, reviewer is renter, no existing review → creates review */
    @Test
    void createReview_UTCID01_validBookingCompleted_createsReview() {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking1");
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(5);
        req.setCommunication(5);
        req.setValueRating(5);
        req.setComment("Xe rất đẹp!");

        when(bookingRepository.findById("booking1")).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBookingId("booking1")).thenReturn(false);
        when(reviewRepository.save(any())).thenReturn(review);
        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any())).thenReturn(vehicle);
        when(reviewRepository.findAverageRatingByVehicleId("v1")).thenReturn(4.8);
        when(reviewRepository.countByVehicleId("v1")).thenReturn(11L);
        when(translationService.getCurrentLanguageCode()).thenReturn("vi");
        when(translationService.translateReview(any(), any(), any())).thenReturn("Xe rất đẹp!");

        ReviewDTOs.ReviewResponse result = service.createReview("u1", req);

        assertNotNull(result);
        assertEquals("rev1", result.getId());
        assertEquals(5, result.getRating());
        verify(reviewRepository).save(any());
    }

    /** UTCID02 (Normal): booking does not exist → throws RuntimeException */
    @Test
    void createReview_UTCID02_bookingNotFound_throwsRuntimeException() {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("non-existent-booking");

        when(bookingRepository.findById("non-existent-booking")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.createReview("u1", req));
    }

    /** UTCID03 (Normal): reviewer is NOT the renter → throws RuntimeException */
    @Test
    void createReview_UTCID03_reviewerNotRenter_throwsRuntimeException() {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking1");

        when(bookingRepository.findById("booking1")).thenReturn(Optional.of(booking));

        assertThrows(RuntimeException.class, () -> service.createReview("other-user", req));
    }

    /** UTCID04 (Normal): booking status is NOT COMPLETED (PENDING) → throws RuntimeException */
    @Test
    void createReview_UTCID04_bookingNotCompleted_throwsRuntimeException() {
        booking.setStatus(BookingStatus.PENDING);

        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking1");

        when(bookingRepository.findById("booking1")).thenReturn(Optional.of(booking));

        assertThrows(RuntimeException.class, () -> service.createReview("u1", req));
    }

    /** UTCID05 (Normal): review already exists for booking → throws RuntimeException */
    @Test
    void createReview_UTCID05_reviewAlreadyExists_throwsRuntimeException() {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking1");

        when(bookingRepository.findById("booking1")).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBookingId("booking1")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> service.createReview("u1", req));
    }

    /** UTCID06 (Abnormal): reviewerId=-1 does not exist → booking not found → throws RuntimeException */
    @Test
    void createReview_UTCID06_reviewerIdNegative_throwsRuntimeException() {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking1");

        when(bookingRepository.findById("booking1")).thenReturn(Optional.of(booking));

        // reviewerId=-1 doesn't match renter.id="u1"
        assertThrows(RuntimeException.class, () -> service.createReview("-1", req));
    }

    /** UTCID07 (Boundary): reviewerId=1 (valid boundary, no relations) → returns empty-listed object */
    @Test
    void createReview_UTCID07_boundaryReviewerId_returnsResponseWithEmptyLists() {
        User boundaryRenter = new User();
        boundaryRenter.setId("1");
        booking.setRenter(boundaryRenter);

        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking1");
        req.setRating(3);
        req.setCleanliness(3);
        req.setAccuracy(3);
        req.setCommunication(3);
        req.setValueRating(3);
        req.setComment("OK");

        Review boundaryReview = new Review();
        boundaryReview.setId("rev-boundary");
        boundaryReview.setVehicle(vehicle);
        boundaryReview.setBooking(booking);
        boundaryReview.setReviewer(boundaryRenter);
        boundaryReview.setRating(3);
        boundaryReview.setHelpful(0);

        when(bookingRepository.findById("booking1")).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBookingId("booking1")).thenReturn(false);
        when(reviewRepository.save(any())).thenReturn(boundaryReview);
        when(vehicleRepository.findById("v1")).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any())).thenReturn(vehicle);
        when(reviewRepository.findAverageRatingByVehicleId("v1")).thenReturn(3.0);
        when(reviewRepository.countByVehicleId("v1")).thenReturn(1L);
        when(translationService.getCurrentLanguageCode()).thenReturn("vi");
        when(translationService.translateReview(any(), any(), any())).thenReturn("OK");

        ReviewDTOs.ReviewResponse result = service.createReview("1", req);

        assertNotNull(result);
        assertEquals("rev-boundary", result.getId());
    }
}
