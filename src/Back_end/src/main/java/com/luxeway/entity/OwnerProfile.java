package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "owners")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerProfile {

    @Id
    @Column(name = "owner_id", length = 36)
    private String ownerId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "owner_id")
    @JsonIgnore
    private User user;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Builder.Default
    @Column(name = "account_type", nullable = false, length = 20)
    private String accountType = "INDIVIDUAL"; // INDIVIDUAL, BUSINESS

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "stripe_account_id", length = 100)
    private String stripeAccountId;

    @Builder.Default
    @Column(name = "wallet_balance", precision = 18, scale = 2, nullable = false)
    private BigDecimal walletBalance = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private OwnerRating rating;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<OwnerVerification> verifications = new java.util.HashSet<>();

    // Commented out because Vehicle.owner maps to User entity type, not OwnerProfile.
    // Use ownerProfile.getUser().getVehicles() instead to avoid Hibernate mapping conflicts.
    // @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    // private Set<Vehicle> vehicles;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
