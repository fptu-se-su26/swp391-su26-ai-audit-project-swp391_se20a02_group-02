package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.luxeway.enums.FuelType;
import com.luxeway.enums.TransmissionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "car_specifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarSpecification {
    @Id
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Car car;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false)
    private Integer doors;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransmissionType transmission;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", nullable = false, length = 20)
    private FuelType fuelType;

    @Column(name = "has_chauffeur", nullable = false)
    @Builder.Default
    private Boolean hasChauffeur = false;

    @Column(name = "airport_delivery", nullable = false)
    @Builder.Default
    private Boolean airportDelivery = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean electric = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean hybrid = false;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
