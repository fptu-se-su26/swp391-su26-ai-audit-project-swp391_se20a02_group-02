package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "motorbike_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotorbikeAnalytics {
    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal revenue = BigDecimal.ZERO;

    @Column(name = "bookings_count", nullable = false)
    @Builder.Default
    private Integer bookingsCount = 0;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
