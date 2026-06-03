package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Promotion {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "discount_percent", nullable = false)
    @Builder.Default
    private Integer discountPercent = 0;

    @Column(name = "badge_text", length = 100)
    private String badgeText;

    @Column(name = "cta_text", length = 100)
    @Builder.Default
    private String ctaText = "Book Now";

    @Column(name = "cta_url", length = 500)
    @Builder.Default
    private String ctaUrl = "/marketplace";

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }

    public boolean isCurrentlyActive() {
        LocalDateTime now = LocalDateTime.now();
        boolean activeFlag = Boolean.TRUE.equals(active);
        boolean notExpired = endDate == null || now.isBefore(endDate);
        boolean started = startDate == null || now.isAfter(startDate);
        return activeFlag && notExpired && started;
    }
}
