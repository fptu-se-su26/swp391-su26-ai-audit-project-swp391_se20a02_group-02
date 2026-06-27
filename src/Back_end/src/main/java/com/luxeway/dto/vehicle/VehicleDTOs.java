package com.luxeway.dto.vehicle;

import com.luxeway.enums.FuelType;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.VehicleCategory;
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
        private String status;
        private String approvalStatus;

        private Integer minRentalDays = 1;
        private Integer maxRentalDays = 30;
        private Boolean instantBook = false;
        private Boolean deliveryAvailable = false;
        private BigDecimal deliveryFee = BigDecimal.ZERO;

        // Top-level discriminator
        private String vehicleType;

        // Motorbike fields
        private Integer engineCc;
        private Boolean hasHelmet;
        private Boolean hasPhoneHolder;
        private Boolean hasRaincoat;
        private Boolean hasTouringPackage;

        // Car fields
        private Boolean hasChauffeur;
        private Boolean airportDelivery;
        private Boolean weddingRental;
        private Boolean businessRental;

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
        private String approvalStatus;
        private String approvalNote;
        private String approvedBy;
        private String approvedAt;
        private Double rating;
        private Integer totalReviews;
        private Integer totalBookings;
        private Integer rangeKm;
        private Boolean isVerified;
        private Boolean isFeatured;
        private Boolean instantBook;
        private Boolean deliveryAvailable;
        private BigDecimal deliveryFee;
        private List<String> images;
        private List<String> features;
        private String createdAt;
        private String updatedAt;

        // Ecosystem Restructure additions
        private String vehicleType;
        private Integer engineCc;
        private Boolean hasHelmet;
        private Boolean hasPhoneHolder;
        private Boolean hasRaincoat;
        private Boolean hasTouringPackage;
        private Boolean hasChauffeur;
        private Boolean airportDelivery;
        private Boolean weddingRental;
        private Boolean businessRental;

        // Custom detailed fields for Mioto-style detail view
        private Integer seatNumber;
        private String location;
        private BigDecimal discount;
        private BigDecimal finalPrice;

        private String primaryImage;
        private List<String> galleryImages;
        private List<String> vehicleImages;

        private String requiredDocuments;
        private String basicInsurance;
        private String extraInsurance;
        private String cancellationPolicy;
        private String depositPolicy;
        private String rentalRules;
        private Double distanceKm;

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

            // Host statistics additions
            private String ownerId;
            private String ownerName;
            private Integer totalTrips;
            private Double responseRate;
            private Integer responseTime;
            private Boolean approvalBadge;
        }
    }

    @Data
    public static class VehicleFilterRequest {
        private String location;
        private String keyword;
        private Double userLat;
        private Double userLng;
        // Single category (legacy)
        private String category;
        // Multi-select categories (new)
        private List<String> categories;
        // Multi-select brands
        private List<String> brands;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Integer minSeats;
        private String transmission;
        private String fuelType;
        private Double minRating;
        private boolean instantBook;
        private boolean deliveryAvailable;
        private boolean verifiedOnly;
        private boolean featured;
        private String sortBy; // price_asc, price_desc, rating, newest, popular
        private int page = 0;
        private int size = 12;
        private java.time.LocalDate startDate;
        private java.time.LocalDate endDate;

        // Filters added for Car/Motorbike ecosystem
        private String vehicleType;
        private Integer minEngineCc;
        private Integer maxEngineCc;
        private Boolean hasHelmet;
        private Boolean hasPhoneHolder;
        private Boolean hasRaincoat;
        private Boolean hasTouringPackage;
        private Boolean hasChauffeur;
        private Boolean airportDelivery;
        private Boolean weddingRental;
        private Boolean businessRental;
    }

    @Data
    public static class VehicleLocationResponse {
        private String id;
        private String name;
        private String brand;
        private String type;
        private String thumbnail;
        private BigDecimal pricePerDay;
        private BigDecimal discount;
        private BigDecimal finalPrice;
        private Double rating;
        private Integer totalTrips;
        private String address;
        private String city;
        private Double latitude;
        private Double longitude;
        private Boolean available;
        private String ownerName;
        private Double distanceKm;
    }
}
