package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.luxeway.enums.TransmissionType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "motorbike_specifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotorbikeSpecification {
    @Id
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorbike_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Motorbike motorbike;

    @Column(name = "engine_cc", nullable = false)
    private Integer engineCc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransmissionType transmission;

    @Column(name = "helmet_included", nullable = false)
    @Builder.Default
    private Boolean helmetIncluded = true;

    @Column(name = "raincoat_included", nullable = false)
    @Builder.Default
    private Boolean raincoatIncluded = true;

    @Column(name = "phone_holder", nullable = false)
    @Builder.Default
    private Boolean phoneHolder = false;

    @Column(name = "luggage_rack", nullable = false)
    @Builder.Default
    private Boolean luggageRack = false;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
