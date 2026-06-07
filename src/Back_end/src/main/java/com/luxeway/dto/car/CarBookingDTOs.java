package com.luxeway.dto.car;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CarBookingDTOs {

    @Data
    public static class CreateCarBookingRequest {
        @NotBlank(message = "Car ID is required")
        private String carId;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;

        private boolean includeInsurance = false;
        private String insuranceTier; // basic, premium, zero
        private boolean hasChauffeur = false;
        private boolean airportDelivery = false;
        private boolean weddingPackage = false;
        private boolean businessPackage = false;
        
        private String deliveryAddress;
        private String pickupLocation;
        private String notes;
        private String couponCode;
    }

    @Data
    public static class CarBookingResponse {
        private String id;
        private CarInfo car;
        private UserInfo renter;
        private UserInfo owner;
        private String status;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer totalDays;
        
        // Pricing
        private BigDecimal basePrice;
        private BigDecimal pricePerDay;
        private BigDecimal serviceFee;
        private BigDecimal taxes;
        private BigDecimal total;
        private BigDecimal deposit;

        private boolean includeInsurance;
        private String insuranceTier;
        private boolean hasChauffeur;
        private boolean airportDelivery;
        private boolean weddingPackage;
        private boolean businessPackage;
        
        private String deliveryAddress;
        private String pickupLocation;
        private String notes;
        private String ownerNotes;
        private String couponCode;
        private String createdAt;

        @Data
        public static class CarInfo {
            private String id;
            private String name;
            private String brandName;
            private String modelName;
            private String category;
            private String licensePlate;
            private String thumbnailUrl;
        }

        @Data
        public static class UserInfo {
            private String id;
            private String displayName;
            private String avatar;
            private String phone;
        }
    }
}
