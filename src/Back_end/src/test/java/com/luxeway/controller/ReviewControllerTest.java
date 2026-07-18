package com.luxeway.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxeway.dto.review.ReviewDTOs;
import com.luxeway.entity.Booking;
import com.luxeway.entity.Review;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.enums.BookingStatus;
import com.luxeway.enums.UserRole;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.ReviewRepository;
import com.luxeway.repository.VehicleRepository;
import com.luxeway.service.TranslationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles({"h2", "dev"})
@SuppressWarnings("all")
public class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReviewRepository reviewRepository;

    @MockBean
    private BookingRepository bookingRepository;

    @MockBean
    private VehicleRepository vehicleRepository;

    @MockBean
    private TranslationService translationService;

    private User renter;
    private User owner;
    private Vehicle vehicle;
    private Booking completedBooking;
    private Booking confirmedBooking;
    private Booking canceledBooking;
    private Review existingReview;

    @BeforeEach
    public void setUp() {
        renter = User.builder()
                .id("renter-abc")
                .email("renter@luxeway.com")
                .displayName("Renter Person")
                .firstName("Renter")
                .lastName("Person")
                .avatar("avatar-renter.png")
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .verified(true)
                .build();

        owner = User.builder()
                .id("owner-xyz")
                .email("owner@luxeway.com")
                .displayName("Owner Person")
                .firstName("Owner")
                .lastName("Person")
                .role(UserRole.OWNER)
                .isActive(true)
                .verified(true)
                .build();

        vehicle = Vehicle.builder()
                .id("vehicle-123")
                .name("Kia Morning")
                .rating(BigDecimal.valueOf(4.5))
                .totalReviews(10)
                .build();

        completedBooking = Booking.builder()
                .id("booking-completed")
                .renter(renter)
                .owner(owner)
                .vehicle(vehicle)
                .status(BookingStatus.COMPLETED)
                .build();

        confirmedBooking = Booking.builder()
                .id("booking-confirmed")
                .renter(renter)
                .owner(owner)
                .vehicle(vehicle)
                .status(BookingStatus.CONFIRMED)
                .build();

        canceledBooking = Booking.builder()
                .id("booking-canceled")
                .renter(renter)
                .owner(owner)
                .vehicle(vehicle)
                .status(BookingStatus.CANCELLED)
                .build();

        existingReview = Review.builder()
                .id("rev-789")
                .booking(completedBooking)
                .vehicle(vehicle)
                .reviewer(renter)
                .owner(owner)
                .rating(5)
                .cleanliness(5)
                .accuracy(4)
                .communication(5)
                .valueRating(4)
                .comment("Xe rất đẹp!")
                .createdAt(LocalDateTime.now())
                .build();

        // Stub default translations
        when(translationService.getCurrentLanguageCode()).thenReturn("vi");
        when(translationService.translateReview(any(), any(), any()))
                .thenAnswer(invocation -> invocation.getArgument(2));
    }

    // ==========================================
    // CREATE REVIEW TESTS (TC-REV-001 - TC-REV-009, TC-REV-031 - TC-REV-032, TC-REV-034, TC-REV-036)
    // ==========================================

    @Test
    public void testCreateReview_Success_TC_REV_001() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(4);
        req.setCommunication(5);
        req.setValueRating(4);
        req.setComment("Xe rất đẹp!");

        when(bookingRepository.findById("booking-completed")).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByBookingId("booking-completed")).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(existingReview);
        when(vehicleRepository.findById("vehicle-123")).thenReturn(Optional.of(vehicle));

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Review submitted successfully")))
                .andExpect(jsonPath("$.data.averageRating", is(4.6)))
                .andExpect(jsonPath("$.data.comment", is("Xe rất đẹp!")));
    }

    @Test
    public void testCreateReview_MinRating_TC_REV_002() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(1);
        req.setCleanliness(1);
        req.setAccuracy(1);
        req.setCommunication(1);
        req.setValueRating(1);

        Review minReview = Review.builder()
                .id("rev-min")
                .booking(completedBooking)
                .vehicle(vehicle)
                .reviewer(renter)
                .owner(owner)
                .rating(1)
                .cleanliness(1)
                .accuracy(1)
                .communication(1)
                .valueRating(1)
                .build();

        when(bookingRepository.findById("booking-completed")).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByBookingId("booking-completed")).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(minReview);
        when(vehicleRepository.findById("vehicle-123")).thenReturn(Optional.of(vehicle));

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.averageRating", is(1.0)));
    }

    @Test
    public void testCreateReview_NotCompleted_TC_REV_003() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-confirmed");
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(4);
        req.setCommunication(5);
        req.setValueRating(4);

        when(bookingRepository.findById("booking-confirmed")).thenReturn(Optional.of(confirmedBooking));

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Can only review completed bookings")));
    }

    @Test
    public void testCreateReview_AlreadyExists_TC_REV_004() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(4);
        req.setCommunication(5);
        req.setValueRating(4);

        when(bookingRepository.findById("booking-completed")).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByBookingId("booking-completed")).thenReturn(true);

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("A review already exists for this booking")));
    }

    @Test
    public void testCreateReview_NotRenter_TC_REV_005() throws Exception {
        User anotherUser = User.builder()
                .id("hacker-id")
                .email("hacker@luxeway.com")
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .verified(true)
                .build();
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(4);
        req.setCommunication(5);
        req.setValueRating(4);

        when(bookingRepository.findById("booking-completed")).thenReturn(Optional.of(completedBooking));

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(anotherUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Only the renter can write a review for this booking")));
    }

    @Test
    public void testCreateReview_RatingZero_TC_REV_006() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(0); // Under Min(1)
        req.setCleanliness(1);
        req.setAccuracy(1);
        req.setCommunication(1);
        req.setValueRating(1);

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testCreateReview_RatingSix_TC_REV_007() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(6); // Over Max(5)
        req.setCleanliness(5);
        req.setAccuracy(5);
        req.setCommunication(5);
        req.setValueRating(5);

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testCreateReview_CommentTooLong_TC_REV_008() throws Exception {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 2001; i++) {
            sb.append("A");
        }
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(5);
        req.setCommunication(5);
        req.setValueRating(5);
        req.setComment(sb.toString());

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testCreateReview_NoJwt_TC_REV_009() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(5);

        mockMvc.perform(post("/api/v1/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testCreateReview_BookingIdEmpty_TC_REV_031() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId(""); // Blank
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(5);
        req.setCommunication(5);
        req.setValueRating(5);

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testCreateReview_NullField_TC_REV_032() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(5);
        req.setCleanliness(null); // Null field

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testCreateReview_EmojiComment_TC_REV_034() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(5);
        req.setCommunication(5);
        req.setValueRating(5);
        req.setComment("Xe rất tốt! 🚗✨");

        Review emojiReview = Review.builder()
                .id("rev-emoji")
                .booking(completedBooking)
                .vehicle(vehicle)
                .reviewer(renter)
                .owner(owner)
                .rating(5)
                .cleanliness(5)
                .accuracy(5)
                .communication(5)
                .valueRating(5)
                .comment("Xe rất tốt! 🚗✨")
                .build();

        when(bookingRepository.findById("booking-completed")).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByBookingId("booking-completed")).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(emojiReview);
        when(vehicleRepository.findById("vehicle-123")).thenReturn(Optional.of(vehicle));

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.comment", is("Xe rất tốt! 🚗✨")));
    }

    @Test
    public void testCreateReview_BookingCanceled_TC_REV_036() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-canceled");
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(5);
        req.setCommunication(5);
        req.setValueRating(5);

        when(bookingRepository.findById("booking-canceled")).thenReturn(Optional.of(canceledBooking));

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Can only review completed bookings")));
    }

    // ==========================================
    // GET VEHICLE REVIEWS TESTS (TC-REV-010 - TC-REV-012, TC-REV-033, TC-REV-035)
    // ==========================================

    @Test
    public void testGetVehicleReviews_Success_TC_REV_010() throws Exception {
        Pageable pageable = PageRequest.of(0, 10);
        when(reviewRepository.findByVehicleIdOrderByCreatedAtDesc(eq("vehicle-123"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(existingReview), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/v1/reviews/vehicle/vehicle-123")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.meta.page", is(0)))
                .andExpect(jsonPath("$.meta.pageSize", is(10)));
    }

    @Test
    public void testGetVehicleReviews_Pagination_TC_REV_011() throws Exception {
        when(reviewRepository.findByVehicleIdOrderByCreatedAtDesc(eq("vehicle-123"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList(), PageRequest.of(1, 5), 0));

        mockMvc.perform(get("/api/v1/reviews/vehicle/vehicle-123?page=1&size=5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meta.page", is(1)))
                .andExpect(jsonPath("$.meta.pageSize", is(5)));
    }

    @Test
    public void testGetVehicleReviews_EmptyList_TC_REV_012() throws Exception {
        when(reviewRepository.findByVehicleIdOrderByCreatedAtDesc(eq("new-vehicle"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0));

        mockMvc.perform(get("/api/v1/reviews/vehicle/new-vehicle")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)))
                .andExpect(jsonPath("$.meta.totalElements", is(0)));
    }

    @Test
    public void testGetVehicleReviews_Translation_TC_REV_033() throws Exception {
        when(translationService.getCurrentLanguageCode()).thenReturn("en");
        when(translationService.translateReview("rev-789", "en", "Xe rất đẹp!"))
                .thenReturn("Very beautiful vehicle!");

        when(reviewRepository.findByVehicleIdOrderByCreatedAtDesc(eq("vehicle-123"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(existingReview)));

        mockMvc.perform(get("/api/v1/reviews/vehicle/vehicle-123")
                        .header("Accept-Language", "en")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].comment", is("Very beautiful vehicle!")));
    }

    @Test
    public void testGetVehicleReviews_HugeSize_TC_REV_035() throws Exception {
        when(reviewRepository.findByVehicleIdOrderByCreatedAtDesc(eq("vehicle-123"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(existingReview), PageRequest.of(0, 1000), 1));

        mockMvc.perform(get("/api/v1/reviews/vehicle/vehicle-123?size=1000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meta.pageSize", is(1000)));
    }

    // ==========================================
    // GET FEATURED REVIEWS TESTS (TC-REV-013 - TC-REV-014)
    // ==========================================

    @Test
    public void testGetFeaturedReviews_Success_TC_REV_013() throws Exception {
        when(reviewRepository.findByRatingGreaterThanEqualOrderByCreatedAtDesc(eq(4), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(existingReview)));

        mockMvc.perform(get("/api/v1/reviews/featured")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.meta").doesNotExist()); // Page stats output without meta wrapper
    }

    @Test
    public void testGetFeaturedReviews_DefaultLimit_TC_REV_014() throws Exception {
        when(reviewRepository.findByRatingGreaterThanEqualOrderByCreatedAtDesc(eq(4), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(existingReview), PageRequest.of(0, 3), 1));

        mockMvc.perform(get("/api/v1/reviews/featured")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // ==========================================
    // GET ALL REVIEWS TESTS (TC-REV-015 - TC-REV-018)
    // ==========================================

    @Test
    public void testGetAllReviews_Success_TC_REV_015() throws Exception {
        when(reviewRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(existingReview)));

        mockMvc.perform(get("/api/v1/reviews")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)));
    }

    @Test
    public void testGetAllReviews_FilterRating_TC_REV_016() throws Exception {
        when(reviewRepository.findByRatingOrderByCreatedAtDesc(eq(5), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(existingReview)));

        mockMvc.perform(get("/api/v1/reviews?rating=5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].rating", is(5)));
    }

    @Test
    public void testGetAllReviews_FilterSearch_TC_REV_017() throws Exception {
        when(reviewRepository.findByCommentContainingIgnoreCaseOrderByCreatedAtDesc(eq("sạch"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(existingReview)));

        mockMvc.perform(get("/api/v1/reviews?search=sạch")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetAllReviews_CombinedFilters_TC_REV_018() throws Exception {
        when(reviewRepository.findByRatingAndCommentContainingIgnoreCaseOrderByCreatedAtDesc(eq(4), eq("tốt"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        mockMvc.perform(get("/api/v1/reviews?rating=4&search=tốt")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    // ==========================================
    // STATISTICS TESTS (TC-REV-019 - TC-REV-021)
    // ==========================================

    @Test
    public void testGetStats_Global_TC_REV_019() throws Exception {
        when(reviewRepository.findAll()).thenReturn(List.of(existingReview));

        mockMvc.perform(get("/api/v1/reviews/stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.averageRating", is(5.0)))
                .andExpect(jsonPath("$.data.totalReviews", is(1)))
                .andExpect(jsonPath("$.data.cleanlinessAverage", is(5.0)))
                .andExpect(jsonPath("$.data.ratingDistribution.5", is(1)));
    }

    @Test
    public void testGetStats_ByVehicleId_TC_REV_020() throws Exception {
        when(reviewRepository.findByVehicleId("vehicle-123")).thenReturn(List.of(existingReview));

        mockMvc.perform(get("/api/v1/reviews/stats?vehicleId=vehicle-123")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalReviews", is(1)));
    }

    @Test
    public void testGetStats_ByOwnerId_TC_REV_021() throws Exception {
        when(reviewRepository.findByOwnerId("owner-xyz")).thenReturn(List.of(existingReview));

        mockMvc.perform(get("/api/v1/reviews/stats?ownerId=owner-xyz")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalReviews", is(1)));
    }

    // ==========================================
    // GET OWNER REVIEWS TESTS (TC-REV-022)
    // ==========================================

    @Test
    public void testGetOwnerReviews_Success_TC_REV_022() throws Exception {
        when(reviewRepository.findByOwnerIdOrderByCreatedAtDesc(eq("owner-xyz"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(existingReview)));

        mockMvc.perform(get("/api/v1/reviews/owner/owner-xyz")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)));
    }

    // ==========================================
    // PUT RESPOND TO REVIEW TESTS (TC-REV-023 - TC-REV-029)
    // ==========================================

    @Test
    public void testRespondToReview_Success_TC_REV_023() throws Exception {
        ReviewDTOs.RespondRequest req = new ReviewDTOs.RespondRequest();
        req.setResponse("Cảm ơn quý khách!");

        Review respondedReview = Review.builder()
                .id("rev-789")
                .booking(completedBooking)
                .vehicle(vehicle)
                .reviewer(renter)
                .owner(owner)
                .rating(5)
                .cleanliness(5)
                .accuracy(4)
                .communication(5)
                .valueRating(4)
                .comment("Xe rất đẹp!")
                .ownerResponse("Cảm ơn quý khách!")
                .build();

        when(reviewRepository.findById("rev-789")).thenReturn(Optional.of(existingReview));
        when(reviewRepository.save(any(Review.class))).thenReturn(respondedReview);

        mockMvc.perform(put("/api/v1/reviews/rev-789/respond")
                        .with(user(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.ownerResponse", is("Cảm ơn quý khách!")));
    }

    @Test
    public void testRespondToReview_NotOwner_TC_REV_024() throws Exception {
        ReviewDTOs.RespondRequest req = new ReviewDTOs.RespondRequest();
        req.setResponse("Cảm ơn!");

        when(reviewRepository.findById("rev-789")).thenReturn(Optional.of(existingReview));

        mockMvc.perform(put("/api/v1/reviews/rev-789/respond")
                        .with(user(renter)) // Not owner
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Only the vehicle owner can respond to this review")));
    }

    @Test
    public void testRespondToReview_NotExists_TC_REV_025() throws Exception {
        ReviewDTOs.RespondRequest req = new ReviewDTOs.RespondRequest();
        req.setResponse("Cảm ơn!");

        when(reviewRepository.findById("invalid-rev")).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/v1/reviews/invalid-rev/respond")
                        .with(user(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Review not found")));
    }

    @Test
    public void testRespondToReview_BlankResponse_TC_REV_026() throws Exception {
        ReviewDTOs.RespondRequest req = new ReviewDTOs.RespondRequest();
        req.setResponse(""); // Blank

        mockMvc.perform(put("/api/v1/reviews/rev-789/respond")
                        .with(user(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRespondToReview_TooLongResponse_TC_REV_027() throws Exception {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 1001; i++) {
            sb.append("A");
        }
        ReviewDTOs.RespondRequest req = new ReviewDTOs.RespondRequest();
        req.setResponse(sb.toString());

        mockMvc.perform(put("/api/v1/reviews/rev-789/respond")
                        .with(user(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRespondToReview_NoJwt_TC_REV_028() throws Exception {
        ReviewDTOs.RespondRequest req = new ReviewDTOs.RespondRequest();
        req.setResponse("Cảm ơn!");

        mockMvc.perform(put("/api/v1/reviews/rev-789/respond")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testRespondToReview_OwnerMismatch_TC_REV_029() throws Exception {
        User otherOwner = User.builder()
                .id("owner-mismatch")
                .email("other@luxeway.com")
                .role(UserRole.OWNER)
                .isActive(true)
                .verified(true)
                .build();
        ReviewDTOs.RespondRequest req = new ReviewDTOs.RespondRequest();
        req.setResponse("Cảm ơn!");

        when(reviewRepository.findById("rev-789")).thenReturn(Optional.of(existingReview));

        mockMvc.perform(put("/api/v1/reviews/rev-789/respond")
                        .with(user(otherOwner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Only the vehicle owner can respond to this review")));
    }

    // ==========================================
    // MISCELLANEOUS / DB SYNC TESTS (TC-REV-030)
    // ==========================================

    @Test
    public void testUpdateVehicleRating_TC_REV_030() throws Exception {
        ReviewDTOs.CreateReviewRequest req = new ReviewDTOs.CreateReviewRequest();
        req.setBookingId("booking-completed");
        req.setRating(5);
        req.setCleanliness(5);
        req.setAccuracy(5);
        req.setCommunication(5);
        req.setValueRating(5);

        when(bookingRepository.findById("booking-completed")).thenReturn(Optional.of(completedBooking));
        when(reviewRepository.existsByBookingId("booking-completed")).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenReturn(existingReview);

        // Stub findAverageRatingByVehicleId to return 4.7
        when(reviewRepository.findAverageRatingByVehicleId("vehicle-123")).thenReturn(4.7);
        when(reviewRepository.countByVehicleId("vehicle-123")).thenReturn(15L);
        when(vehicleRepository.findById("vehicle-123")).thenReturn(Optional.of(vehicle));

        mockMvc.perform(post("/api/v1/reviews")
                        .with(user(renter))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Verify vehicle fields were updated correctly
        Mockito.verify(vehicleRepository).save(Mockito.argThat(v ->
                v.getRating().doubleValue() == 4.7 && v.getTotalReviews() == 15
        ));
    }
}
