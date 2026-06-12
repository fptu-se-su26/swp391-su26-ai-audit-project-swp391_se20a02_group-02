package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "service_name", nullable = false, unique = true, length = 100)
    private String serviceName; // BOOKING, PAYMENT, MAPS, NOTIFICATIONS, MESSAGING, EMAIL

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "OPERATIONAL"; // OPERATIONAL, DEGRADED, OUTAGE, MAINTENANCE

    @Column(length = 500)
    private String description;

    @Column(name = "last_updated", nullable = false)
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
}
