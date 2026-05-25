package com.luxeway.dto.vehicle;

import com.luxeway.enums.FuelType;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.VehicleCategory;
import com.luxeway.enums.VehicleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

public class VehicleDTOs {

    @Data
    public static class CreateVehicleRequest {
        @NotBlank private String name;
        @NotBlank private String brand;
        @NotBlank private String model;
        @NotNull  private Integer year;
        @NotNull  private VehicleCategory category;
        private String description;

        @NotNull @Positive private BigDecimal pricePerDay;
        private BigDecimal pricePerWeek;
        @NotNull @Positive private BigDecimal deposit;

        @NotBlank private String city;
        private String country = "Vietnam";
        private String address;
        private Double latitude;
        private Double longitude;

        @NotNull private Integer seats;
        private Integer doors;
        private Integer horsepower;
        private Integer topSpeed;
        @NotNull private TransmissionType transmission;
        @NotNull private FuelType fuelType;
        private Integer rangeKm;
        private String engineSize;
        private String color;
        private String licensePlate;

        private Integer minRentalDays = 1;
        private Integer maxRentalDays = 30;
        private Boolean instantBook = false;
        private Boolean deliveryAvailable = false;
        private BigDecimal deliveryFee = BigDecimal.ZERO;

        private List<String> features;
        private List<String> imageUrls;
    }

    @Data
    public static class VehicleResponse {
        private String id;
        private OwnerInfo owner;
        private String name;
        private String brand;
        private String model;
        private Integer year;
        private String category;
        private String description;
        private String thumbnailUrl;
        private BigDecimal pricePerDay;
        private BigDecimal pricePerWeek;
        private BigDecimal deposit;
        private String city;
        private String country;
        private String address;
        private Double latitude;
        private Double longitude;
        private Integer seats;
        private Integer doors;
        private Integer horsepower;
        private String transmission;
        private String fuelType;
        private String color;
        private String licensePlate;
        private String status;
        private Double rating;
        private Integer totalReviews;
        private Integer totalBookings;
        private Boolean isVerified;
        private Boolean isFeatured;
        private Boolean instantBook;
        private Boolean deliveryAvailable;
        private BigDecimal deliveryFee;
        private List<String> images;
        private List<String> features;
        private String createdAt;
        private String updatedAt;

        @Data
        public static class OwnerInfo {
            private String id;
            private String displayName;
            private String avatar;
            private Double rating;
            private Integer totalReviews;
            private Boolean verified;
            private String accountType;
            private String companyName;
        }
    }

    @Data
    public static class VehicleFilterRequest {
        private String location;
        private String category;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Integer minSeats;
        private String transmission;
        private String fuelType;
        private Double minRating;
        private boolean instantBook;
        private boolean deliveryAvailable;
        private boolean verifiedOnly;
        private boolean isFeatured;
        private String sortBy; // price_asc, price_desc, rating, newest, popular
        private int page = 0;
        private int size = 12;
    }
}
