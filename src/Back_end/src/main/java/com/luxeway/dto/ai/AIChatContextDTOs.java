package com.luxeway.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class AIChatContextDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingSummaryDTO {
        private String id;
        private String bookingCode;
        private String vehicleName;
        private String vehicleType;
        private String status;
        private String startDate;
        private String endDate;
        private BigDecimal total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleSummaryDTO {
        private String id;
        private String name;
        private String brand;
        private String model;
        private String category;
        private String vehicleType;
        private String status;
        private String approvalStatus;
        private String rejectionReason;
        private BigDecimal pricePerDay;
        private String licensePlate;
        private String city;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentSummaryDTO {
        private String id;
        private String bookingId;
        private BigDecimal amount;
        private String status;
        private String paymentMethod;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewSummaryDTO {
        private String id;
        private String reviewerName;
        private String vehicleName;
        private Integer rating;
        private String comment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerContextDTO {
        private String userId;
        private String displayName;
        private String email;
        private String kycStatus;
        private boolean kycVerified;
        private String licenseStatus;
        private String licenseNumber;
        private BigDecimal walletBalance;
        private int totalBookings;
        private int activeBookingsCount;
        private BigDecimal totalSpent;
        private List<BookingSummaryDTO> recentBookings;
        private List<BookingSummaryDTO> activeBookings;
        private List<PaymentSummaryDTO> recentPayments;
        private List<VehicleSummaryDTO> availableVehiclesForRent;
        private int unreadNotificationsCount;
        private int documentCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerContextDTO {
        private String ownerId;
        private String displayName;
        private String email;
        private int totalVehicles;
        private int availableVehicles;
        private int pendingApprovalVehicles;
        private int totalBookings;
        private int pendingRequestsCount;
        private BigDecimal totalRevenue;
        private Double rating;
        private int totalReviews;
        private List<VehicleSummaryDTO> vehicles;
        private List<BookingSummaryDTO> pendingRequests;
        private List<ReviewSummaryDTO> recentReviews;
        private boolean payoutEnabled;
        private String bankName;
        private String accountNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminContextDTO {
        private String adminId;
        private String adminName;
        private long totalUsers;
        private long totalVehicles;
        private long totalBookings;
        private long todayBookingsCount;
        private long pendingKycCount;
        private long pendingOwnerAppsCount;
        private long pendingVehicleApprovalsCount;
        private long unresolvedDisputesCount;
        private List<VehicleSummaryDTO> pendingVehicleApprovals;
        private List<String> pendingKycUsers;
        private List<String> pendingOwnerApplications;
    }
}
