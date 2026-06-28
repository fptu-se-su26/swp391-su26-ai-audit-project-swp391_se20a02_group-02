package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.luxeway.enums.BookingStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Booking {
    
    @Id
    @Column(length = 36)
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnore
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renter_id", nullable = false)
    @JsonIgnore
    private User renter;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;
    
    // Dates
    @Column(name = "start_date", nullable = false)
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @Column(name = "total_days", nullable = false)
    private Integer totalDays;
    
    // Pricing
    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    private BigDecimal basePrice;
    
    @Column(name = "price_per_day", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Price per day is required")
    @Positive(message = "Price per day must be positive")
    private BigDecimal pricePerDay;
    
    @Column(name = "addons_total", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal addonsTotal = BigDecimal.ZERO;
    
    @Column(name = "insurance_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal insuranceFee = BigDecimal.ZERO;
    
    @Column(name = "delivery_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;
    
    @Column(name = "service_fee", nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Service fee is required")
    private BigDecimal serviceFee;
    
    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Taxes is required")
    private BigDecimal taxes;
    
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Total is required")
    @Positive(message = "Total must be positive")
    private BigDecimal total;
    
    @Column(nullable = false, precision = 10, scale = 2)
    @NotNull(message = "Deposit is required")
    @Positive(message = "Deposit must be positive")
    private BigDecimal deposit;
    
    @Column(name = "deposit_refunded", nullable = false)
    @Builder.Default
    private Boolean depositRefunded = false;
    
    // Options
    @Column(name = "include_insurance", nullable = false)
    @Builder.Default
    private Boolean includeInsurance = false;
    
    @Column(name = "include_delivery", nullable = false)
    @Builder.Default
    private Boolean includeDelivery = false;
    
    @Column(name = "delivery_address", columnDefinition = "NVARCHAR(MAX)")
    private String deliveryAddress;
    
    @Column(name = "pickup_location", length = 500)
    private String pickupLocation;
    
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;
    
    @Column(name = "owner_notes", columnDefinition = "NVARCHAR(MAX)")
    private String ownerNotes;
    
    // Tracking
    @Column(name = "check_in_odometer")
    private Integer checkInOdometer;
    
    @Column(name = "check_out_odometer")
    private Integer checkOutOdometer;
    
    @Column(name = "damage_report", columnDefinition = "NVARCHAR(MAX)")
    private String damageReport;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "cancellation_reason", columnDefinition = "NVARCHAR(MAX)")
    private String cancellationReason;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private BookingDelivery delivery;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private BookingCancellation cancellation;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.Set<BookingStatusHistory> statusHistory;

    @Column(name = "created_at", nullable = false)
    @CreatedDate
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean canBeCancelled() {
        return status == BookingStatus.PENDING || status == BookingStatus.CONFIRMED;
    }
    
    public boolean isActive() {
        return status == BookingStatus.ACTIVE;
    }
    
    public boolean isCompleted() {
        return status == BookingStatus.COMPLETED;
    }
    
    public boolean isCancelled() {
        return status == BookingStatus.CANCELLED;
    }
    
    public boolean isOwner(String userId) {
        return owner != null && owner.getId().equals(userId);
    }
    
    public boolean isRenter(String userId) {
        return renter != null && renter.getId().equals(userId);
    }
    
    public String getVehicleName() {
        return vehicle != null ? vehicle.getName() : "Unknown Vehicle";
    }
    
    public String getRenterName() {
        return renter != null ? renter.getFullName() : "Unknown Renter";
    }
    
    public String getOwnerName() {
        return owner != null ? owner.getFullName() : "Unknown Owner";
    }
    
    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (totalDays == null && startDate != null && endDate != null) {
            totalDays = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
    }
    
    @PreUpdate
    private void preUpdate() {
        if (startDate != null && endDate != null) {
            totalDays = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
    }
}