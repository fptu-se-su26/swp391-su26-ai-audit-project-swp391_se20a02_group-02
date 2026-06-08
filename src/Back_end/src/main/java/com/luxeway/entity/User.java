package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.luxeway.enums.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails {
    
    @Id
    @Column(length = 36)
    private String id;
    
    @Column(unique = true, nullable = false)
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    @JsonIgnore
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @Column(name = "first_name", nullable = false, length = 100)
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @Column(name = "display_name", length = 200)
    private String displayName;
    
    @Column(length = 500)
    private String avatar;
    
    @Column(length = 20)
    private String phone;

    @Column(length = 20, nullable = false)
    @Builder.Default
    private String provider = "LOCAL";

    @Column(name = "provider_id", length = 200)
    private String providerId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;
    
    @Column(name = "kyc_verified", nullable = false)
    @Builder.Default
    private Boolean kycVerified = false;
    
    @Column(name = "driving_license_verified", nullable = false)
    @Builder.Default
    private Boolean drivingLicenseVerified = false;
    
    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;
    
    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;
    
    @Column(name = "total_rentals")
    @Builder.Default
    private Integer totalRentals = 0;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(length = 200)
    private String location;
    
    // Account type fields (individual or business owner)
    @Column(name = "account_type", length = 20)
    @Builder.Default
    private String accountType = "INDIVIDUAL"; // INDIVIDUAL or BUSINESS

    @Column(name = "preferred_language", length = 10)
    @Builder.Default
    private String preferredLanguage = "en";

    
    @Column(name = "company_name", length = 200)
    private String companyName;
    
    @Column(name = "stripe_customer_id", length = 100)
    private String stripeCustomerId;
    
    @Column(name = "wallet_balance", precision = 18, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal walletBalance = BigDecimal.ZERO;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "joined_at", nullable = false)
    @CreatedDate
    private LocalDateTime joinedAt;
    
    @Column(name = "last_active")
    private LocalDateTime lastActive;
    
    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private OwnerProfile ownerProfile;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Vehicle> vehicles;
    
    @OneToMany(mappedBy = "renter", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Booking> rentals;
    
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Booking> bookingsAsOwner;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<UserDocument> documents;
    
    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == com.luxeway.enums.UserRole.SUPER_ADMIN) {
            return List.of(
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SUPER_ADMIN"),
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")
            );
        }
        return List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return isActive && verified;
    }
    
    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isOwner() {
        return role == UserRole.OWNER;
    }
    
    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
    
    public boolean isCustomer() {
        return role == UserRole.CUSTOMER;
    }
    
    public boolean isBusinessAccount() {
        return "BUSINESS".equals(accountType);
    }
    
    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (displayName == null) {
            displayName = getFullName();
        }
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
        lastActive = LocalDateTime.now();
    }
    
    @PreUpdate
    private void preUpdate() {
        lastActive = LocalDateTime.now();
    }
}