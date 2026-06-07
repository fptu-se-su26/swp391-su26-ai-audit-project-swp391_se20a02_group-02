package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "motorbike_pricing")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotorbikePricing {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorbike_id", nullable = false)
    @JsonIgnore
    private Motorbike motorbike;

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
