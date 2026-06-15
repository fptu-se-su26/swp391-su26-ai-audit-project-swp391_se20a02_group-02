package com.luxeway.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class BookingDTOs {

    @Data
    public static class CreateBookingRequest {
        @NotBlank(message = "Vehicle ID is required")
        private String vehicleId;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;

        private boolean includeInsurance = false;
        private boolean includeDelivery = false;
        private String deliveryAddress;
        private String pickupLocation;
        private String notes;
        private String couponCode;
        private List<String> addonIds;
    }

    @Data
    public static class BookingResponse {
        private String id;
        private VehicleInfo vehicle;
        private UserInfo renter;
        private UserInfo owner;
        private String status;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer totalDays;
        private PricingInfo pricing;
        private boolean includeInsurance;
        private boolean includeDelivery;
        private String deliveryAddress;
        private String pickupLocation;
        private String notes;
        private String ownerNotes;
        private String couponCode;
        private String createdAt;
        private String updatedAt;
        private String cancelledAt;
        private String cancellationReason;

        @Data
        public static class VehicleInfo {
            private String id;
            private String name;
            private String brand;
            private String thumbnailUrl;
            private String city;
            private String category;
        }

        @Data
        public static class UserInfo {
            private String id;
            private String displayName;
            private String avatar;
            private String phone;
            private Double rating;
        }

        @Data
        public static class PricingInfo {
            private BigDecimal basePrice;
            private BigDecimal pricePerDay;
            private BigDecimal addonsTotal;
            private BigDecimal insuranceFee;
            private BigDecimal deliveryFee;
            private BigDecimal serviceFee;
            private BigDecimal taxes;
            private BigDecimal discount;
            private BigDecimal total;
            private BigDecimal deposit;
            private boolean depositRefunded;
        }
    }

    @Data
    public static class CancelBookingRequest {
        @NotBlank(message = "Cancellation reason is required")
        private String reason;
    }

    @Data
    public static class UpdateBookingStatusRequest {
        @NotBlank
        private String status; // confirmed, active, completed, cancelled
        private String ownerNotes;
    }
}
