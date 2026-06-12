package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "delivery_tracking")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class DeliveryTracking {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "booking_id", nullable = false, length = 36)
    private String bookingId; // References CarBooking or MotorbikeBooking

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User renter;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "WAITING_DEPARTURE"; // WAITING_DEPARTURE, EN_ROUTE, ARRIVED, COMPLETED

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "vehicle_latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal vehicleLatitude;

    @Column(name = "vehicle_longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal vehicleLongitude;

    @Column(name = "renter_latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal renterLatitude;

    @Column(name = "renter_longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal renterLongitude;

    private LocalDateTime eta;

    @Column(name = "distance_km", nullable = false, precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal distanceKm = BigDecimal.ZERO;

    @Column(name = "speed_kmh", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal speedKmh = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
