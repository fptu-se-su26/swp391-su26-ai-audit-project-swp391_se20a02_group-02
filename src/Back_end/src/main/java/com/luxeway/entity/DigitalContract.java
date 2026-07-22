package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "digital_contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class DigitalContract {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    private Booking booking;

    @Column(name = "document_url", nullable = false, length = 500)
    private String documentUrl;

    @Column(name = "docuseal_submission_id")
    private Long docusealSubmissionId;

    @Column(name = "docuseal_renter_submitter_id")
    private Long docusealRenterSubmitterId;

    @Column(name = "docuseal_owner_submitter_id")
    private Long docusealOwnerSubmitterId;

    @Column(name = "docuseal_renter_embed_url", length = 1000)
    private String docusealRenterEmbedUrl;

    @Column(name = "docuseal_owner_embed_url", length = 1000)
    private String docusealOwnerEmbedUrl;

    @Column(name = "docuseal_status", length = 50)
    private String docusealStatus;

    @Column(name = "docuseal_completed_document_url", length = 1000)
    private String docusealCompletedDocumentUrl;

    @Transient
    private String currentSignerEmbedUrl;

    @Column(name = "owner_signature", length = 500)
    private String ownerSignature;

    @Column(name = "renter_signature", length = 500)
    private String renterSignature;

    @Column(name = "owner_signed_at")
    private LocalDateTime ownerSignedAt;

    @Column(name = "renter_signed_at")
    private LocalDateTime renterSignedAt;

    @Column(name = "is_fully_signed", nullable = false)
    @Builder.Default
    private Boolean isFullySigned = false;

    @Column(name = "created_at", updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;
    
    public void checkAndSetFullySigned() {
        this.isFullySigned = hasSignature(ownerSignature, ownerSignedAt)
                && hasSignature(renterSignature, renterSignedAt);
    }

    private boolean hasSignature(String signature, LocalDateTime signedAt) {
        return signature != null && !signature.isBlank() && signedAt != null;
    }
}
