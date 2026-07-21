package com.luxeway.entity;

import com.luxeway.enums.OwnerApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "owner_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerApplication {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private OwnerApplicationStatus status = OwnerApplicationStatus.DRAFT;

    @Column(name = "current_step", nullable = false)
    @Builder.Default
    private Integer currentStep = 1;

    @Column(name = "rejection_reason", columnDefinition = "NVARCHAR(MAX)")
    private String rejectionReason;

    // Step 1: Personal Info
    @Column(name = "full_name", length = 200)
    private String fullName;

    @Column
    private LocalDate dob;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String city;

    // Step 3: Owner Profile
    @Column(name = "display_name", length = 200)
    private String displayName;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String bio;

    @Column(name = "service_area", length = 200)
    private String serviceArea;

    // Step 4: Payout
    @Column(name = "bank_name", length = 200)
    private String bankName;

    @Column(name = "account_holder_name", length = 200)
    private String accountHolderName;

    @Column(name = "masked_account_number", length = 100)
    private String maskedAccountNumber;

    @Column(name = "encrypted_account_number", length = 500)
    private String encryptedAccountNumber;

    // Step 5: Terms
    @Column(name = "terms_accepted")
    @Builder.Default
    private Boolean termsAccepted = false;

    @Column(name = "terms_version", length = 50)
    private String termsVersion;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User reviewedBy;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<OwnerApplicationDocument> documents;

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
