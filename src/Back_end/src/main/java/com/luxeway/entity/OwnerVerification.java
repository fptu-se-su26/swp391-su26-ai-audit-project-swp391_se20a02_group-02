package com.luxeway.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "owner_verifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerVerification {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private OwnerProfile owner;

    @NotBlank
    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType; // ID_CARD, BUSINESS_LICENSE

    @NotBlank
    @Column(name = "document_number", nullable = false, length = 100)
    private String documentNumber;

    @NotBlank
    @Column(name = "document_image_url", nullable = false, length = 500)
    private String documentImageUrl;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "reviewer_comment", length = 500)
    private String reviewerComment;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}
