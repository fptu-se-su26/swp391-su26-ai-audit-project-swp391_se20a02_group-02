package com.luxeway.service;

import com.luxeway.dto.booking.BookingDTOs;
import com.luxeway.dto.customer.CustomerDTOs;
import com.luxeway.dto.payment.PaymentDTOs;
import com.luxeway.dto.review.ReviewDTOs;
import com.luxeway.dto.user.UserDTOs;
import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.BookingStatus;
import com.luxeway.enums.UserRole;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final FavoriteVehicleRepository favoriteVehicleRepository;
    private final NotificationRepository notificationRepository;
    private final ReviewRepository reviewRepository;
    private final OwnerApplicationRepository ownerApplicationRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingService bookingService;
    private final VehicleService vehicleService;
    private final UserService userService;
    private final ReviewService reviewService;

    private boolean isUpcoming(BookingStatus status) {
        return status == BookingStatus.CONFIRMED || 
               status == BookingStatus.ACTIVE || 
               status == BookingStatus.IN_PROGRESS ||
               status == BookingStatus.WAITING_PAYMENT ||
               status == BookingStatus.PAYMENT_PENDING ||
               status == BookingStatus.PAYMENT_VERIFIED ||
               status == BookingStatus.OWNER_APPROVED ||
               status == BookingStatus.READY_FOR_PICKUP ||
               status == BookingStatus.CHECKED_OUT ||
               status == BookingStatus.IN_RENTAL;
    }

    private boolean isPast(BookingStatus status) {
        return status == BookingStatus.COMPLETED || 
               status == BookingStatus.CANCELLED ||
               status == BookingStatus.RETURN_COMPLETED ||
               status == BookingStatus.PAYMENT_EXPIRED ||
               status == BookingStatus.PAYMENT_REJECTED ||
               status == BookingStatus.CUSTOMER_CANCELLED ||
               status == BookingStatus.OWNER_CANCELLED ||
               status == BookingStatus.SYSTEM_CANCELLED;
    }

    private boolean isPaid(BookingStatus status) {
        return status == BookingStatus.CONFIRMED || 
               status == BookingStatus.ACTIVE || 
               status == BookingStatus.COMPLETED ||
               status == BookingStatus.IN_RENTAL ||
               status == BookingStatus.PAYMENT_VERIFIED ||
               status == BookingStatus.OWNER_APPROVED ||
               status == BookingStatus.READY_FOR_PICKUP ||
               status == BookingStatus.CHECKED_OUT;
    }

    @Transactional(readOnly = true)
    public CustomerDTOs.CustomerDashboardOverview getOverview(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<Booking> allUserBookings = bookingRepository.findByRenterId(userId);
        int totalBookings = allUserBookings.size();

        int upcomingCount = (int) allUserBookings.stream()
                .filter(b -> isUpcoming(b.getStatus()))
                .count();

        int pastCount = (int) allUserBookings.stream()
                .filter(b -> isPast(b.getStatus()))
                .count();

        BigDecimal totalSpent = allUserBookings.stream()
                .filter(b -> isPaid(b.getStatus()))
                .map(Booking::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int savedVehiclesCount = favoriteVehicleRepository.findByUserId(userId).size();
        int unreadNotificationsCount = (int) notificationRepository.countByUserIdAndIsReadFalse(userId);

        Optional<OwnerApplication> activeApp = ownerApplicationRepository.findByUserIdAndStatusNotIn(
                userId, List.of(com.luxeway.enums.OwnerApplicationStatus.CANCELLED));
        String appStatus = activeApp.map(a -> a.getStatus().name()).orElse("NONE");

        List<BookingDTOs.BookingResponse> recent = allUserBookings.stream()
                .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                .limit(5)
                .map(bookingService::toResponse)
                .collect(Collectors.toList());

        // Recommended vehicle query from DB: APPROVED + AVAILABLE
        VehicleDTOs.VehicleResponse recommendedVehicle = null;
        Pageable recPageable = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "rating").and(Sort.by(Sort.Direction.DESC, "totalBookings")));
        Page<Vehicle> recPage = vehicleRepository.findByStatusAndApprovalStatus(
                com.luxeway.enums.VehicleStatus.AVAILABLE,
                com.luxeway.enums.ApprovalStatus.APPROVED,
                recPageable
        );
        if (!recPage.isEmpty()) {
            recommendedVehicle = vehicleService.toResponse(recPage.getContent().get(0));
        }

        return CustomerDTOs.CustomerDashboardOverview.builder()
                .totalBookings(totalBookings)
                .upcomingBookingsCount(upcomingCount)
                .pastBookingsCount(pastCount)
                .totalSpent(totalSpent)
                .savedVehiclesCount(savedVehiclesCount)
                .unreadNotificationsCount(unreadNotificationsCount)
                .kycStatus(user.getKycStatus() != null ? user.getKycStatus() : "NOT_SUBMITTED")
                .kycVerified(Boolean.TRUE.equals(user.getKycVerified()) || Boolean.TRUE.equals(user.getVerified()))
                .isOwner(user.getRole() == UserRole.OWNER)
                .ownerApplicationStatus(appStatus)
                .recommendedVehicle(recommendedVehicle)
                .recentBookings(recent)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<BookingDTOs.BookingResponse> getBookings(String userId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null && !status.isBlank()) {
            try {
                BookingStatus bs = BookingStatus.valueOf(status.toUpperCase());
                return bookingRepository.findByRenterIdAndStatus(userId, bs, pageable)
                        .map(bookingService::toResponse);
            } catch (IllegalArgumentException ignored) {}
        }
        return bookingRepository.findByRenterId(userId, pageable)
                .map(bookingService::toResponse);
    }

    @Transactional(readOnly = true)
    public List<BookingDTOs.BookingResponse> getUpcomingBookings(String userId) {
        return bookingRepository.findByRenterId(userId).stream()
                .filter(b -> isUpcoming(b.getStatus()))
                .sorted((b1, b2) -> b1.getStartDate().compareTo(b2.getStartDate()))
                .map(bookingService::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTOs.BookingResponse> getPastBookings(String userId) {
        return bookingRepository.findByRenterId(userId).stream()
                .filter(b -> isPast(b.getStatus()))
                .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                .map(bookingService::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleDTOs.VehicleResponse> getSavedVehicles(String userId) {
        List<FavoriteVehicle> favorites = favoriteVehicleRepository.findByUserId(userId);
        return favorites.stream()
                .map(f -> vehicleService.toResponse(f.getVehicle()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PaymentDTOs.PaymentResponse> getPayments(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(p -> {
                    PaymentDTOs.PaymentResponse resp = new PaymentDTOs.PaymentResponse();
                    resp.setId(p.getId());
                    resp.setBookingId(p.getBooking() != null ? p.getBooking().getId() : null);
                    resp.setAmount(p.getAmount());
                    resp.setCurrency(p.getCurrency() != null ? p.getCurrency() : "VND");
                    resp.setMethod(p.getMethod() != null ? p.getMethod() : "PAYOS");
                    resp.setStatus(p.getStatus() != null ? p.getStatus().name() : "PAID");
                    resp.setTransactionId(p.getTransactionId());
                    resp.setCreatedAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
                    return resp;
                });
    }

    @Transactional(readOnly = true)
    public List<ReviewDTOs.ReviewResponse> getReviews(String userId) {
        return reviewRepository.findByReviewerIdOrderByCreatedAtDesc(userId, Pageable.unpaged())
                .getContent()
                .stream()
                .map(reviewService::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTOs.UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return userService.toProfileResponse(user);
    }
}
