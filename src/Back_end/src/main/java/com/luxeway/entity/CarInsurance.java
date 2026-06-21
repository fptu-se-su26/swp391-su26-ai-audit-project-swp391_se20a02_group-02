package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "car_insurances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarInsurance {
    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    @JsonIgnore
    private Car car;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "cost_per_day", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal costPerDay = BigDecimal.ZERO;

    @Column(name = "coverage_limit", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal coverageLimit = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
