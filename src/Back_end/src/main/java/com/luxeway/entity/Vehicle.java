package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.luxeway.enums.VehicleCategory;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.enums.VehicleType;
import com.luxeway.enums.TransmissionType;
import com.luxeway.enums.FuelType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Vehicle {
    
    @Id
    @Column(length = 36)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;
    
    @Column(nullable = false, length = 200)
    @NotBlank(message = "Vehicle name is required")
    private String name;
    
    @Column(nullable = false, length = 100)
    @NotBlank(message = "Brand is required")
    private String brand;
    
    @Column(nullable = false, length = 100)
    @NotBlank(message = "Model is required")
    private String model;
    
    @Column(name = "`year`", nullable = false)
    @NotNull(message = "Year is required")
    private Integer year;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ====== VEHICLE TYPE DISCRIMINATOR (CAR vs MOTORBIKE) ======
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    @Builder.Default
    private VehicleType vehicleType = VehicleType.CAR;

    // ====== MOTORBIKE-SPECIFIC FIELDS ======
    @Column(name = "engine_cc")
    private Integer engineCc;

    @Column(name = "has_helmet")
    @Builder.Default
    private Boolean hasHelmet = false;

    @Column(name = "has_phone_holder")
    @Builder.Default
    private Boolean hasPhoneHolder = false;

    @Column(name = "has_raincoat")
    @Builder.Default
    private Boolean hasRaincoat = false;

    @Column(name = "has_touring_package")
    @Builder.Default
    private Boolean hasTouringPackage = false;

    // ====== CAR-SPECIFIC FIELDS ======
    @Column(name = "has_chauffeur")
    @Builder.Default
    private Boolean hasChauffeur = false;

    @Column(name = "airport_delivery")
    @Builder.Default
    private Boolean airportDelivery = false;

    @Column(name = "wedding_rental")
    @Builder.Default
    private Boolean weddingRental = false;

    @Column(name = "business_rental")
    @Builder.Default
    private Boolean businessRental = false;


    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @Column(name = "price_per_day", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Price per day is required")
    @Positive(message = "Price must be positive")
    private BigDecimal pricePerDay;
    
    @Column(name = "price_per_week", precision = 10, scale = 2)
    private BigDecimal pricePerWeek;
    
    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Deposit is required")
    @Positive(message = "Deposit must be positive")
    private BigDecimal deposit;
    
    // Location fields
    @Column(nullable = false, length = 100)
    @NotBlank(message = "City is required")
    private String city;
    
    @Column(length = 100)
    @Builder.Default
    private String country = "Vietnam";
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;
    
    // Specs fields
    private Integer horsepower;
    
    @Column(name = "top_speed")
    private Integer topSpeed;
    
    @Column(precision = 4, scale = 2)
    private BigDecimal acceleration;
    
    @Column(nullable = false)
    @NotNull(message = "Number of seats is required")
    private Integer seats;
    
    private Integer doors;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransmissionType transmission;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", nullable = false)
    private FuelType fuelType;
    
    @Column(name = "range_km")
    private Integer rangeKm;
    
    @Column(name = "engine_size", length = 20)
    private String engineSize;
    
    @Column(length = 50)
    private String color;
    
    @Column(name = "license_plate", length = 20, unique = true)
    private String licensePlate;
    
    // Availability fields
    @Column(name = "min_rental_days")
    @Builder.Default
    private Integer minRentalDays = 1;
    
    @Column(name = "max_rental_days")
    @Builder.Default
    private Integer maxRentalDays = 30;
    
    @Column(name = "advance_booking_days")
    @Builder.Default
    private Integer advanceBookingDays = 365;
    
    // Status & Metrics
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.PENDING_APPROVAL;
    
    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;
    
    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;
    
    @Column(name = "total_bookings")
    @Builder.Default
    private Integer totalBookings = 0;
    
    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;
    
    @Column(name = "is_featured", nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;
    
    @Column(name = "instant_book", nullable = false)
    @Builder.Default
    private Boolean instantBook = false;
    
    @Column(name = "delivery_available", nullable = false)
    @Builder.Default
    private Boolean deliveryAvailable = false;
    
    @Column(name = "delivery_fee", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;
    
    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToOne(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private VehicleSpecification specification;

    @OneToOne(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private VehicleLocation location;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<VehicleAvailability> availabilities;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<VehiclePricingRule> pricingRules;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<VehicleImage> images;
    
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<VehicleFeature> features;
    
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Booking> bookings;
    
    // Helper methods
    public boolean isAvailable() {
        return status == VehicleStatus.AVAILABLE;
    }
    
    public boolean isOwner(String userId) {
        return owner != null && owner.getId().equals(userId);
    }
    
    public String getOwnerName() {
        return owner != null ? owner.getFullName() : "Unknown";
    }
    
    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }

    @com.fasterxml.jackson.annotation.JsonProperty("location")
    public java.util.Map<String, Object> getLocationData() {
        java.util.Map<String, Object> loc = new java.util.HashMap<>();
        loc.put("city", this.city);
        loc.put("country", this.country);
        loc.put("address", this.address);
        loc.put("lat", this.latitude);
        loc.put("lng", this.longitude);
        loc.put("timezone", "Asia/Ho_Chi_Minh");
        return loc;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("specs")
    public java.util.Map<String, Object> getSpecsData() {
        java.util.Map<String, Object> sp = new java.util.HashMap<>();
        sp.put("horsepower", this.horsepower);
        sp.put("topSpeed", this.topSpeed);
        sp.put("acceleration", this.acceleration);
        sp.put("seats", this.seats);
        sp.put("doors", this.doors);
        sp.put("transmission", this.transmission != null ? this.transmission.name().toLowerCase() : null);
        sp.put("fuelType", this.fuelType != null ? this.fuelType.name().toLowerCase() : null);
        sp.put("range", this.rangeKm);
        sp.put("engineSize", this.engineSize);
        sp.put("color", this.color);
        sp.put("licensePlate", this.licensePlate);
        return sp;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("images")
    public java.util.List<String> getImagesList() {
        if (this.images == null) return new java.util.ArrayList<>();
        return this.images.stream()
                .sorted(java.util.Comparator.comparing(VehicleImage::getSortOrder, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())))
                .map(VehicleImage::getUrl)
                .collect(java.util.stream.Collectors.toList());
    }

    @com.fasterxml.jackson.annotation.JsonProperty("features")
    public java.util.List<String> getFeaturesList() {
        if (this.features == null) return new java.util.ArrayList<>();
        return this.features.stream().map(VehicleFeature::getFeature).collect(java.util.stream.Collectors.toList());
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ownerId")
    public String getOwnerIdProperty() {
        return this.owner != null ? this.owner.getId() : null;
    }
}