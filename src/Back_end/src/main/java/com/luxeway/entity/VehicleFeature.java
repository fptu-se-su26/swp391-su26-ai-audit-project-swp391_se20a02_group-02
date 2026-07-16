package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "vehicle_features")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleFeature {
    
    @Id
    @Column(length = 36)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Vehicle vehicle;
    
    @Column(nullable = false, length = 100)
    @NotBlank(message = "Feature name is required")
    private String feature;
    
    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}