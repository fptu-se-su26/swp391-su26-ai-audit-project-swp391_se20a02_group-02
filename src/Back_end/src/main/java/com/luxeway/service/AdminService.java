package com.luxeway.service;

import com.luxeway.dto.admin.AdminDTOs;
import com.luxeway.dto.booking.BookingDTOs;
import com.luxeway.dto.payment.PaymentDTOs;
import com.luxeway.dto.user.UserDTOs;
import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.Dispute;
import com.luxeway.entity.User;
import com.luxeway.entity.Vehicle;
import com.luxeway.enums.BookingStatus;
import com.luxeway.enums.UserRole;
import com.luxeway.enums.VehicleStatus;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final VehicleService vehicleService;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final DisputeRepository disputeRepository;
    private final UserDocumentRepository userDocumentRepository;

    // ====== Dashboard Statistics ======

    public AdminDTOs.DashboardStatsResponse getDashboardStats() {
        AdminDTOs.DashboardStatsResponse stats = new AdminDTOs.DashboardStatsResponse();

        // Users
        stats.setTotalUsers(userRepository.count());
        stats.setTotalCustomers(userRepository.countByRoleAndIsActiveTrue(UserRole.CUSTOMER));
        stats.setTotalOwners(userRepository.countByRoleAndIsActiveTrue(UserRole.OWNER));
        stats.setTotalAdmins(userRepository.countByRoleAndIsActiveTrue(UserRole.ADMIN));
        stats.setVerifiedUsers(userRepository.countVerifiedUsers());

        // Vehicles
        stats.setTotalVehicles(vehicleRepository.count());
        stats.setAvailableVehicles(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE));
        stats.setPendingApprovalVehicles(vehicleRepository.countByStatus(VehicleStatus.PENDING_APPROVAL));

        // Bookings
        stats.setTotalBookings(bookingRepository.count());
        stats.setPendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.setActiveBookings(bookingRepository.countByStatus(BookingStatus.ACTIVE));
        stats.setCompletedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED));
        stats.setCancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED));

        // Revenue
        BigDecimal revenue = bookingRepository.sumTotalRevenue();
        stats.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);

        return stats;
    }

    // ====== User Management ======

    public Page<UserDTOs.UserProfileResponse> listUsers(String role, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("joinedAt").descending());

        if (keyword != null && !keyword.isBlank()) {
            return userRepository.searchUsers(keyword, pageable).map(userService::toProfileResponse);
        }

        if (role != null && !role.isBlank()) {
            try {
                UserRole userRole = UserRole.valueOf(role.toUpperCase());
                return userRepository.findByRole(userRole, pageable).map(userService::toProfileResponse);
            } catch (IllegalArgumentException ignored) {}
        }

        return userRepository.findAll(pageable).map(userService::toProfileResponse);
    }

    @Transactional
    public UserDTOs.UserProfileResponse updateUserStatus(String userId, AdminDTOs.UpdateUserStatusRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(req.isActive());
        user.setVerified(req.isVerified());
        user.setKycVerified(req.isKycVerified());

        user = userRepository.save(user);
        log.info("Admin updated user {} status: active={}, verified={}, kyc={}", userId, req.isActive(), req.isVerified(), req.isKycVerified());
        return userService.toProfileResponse(user);
    }

    // ====== Vehicle Management ======

    public Page<VehicleDTOs.VehicleResponse> listPendingVehicles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return vehicleRepository.findByStatusOrderByCreatedAtDesc(VehicleStatus.PENDING_APPROVAL, pageable)
                .map(vehicleService::toResponse);
    }

    public Page<VehicleDTOs.VehicleResponse> listAllVehicles(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (status != null && !status.isBlank()) {
            try {
                VehicleStatus vehicleStatus = VehicleStatus.valueOf(status.toUpperCase());
                return vehicleRepository.findByStatus(vehicleStatus, pageable).map(vehicleService::toResponse);
            } catch (IllegalArgumentException ignored) {}
        }

        return vehicleRepository.findAll(pageable).map(vehicleService::toResponse);
    }

    @Transactional
    public VehicleDTOs.VehicleResponse approveVehicle(String vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setIsVerified(true);
        vehicle = vehicleRepository.save(vehicle);

        log.info("Vehicle {} approved by admin", vehicleId);
        return vehicleService.toResponse(vehicle);
    }

    @Transactional
    public VehicleDTOs.VehicleResponse rejectVehicle(String vehicleId, String reason) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setStatus(VehicleStatus.REJECTED);
        vehicle = vehicleRepository.save(vehicle);

        log.info("Vehicle {} rejected: {}", vehicleId, reason);
        return vehicleService.toResponse(vehicle);
    }

    // ====== Booking Management ======

    public Page<BookingDTOs.BookingResponse> listAllBookings(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (status != null && !status.isBlank()) {
            try {
                BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
                return bookingRepository.findByStatus(bookingStatus, pageable)
                        .map(bookingService::toResponse);
            } catch (IllegalArgumentException ignored) {}
        }

        return bookingRepository.findAll(pageable).map(bookingService::toResponse);
    }

    // ====== Payment Management ======

    public Page<PaymentDTOs.PaymentResponse> listAllPayments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return paymentRepository.findAllByOrderByCreatedAtDesc(pageable).map(paymentService::toResponse);
    }

    @Transactional
    public PaymentDTOs.PaymentResponse processRefund(String paymentId, AdminDTOs.RefundPaymentRequest req, String adminId) {
        return paymentService.refundPayment(paymentId, req.getRefundAmount(), adminId);
    }

    // ====== Dispute Management ======

    public java.util.List<Dispute> listAllDisputes() {
        return disputeRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Transactional
    public UserDTOs.DocumentResponse reviewDocument(String documentId, AdminDTOs.ReviewDocumentRequest req) {
        com.luxeway.entity.UserDocument doc = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String status = req.getStatus().toUpperCase();
        if (!status.equals("VERIFIED") && !status.equals("REJECTED")) {
            throw new IllegalArgumentException("Invalid status. Must be VERIFIED or REJECTED");
        }

        doc.setStatus(status);
        doc.setVerifiedAt(java.time.LocalDateTime.now());
        if (status.equals("REJECTED")) {
            doc.setRejectionReason(req.getRejectionReason());
        } else {
            doc.setRejectionReason(null);
        }

        doc = userDocumentRepository.save(doc);

        // Synchronize user verification flags
        User user = doc.getUser();
        String docType = doc.getDocumentType().toUpperCase();
        if (status.equals("VERIFIED")) {
            if (docType.equals("DRIVING_LICENSE")) {
                user.setDrivingLicenseVerified(true);
            } else if (docType.equals("PASSPORT") || docType.equals("NATIONAL_ID")) {
                user.setKycVerified(true);
            }
        } else {
            // REJECTED
            if (docType.equals("DRIVING_LICENSE")) {
                user.setDrivingLicenseVerified(false);
            } else if (docType.equals("PASSPORT") || docType.equals("NATIONAL_ID")) {
                user.setKycVerified(false);
            }
        }

        // Synchronize overall user.verified status (requires both driving license and kyc/passport/national id)
        if (Boolean.TRUE.equals(user.getKycVerified()) && Boolean.TRUE.equals(user.getDrivingLicenseVerified())) {
            user.setVerified(true);
        } else {
            user.setVerified(false);
        }

        userRepository.save(user);
        log.info("Document {} reviewed by admin. Status={}, User verified={}", documentId, status, user.getVerified());

        return userService.toDocumentResponse(doc);
    }
}
