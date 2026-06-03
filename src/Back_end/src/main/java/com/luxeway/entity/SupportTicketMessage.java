package com.luxeway.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * A single message within a support ticket thread.
 * senderType = "USER" | "AGENT" determines who sent it.
 */
@Entity
@Table(name = "support_ticket_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class SupportTicketMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnore
    private SupportTicket ticket;

    /**
     * "USER" — message from the customer
     * "AGENT" — message from the support agent / admin
     */
    @Column(name = "sender_type", nullable = false, length = 10)
    private String senderType;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String message;

    @Column(name = "created_at", updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;
}
