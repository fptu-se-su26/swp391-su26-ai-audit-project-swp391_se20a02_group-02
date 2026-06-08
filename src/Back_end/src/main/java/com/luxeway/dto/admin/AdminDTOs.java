package com.luxeway.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

public class AdminDTOs {

    @Data
    public static class DashboardStatsResponse {
        // Users
        private long totalUsers;
        private long totalCustomers;
        private long totalOwners;
        private long totalAdmins;
        private long verifiedUsers;

        // Vehicles
        private long totalVehicles;
        private long availableVehicles;
        private long pendingApprovalVehicles;

        // Bookings
        private long totalBookings;
        private long pendingBookings;
        private long activeBookings;
        private long completedBookings;
        private long cancelledBookings;

        // Revenue
        private BigDecimal totalRevenue;
    }

    @Data
    public static class ApproveVehicleRequest {
        private boolean approved;
        @NotBlank
        private String reason; // required for rejection
    }

    @Data
    public static class UpdateUserStatusRequest {
        private boolean active;
        private boolean verified;
        private boolean kycVerified;
    }

    @Data
    public static class RefundPaymentRequest {
        private BigDecimal refundAmount; // null = full refund
        private String reason;
    }

    @Data
    public static class ReviewDocumentRequest {
        @NotBlank(message = "Status is required")
        private String status; // VERIFIED or REJECTED
        private String rejectionReason;
    }
}
