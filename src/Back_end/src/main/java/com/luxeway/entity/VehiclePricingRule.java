package com.luxeway.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "vehicle_pricing_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiclePricingRule {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @NotBlank
    @Column(name = "rule_type", nullable = false, length = 20)
    private String ruleType; // WEEKEND, HOLIDAY, SEASONAL

    @NotNull
    @Column(name = "multiplier", precision = 3, scale = 2, nullable = false)
    private BigDecimal multiplier;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(length = 100)
    private String name;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}
