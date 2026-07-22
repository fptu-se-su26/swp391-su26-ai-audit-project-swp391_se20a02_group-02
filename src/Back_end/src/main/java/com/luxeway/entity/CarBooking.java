package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.luxeway.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "car_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarBooking {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User renter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private BookingStatus status;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @Column(name = "price_per_day", nullable = false, precision = 12, scale = 0)
    private BigDecimal pricePerDay;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 0)
    private BigDecimal basePrice;

    @Column(name = "service_fee", nullable = false, precision = 12, scale = 0)
    private BigDecimal serviceFee;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal taxes;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal total;

    @Column(nullable = false, precision = 12, scale = 0)
    private BigDecimal deposit;

    @Column(name = "include_insurance", nullable = false)
    private boolean includeInsurance;

    @Column(name = "insurance_tier", length = 50)
    private String insuranceTier;

    @Column(name = "has_chauffeur", nullable = false)
    private boolean hasChauffeur;

    @Column(name = "airport_delivery", nullable = false)
    private boolean airportDelivery;

    @Column(name = "wedding_package", nullable = false)
    private boolean weddingPackage;

    @Column(name = "business_package", nullable = false)
    private boolean businessPackage;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(name = "pickup_location", length = 200)
    private String pickupLocation;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "owner_notes", length = 1000)
    private String ownerNotes;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CarDelivery delivery;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ChauffeurService chauffeurService;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private AirportTransferService airportTransferService;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
