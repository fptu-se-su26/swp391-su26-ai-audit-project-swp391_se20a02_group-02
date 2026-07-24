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
import java.time.LocalDateTime;
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
    private final BookingService bookingService;
    private final VehicleService vehicleService;
    private final UserService userService;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public CustomerDTOs.CustomerDashboardOverview getOverview(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<Booking> allUserBookings = bookingRepository.findByCustomerId(userId);
        int totalBookings = allUserBookings.size();

        int upcomingCount = (int) allUserBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || 
                             b.getStatus() == BookingStatus.PAID || 
                             b.getStatus() == BookingStatus.PENDING_OWNER_CONFIRMATION || 
                             b.getStatus() == BookingStatus.AWAITING_PAYMENT || 
                             b.getStatus() == BookingStatus.ACTIVE || 
                             b.getStatus() == BookingStatus.IN_PROGRESS)
                .count();

        int pastCount = (int) allUserBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CANCELLED)
                .count();

        BigDecimal totalSpent = allUserBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PAID || b.getStatus() == BookingStatus.ACTIVE || b.getStatus() == BookingStatus.COMPLETED)
                .map(Booking::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int savedVehiclesCount = favoriteVehicleRepository.findByUserId(userId).size();
        int unreadNotificationsCount = (int) notificationRepository.countByUserIdAndReadFalse(userId);

        Optional<OwnerApplication> activeApp = ownerApplicationRepository.findByUserIdAndStatusNotIn(
                userId, List.of(com.luxeway.enums.OwnerApplicationStatus.CANCELLED));
        String appStatus = activeApp.map(a -> a.getStatus().name()).orElse("NONE");

        List<BookingDTOs.BookingResponse> recent = allUserBookings.stream()
                .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                .limit(5)
                .map(bookingService::toResponse)
                .collect(Collectors.toList());

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
                .recentBookings(recent)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<BookingDTOs.BookingResponse> getBookings(String userId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null && !status.isBlank()) {
            try {
                BookingStatus bs = BookingStatus.valueOf(status.toUpperCase());
                return bookingRepository.findByCustomerIdAndStatus(userId, bs, pageable)
                        .map(bookingService::toResponse);
            } catch (IllegalArgumentException ignored) {}
        }
        return bookingRepository.findByCustomerId(userId, pageable)
                .map(bookingService::toResponse);
    }

    @Transactional(readOnly = true)
    public List<BookingDTOs.BookingResponse> getUpcomingBookings(String userId) {
        return bookingRepository.findByCustomerId(userId).stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || 
                             b.getStatus() == BookingStatus.PAID || 
                             b.getStatus() == BookingStatus.PENDING_OWNER_CONFIRMATION || 
                             b.getStatus() == BookingStatus.AWAITING_PAYMENT || 
                             b.getStatus() == BookingStatus.ACTIVE || 
                             b.getStatus() == BookingStatus.IN_PROGRESS)
                .sorted((b1, b2) -> b1.getStartDate().compareTo(b2.getStartDate()))
                .map(bookingService::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDTOs.BookingResponse> getPastBookings(String userId) {
        return bookingRepository.findByCustomerId(userId).stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CANCELLED)
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
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return paymentRepository.findByBookingCustomerId(userId, pageable)
                .map(p -> PaymentDTOs.PaymentResponse.builder()
                        .id(p.getId())
                        .bookingId(p.getBooking().getId())
                        .amount(p.getAmount())
                        .currency(p.getCurrency() != null ? p.getCurrency() : "VND")
                        .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : "PAYOS")
                        .status(p.getStatus() != null ? p.getStatus().name() : "PAID")
                        .transactionId(p.getProviderTransactionId() != null ? p.getProviderTransactionId() : p.getTransactionId())
                        .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                        .paidAt(p.getPaidAt() != null ? p.getPaidAt().toString() : null)
                        .build());
    }

    @Transactional(readOnly = true)
    public List<ReviewDTOs.ReviewResponse> getReviews(String userId) {
        return reviewRepository.findByReviewerId(userId).stream()
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
