package com.luxeway.entity;

import com.luxeway.enums.OwnerApplicationDocumentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "owner_application_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerApplicationDocument {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private OwnerApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private OwnerApplicationDocumentType documentType;

    @Column(name = "file_reference", nullable = false, length = 500)
    private String fileReference;

    @Column(name = "verification_status", length = 50)
    @Builder.Default
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "rejection_reason", columnDefinition = "NVARCHAR(MAX)")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}
