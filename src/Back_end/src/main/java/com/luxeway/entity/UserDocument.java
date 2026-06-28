package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class UserDocument {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    /**
     * Document type: PASSPORT, NATIONAL_ID, DRIVING_LICENSE, INSURANCE
     */
    @Column(name = "document_type", nullable = false, length = 30)
    @NotBlank(message = "Document type is required")
    private String documentType;

    @Column(nullable = false, length = 500)
    @NotBlank(message = "Document URL is required")
    private String url;

    /**
     * Verification status: PENDING, VERIFIED, REJECTED
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "uploaded_at", nullable = false)
    @CreatedDate
    private LocalDateTime uploadedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "rejection_reason", columnDefinition = "NVARCHAR(MAX)")
    private String rejectionReason;

    // ===== eKYC fields =====

    @Column(name = "ekyc_raw_data", columnDefinition = "NVARCHAR(MAX)")
    private String ekycRawData;

    @Column(name = "ekyc_id_number", length = 20)
    private String ekycIdNumber;

    @Column(name = "ekyc_full_name", length = 200)
    private String ekycFullName;

    @Column(name = "ekyc_dob", length = 20)
    private String ekycDob;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
