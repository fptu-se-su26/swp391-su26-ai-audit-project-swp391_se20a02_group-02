package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "chauffeur_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChauffeurService {
    @Id
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private CarBooking booking;

    @Column(name = "chauffeur_name", nullable = false, length = 100)
    private String chauffeurName;

    @Column(name = "price_per_day", nullable = false, precision = 12, scale = 0)
    @Builder.Default
    private BigDecimal pricePerDay = BigDecimal.ZERO;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
