package com.luxeway.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyBooking {
    @Id
    @Column(name = "booking_id", length = 36)
    private String bookingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "approved_by", length = 36)
    private String approvedBy;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PENDING_APPROVAL"; // PENDING_APPROVAL, APPROVED, REJECTED

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
}
