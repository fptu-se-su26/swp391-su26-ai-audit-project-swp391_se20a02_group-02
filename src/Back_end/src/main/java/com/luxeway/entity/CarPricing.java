package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "car_pricing")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarPricing {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    @JsonIgnore
    private Car car;

    @Column(name = "weekend_multiplier", nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal weekendMultiplier = BigDecimal.ONE;

    @Column(name = "holiday_multiplier", nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal holidayMultiplier = BigDecimal.ONE;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
