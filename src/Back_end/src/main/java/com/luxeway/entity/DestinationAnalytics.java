package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "destination_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DestinationAnalytics {

    @Id
    @Column(length = 100)
    private String city;

    @Column(name = "vehicle_count", nullable = false)
    @Builder.Default
    private Integer vehicleCount = 0;

    @Column(name = "average_price", nullable = false)
    @Builder.Default
    private Long averagePrice = 0L;

    @Column(name = "top_category", length = 50)
    @Builder.Default
    private String topCategory = "economy";

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
