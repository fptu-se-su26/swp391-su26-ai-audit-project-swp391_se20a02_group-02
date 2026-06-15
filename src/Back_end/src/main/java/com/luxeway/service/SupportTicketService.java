package com.luxeway.service;

import com.luxeway.entity.*;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.SupportTicketMessageRepository;
import com.luxeway.repository.SupportTicketRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final SupportTicketMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    // ====== Create a new ticket ======
    @Transactional
    public Map<String, Object> createTicket(
            String userId,
            String subject,
            String category,
            String priority,
            String bookingId,
            String firstMessage) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .subject(subject)
                .category(category)
                .priority(priority != null ? priority : "NORMAL")
                .status("OPEN")
                .build();

        // Optionally link to booking
        if (bookingId != null && !bookingId.isBlank()) {
            bookingRepository.findById(bookingId).ifPresent(ticket::setBooking);
        }

        SupportTicket saved = ticketRepository.save(ticket);

        // Save the first message
        if (firstMessage != null && !firstMessage.isBlank()) {
            SupportTicketMessage msg = SupportTicketMessage.builder()
                    .ticket(saved)
                    .senderType("USER")
                    .message(firstMessage)
                    .build();
            messageRepository.save(msg);
        }

        // Notify admin
        try {
            emailService.sendAdminNotification(
                    "New Support Ticket #" + saved.getId() + " — " + subject,
                    "User: " + user.getEmail() + "\nCategory: " + category +
                    "\nPriority: " + priority + "\n\n" + firstMessage
            );
        } catch (Exception e) {
            log.warn("Failed to send admin ticket notification: {}", e.getMessage());
        }

        return mapTicket(saved, false);
    }

    // ====== Get all tickets for a user ======
    public List<Map<String, Object>> getMyTickets(String userId) {
        return ticketRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(t -> mapTicket(t, false))
                .collect(Collectors.toList());
    }

    // ====== Get full ticket with messages ======
    public Map<String, Object> getTicketDetail(Long ticketId, String userId, boolean isAdmin) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        if (!isAdmin && !ticket.getUserId().equals(userId)) {
            throw new AccessDeniedException("Not authorized to view this ticket");
        }

        return mapTicket(ticket, true);
    }

    // ====== Reply to a ticket ======
    @Transactional
    public Map<String, Object> replyToTicket(Long ticketId, String userId, String message, boolean isAdmin) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        if (!isAdmin && !ticket.getUserId().equals(userId)) {
            throw new AccessDeniedException("Not authorized to reply to this ticket");
        }

        String senderType = isAdmin ? "AGENT" : "USER";
        SupportTicketMessage msg = SupportTicketMessage.builder()
                .ticket(ticket)
                .senderType(senderType)
                .message(message)
                .build();
        messageRepository.save(msg);

        // If agent replies, move to IN_PROGRESS; if user replies on WAITING_USER, reopen
        if (isAdmin && "OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        } else if (!isAdmin && "WAITING_USER".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        }
        ticketRepository.save(ticket);

        return mapTicket(ticket, true);
    }

    // ====== Admin: update ticket status ======
    @Transactional
    public Map<String, Object> updateStatus(Long ticketId, String status) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        ticket.setStatus(status);
        return mapTicket(ticketRepository.save(ticket), false);
    }

    // ====== Admin: get all tickets ======
    public List<Map<String, Object>> getAllTickets() {
        return ticketRepository.findAll().stream()
                .sorted(Comparator.comparing(SupportTicket::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(t -> mapTicket(t, false))
                .collect(Collectors.toList());
    }

    // ======= Private helpers =======

    private Map<String, Object> mapTicket(SupportTicket t, boolean includeMessages) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", t.getId());
        m.put("subject", t.getSubject());
        m.put("category", t.getCategory());
        m.put("priority", t.getPriority());
        m.put("status", t.getStatus());
        m.put("userId", t.getUserId());
        m.put("userName", t.getUserName());
        m.put("userEmail", t.getUserEmail());
        m.put("bookingId", t.getBookingRef());
        m.put("createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : null);
        m.put("updatedAt", t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : null);

        if (includeMessages) {
            List<Map<String, Object>> msgs = messageRepository
                    .findByTicketIdOrderByCreatedAtAsc(t.getId())
                    .stream()
                    .map(msg -> {
                        Map<String, Object> mm = new HashMap<>();
                        mm.put("id", msg.getId());
                        mm.put("senderType", msg.getSenderType());
                        mm.put("message", msg.getMessage());
                        mm.put("createdAt", msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : null);
                        return mm;
                    })
                    .collect(Collectors.toList());
            m.put("messages", msgs);
            m.put("messageCount", msgs.size());
        }

        return m;
    }
}
