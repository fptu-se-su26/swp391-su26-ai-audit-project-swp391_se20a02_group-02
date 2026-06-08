package com.luxeway.dto.motorbike;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

public class MotorbikeBookingDTOs {

    @Data
    public static class CreateMotorbikeBookingRequest {
        @NotBlank(message = "Motorbike ID is required")
        private String motorbikeId;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;

        private boolean includeInsurance = false;
        private boolean hasHelmet = false;
        private boolean hasRaincoat = false;
        private boolean hasPhoneHolder = false;
        private boolean hasTouringPackage = false;
        
        private String notes;
        private String couponCode;
    }

    @Data
    public static class MotorbikeBookingResponse {
        private String id;
        private MotorbikeInfo motorbike;
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
        private boolean hasHelmet;
        private boolean hasRaincoat;
        private boolean hasPhoneHolder;
        private boolean hasTouringPackage;
        
        private String notes;
        private String ownerNotes;
        private String couponCode;
        private String createdAt;

        @Data
        public static class MotorbikeInfo {
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
