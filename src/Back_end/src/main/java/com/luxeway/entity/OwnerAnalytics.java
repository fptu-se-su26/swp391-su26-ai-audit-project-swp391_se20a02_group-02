package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "owner_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(OwnerAnalyticsId.class)
public class OwnerAnalytics {

    @Id
    @Column(name = "owner_id", length = 36)
    private String ownerId;

    @Id
    @Column(name = "year_month", length = 7)
    private String yearMonth; // 'YYYY-MM'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", insertable = false, updatable = false)
    private OwnerProfile owner;

    @Column(name = "monthly_revenue", precision = 18, scale = 2, nullable = false)
    private BigDecimal monthlyRevenue = BigDecimal.ZERO;

    @Column(name = "completed_bookings", nullable = false)
    private Integer completedBookings = 0;

    @Column(name = "utilization_rate", precision = 5, scale = 2, nullable = false)
    private BigDecimal utilizationRate = BigDecimal.ZERO;
}
