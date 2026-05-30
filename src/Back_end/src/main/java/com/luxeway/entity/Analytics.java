package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Analytics {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "record_date", nullable = false, unique = true)
    private LocalDate recordDate;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal revenue = BigDecimal.ZERO;

    @Column(name = "bookings_count", nullable = false)
    @Builder.Default
    private Integer bookingsCount = 0;

    @Column(name = "active_rentals", nullable = false)
    @Builder.Default
    private Integer activeRentals = 0;

    @Column(name = "new_users", nullable = false)
    @Builder.Default
    private Integer newUsers = 0;

    @Column(name = "new_vehicles", nullable = false)
    @Builder.Default
    private Integer newVehicles = 0;

    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
