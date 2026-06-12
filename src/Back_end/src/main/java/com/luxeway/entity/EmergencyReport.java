package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "emergency_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class EmergencyReport {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(name = "booking_id", length = 36)
    private String bookingId; // References CarBooking or MotorbikeBooking

    @Column(name = "vehicle_id", length = 36)
    private String vehicleId; // References Car or Motorbike

    @Column(name = "emergency_type", nullable = false, length = 50)
    private String emergencyType; // BREAKDOWN, ACCIDENT, LOST_KEY, UNSAFE, OWNER_NO_SHOW, CUSTOMER_NO_SHOW

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "contact_phone", nullable = false, length = 30)
    private String contactPhone;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "REPORTED"; // REPORTED, DISPATCHED, RESOLVED, CANCELLED

    @Column(name = "responder_notes", columnDefinition = "NVARCHAR(MAX)")
    private String responderNotes;

    @Column(name = "created_at", updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
