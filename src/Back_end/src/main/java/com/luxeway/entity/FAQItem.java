package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faq_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FAQItem {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private FAQCategory category;

    @Column(nullable = false, length = 300)
    private String question;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String answer;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
