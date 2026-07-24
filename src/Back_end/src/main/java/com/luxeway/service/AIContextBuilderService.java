package com.luxeway.service;

import com.luxeway.dto.ai.AIChatContextDTOs.*;
import com.luxeway.entity.*;
import com.luxeway.enums.*;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIContextBuilderService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final NotificationRepository notificationRepository;
    private final OwnerApplicationRepository ownerApplicationRepository;
    private final DisputeRepository disputeRepository;

    @Transactional(readOnly = true)
    public CustomerContextDTO buildCustomerContext(User user) {
        if (user == null) return null;
        String userId = user.getId();

        List<Booking> bookings = bookingRepository.findByRenterId(userId);
        List<Booking> recentBookings = bookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .collect(Collectors.toList());

        List<Booking> activeBookings = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || 
                             b.getStatus() == BookingStatus.ACTIVE || 
                             b.getStatus() == BookingStatus.IN_RENTAL || 
                             b.getStatus() == BookingStatus.WAITING_PAYMENT)
                .collect(Collectors.toList());

        List<Payment> payments = paymentRepository.findByRenterIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 10)).getContent();
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5)).getContent();
        List<UserDocument> documents = userDocumentRepository.findByUserId(userId);

        BigDecimal totalSpent = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.ACTIVE || b.getStatus() == BookingStatus.IN_RENTAL)
                .map(Booking::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CustomerContextDTO.builder()
                .userId(userId)
                .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getEmail())
                .email(user.getEmail())
                .kycStatus(user.getKycStatus() != null ? user.getKycStatus() : "NOT_SUBMITTED")
                .kycVerified(Boolean.TRUE.equals(user.getKycVerified()))
                .licenseStatus(user.getDriverLicenseStatus() != null ? user.getDriverLicenseStatus() : "NOT_SUBMITTED")
                .licenseNumber(user.getLicenseNumber())
                .walletBalance(user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO)
                .totalBookings(bookings.size())
                .activeBookingsCount(activeBookings.size())
                .totalSpent(totalSpent)
                .recentBookings(recentBookings.stream().map(this::mapToBookingSummary).collect(Collectors.toList()))
                .activeBookings(activeBookings.stream().map(this::mapToBookingSummary).collect(Collectors.toList()))
                .recentPayments(payments.stream().map(this::mapToPaymentSummary).collect(Collectors.toList()))
                .unreadNotificationsCount((int) notifications.stream().filter(n -> !Boolean.TRUE.equals(n.getRead())).count())
                .documentCount(documents.size())
                .build();
    }

    @Transactional(readOnly = true)
    public OwnerContextDTO buildOwnerContext(User user) {
        if (user == null) return null;
        String userId = user.getId();

        List<Vehicle> vehicles = vehicleRepository.findByOwnerIdOrderByCreatedAtDesc(userId);
        List<Booking> ownerBookings = bookingRepository.findByOwnerIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 50)).getContent();

        long pendingApprovalVehicles = vehicles.stream()
                .filter(v -> v.getApprovalStatus() == ApprovalStatus.SUBMITTED || v.getApprovalStatus() == ApprovalStatus.PENDING)
                .count();

        long availableVehicles = vehicles.stream()
                .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE && v.getApprovalStatus() == ApprovalStatus.APPROVED)
                .count();

        List<Booking> pendingRequests = ownerBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.WAITING_PAYMENT || b.getStatus() == BookingStatus.PAYMENT_PENDING)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = ownerBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.IN_RENTAL)
                .map(Booking::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Review> reviews = reviewRepository.findByOwnerId(userId);

        return OwnerContextDTO.builder()
                .ownerId(userId)
                .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getEmail())
                .email(user.getEmail())
                .totalVehicles(vehicles.size())
                .availableVehicles((int) availableVehicles)
                .pendingApprovalVehicles((int) pendingApprovalVehicles)
                .totalBookings(ownerBookings.size())
                .pendingRequestsCount(pendingRequests.size())
                .totalRevenue(totalRevenue)
                .rating(user.getRating() != null ? user.getRating().doubleValue() : 5.0)
                .totalReviews(reviews.size())
                .vehicles(vehicles.stream().map(this::mapToVehicleSummary).collect(Collectors.toList()))
                .pendingRequests(pendingRequests.stream().map(this::mapToBookingSummary).collect(Collectors.toList()))
                .recentReviews(reviews.stream().limit(3).map(this::mapToReviewSummary).collect(Collectors.toList()))
                .payoutEnabled(Boolean.TRUE.equals(user.getOwnerPayoutEnabled()))
                .bankName(user.getOwnerBankName())
                .accountNumber(user.getOwnerBankAccountNumber())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminContextDTO buildAdminContext(User user) {
        if (user == null) return null;

        long totalUsersCount = userRepository.count();
        long pendingKycCount = userRepository.countByKycStatus("PENDING_APPROVAL");
        long pendingOwnerAppsCount = ownerApplicationRepository.countByStatus("PENDING");
        long pendingVehicleApprovalsCount = vehicleRepository.countByApprovalStatus(ApprovalStatus.SUBMITTED);
        long totalVehiclesCount = vehicleRepository.count();
        long totalBookingsCount = bookingRepository.count();
        long totalDisputesCount = disputeRepository != null ? disputeRepository.count() : 0;

        List<Vehicle> pendingVehicles = vehicleRepository.findByApprovalStatus(ApprovalStatus.SUBMITTED);
        List<User> pendingKycUsers = userRepository.findByKycStatus("PENDING_APPROVAL");

        return AdminContextDTO.builder()
                .adminId(user.getId())
                .adminName(user.getDisplayName() != null ? user.getDisplayName() : user.getEmail())
                .totalUsers(totalUsersCount)
                .totalVehicles(totalVehiclesCount)
                .totalBookings(totalBookingsCount)
                .pendingKycCount(pendingKycCount)
                .pendingOwnerAppsCount(pendingOwnerAppsCount)
                .pendingVehicleApprovalsCount(pendingVehicleApprovalsCount)
                .unresolvedDisputesCount(totalDisputesCount)
                .pendingVehicleApprovals(pendingVehicles.stream().limit(5).map(this::mapToVehicleSummary).collect(Collectors.toList()))
                .pendingKycUsers(pendingKycUsers.stream().limit(5).map(u -> u.getEmail() + " (" + u.getDisplayName() + ")").collect(Collectors.toList()))
                .build();
    }

    private BookingSummaryDTO mapToBookingSummary(Booking b) {
        if (b == null) return null;
        return BookingSummaryDTO.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .vehicleName(b.getVehicle() != null ? b.getVehicle().getName() : "Vehicle")
                .vehicleType(b.getVehicle() != null && b.getVehicle().getVehicleType() != null ? b.getVehicle().getVehicleType().name() : "CAR")
                .status(b.getStatus() != null ? b.getStatus().name() : "PENDING")
                .startDate(b.getStartDate() != null ? b.getStartDate().toString() : "")
                .endDate(b.getEndDate() != null ? b.getEndDate().toString() : "")
                .total(b.getTotal())
                .build();
    }

    private VehicleSummaryDTO mapToVehicleSummary(Vehicle v) {
        if (v == null) return null;
        return VehicleSummaryDTO.builder()
                .id(v.getId())
                .name(v.getName())
                .brand(v.getBrand())
                .model(v.getModel())
                .category(v.getCategory() != null ? v.getCategory().name() : "SEDAN")
                .vehicleType(v.getVehicleType() != null ? v.getVehicleType().name() : "CAR")
                .status(v.getStatus() != null ? v.getStatus().name() : "AVAILABLE")
                .approvalStatus(v.getApprovalStatus() != null ? v.getApprovalStatus().name() : "APPROVED")
                .pricePerDay(v.getPricePerDay())
                .licensePlate(v.getLicensePlate())
                .city(v.getCity())
                .build();
    }

    private PaymentSummaryDTO mapToPaymentSummary(Payment p) {
        if (p == null) return null;
        return PaymentSummaryDTO.builder()
                .id(p.getId())
                .bookingId(p.getBooking() != null ? p.getBooking().getId() : "")
                .amount(p.getAmount())
                .status(p.getStatus() != null ? p.getStatus().name() : "PENDING")
                .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : "PAYOS")
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : "")
                .build();
    }

    private ReviewSummaryDTO mapToReviewSummary(Review r) {
        if (r == null) return null;
        return ReviewSummaryDTO.builder()
                .id(r.getId())
                .reviewerName(r.getReviewer() != null ? r.getReviewer().getDisplayName() : "Customer")
                .vehicleName(r.getVehicle() != null ? r.getVehicle().getName() : "Vehicle")
                .rating(r.getRating())
                .comment(r.getComment())
                .build();
    }
}
