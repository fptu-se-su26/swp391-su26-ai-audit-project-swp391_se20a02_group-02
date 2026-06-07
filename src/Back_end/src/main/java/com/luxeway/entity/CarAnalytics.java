package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "car_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarAnalytics {
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
