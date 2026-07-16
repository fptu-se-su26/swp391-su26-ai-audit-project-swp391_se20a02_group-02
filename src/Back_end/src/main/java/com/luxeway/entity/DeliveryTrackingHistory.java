package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "delivery_tracking_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class DeliveryTrackingHistory {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tracking_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private DeliveryTracking tracking;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "recorded_at", updatable = false)
    @CreatedDate
    private LocalDateTime recordedAt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }
}
