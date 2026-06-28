package com.luxeway.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "insurance_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePackage {

    @Id
    @Column(length = 36)
    private String id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String provider;

    @NotNull
    @Column(name = "cost_per_day", precision = 18, scale = 2)
    private BigDecimal costPerDay = BigDecimal.ZERO;

    @NotNull
    @Column(name = "coverage_limit", precision = 18, scale = 2)
    private BigDecimal coverageLimit;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}
