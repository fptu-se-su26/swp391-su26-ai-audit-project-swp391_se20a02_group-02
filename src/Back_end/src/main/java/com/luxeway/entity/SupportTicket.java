package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A support request submitted by an authenticated user.
 * Can optionally reference a booking to give agents booking context.
 */
@Entity
@Table(name = "support_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    /**
     * Optional: link this ticket to a specific booking for context-aware support.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = true)
    @JsonIgnore
    private Booking booking;

    @Column(nullable = false, length = 300)
    private String subject;

    /**
     * Category of issue: BOOKING, PAYMENT, VEHICLE, ACCOUNT, KYC, DISPUTE, OTHER
     */
    @Column(nullable = false, length = 100)
    private String category;

    /**
     * Priority: LOW, NORMAL, HIGH, URGENT
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String priority = "NORMAL";

    /**
     * Status: OPEN, IN_PROGRESS, WAITING_USER, RESOLVED, CLOSED
     */
    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "OPEN";

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SupportTicketMessage> messages = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    // ====== JSON convenience fields ======
    @com.fasterxml.jackson.annotation.JsonProperty("userId")
    public String getUserId() {
        return user != null ? user.getId() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("userName")
    public String getUserName() {
        return user != null ? user.getDisplayName() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("userEmail")
    public String getUserEmail() {
        return user != null ? user.getEmail() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("bookingId")
    public String getBookingRef() {
        return booking != null ? booking.getId() : null;
    }
}
