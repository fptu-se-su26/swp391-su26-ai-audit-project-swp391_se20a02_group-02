package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "owner_ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerRating {

    @Id
    @Column(name = "owner_id", length = 36)
    private String ownerId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "owner_id")
    private OwnerProfile owner;

    @Column(name = "avg_rating", precision = 3, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.valueOf(5.00);

    @Column(name = "total_reviews", nullable = false)
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "response_rate", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal responseRate = BigDecimal.valueOf(100.00);

    @Column(name = "avg_response_time_minutes", nullable = false)
    @Builder.Default
    private Integer avgResponseTimeMinutes = 15;
}
