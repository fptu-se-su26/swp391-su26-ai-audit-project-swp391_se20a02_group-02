package com.luxeway.service;

import com.luxeway.entity.Booking;
import com.luxeway.entity.Dispute;
import com.luxeway.entity.User;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.DisputeRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// BUG-15 FIX: Refactored to use @RequiredArgsConstructor (constructor injection) instead of @Autowired field injection.
// Constructor injection is the recommended pattern used throughout the rest of the codebase.
@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public Dispute createDispute(String bookingId, String reporterId, String reason, String description, String evidenceUrl) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        User reporter = userRepository.findById(reporterId).orElseThrow(() -> new RuntimeException("User not found"));

        if (!booking.getRenter().getId().equals(reporterId) && !booking.getOwner().getId().equals(reporterId)) {
            throw new RuntimeException("Only renter or owner can open a dispute for this booking");
        }

        Dispute dispute = Dispute.builder()
                .booking(booking)
                .reporter(reporter)
                .reason(reason)
                .description(description)
                .evidenceUrl(evidenceUrl)
                .status("OPEN")
                .build();

        Dispute saved = disputeRepository.save(dispute);
        try {
            emailService.sendAdminNotification(
                "New Dispute Ticket Opened #" + saved.getId(),
                "Dispute opened for Booking ID: " + booking.getId() + "\nReporter: " + reporter.getFullName() + "\nReason: " + reason + "\nDescription: " + description
            );
        } catch (Exception e) {
            log.warn("Failed to send admin dispute notification: {}", e.getMessage());
        }
        return saved;
    }

    public List<Dispute> getDisputesByBooking(String bookingId) {
        return disputeRepository.findByBookingId(bookingId);
    }

    public List<Dispute> getDisputesByBooking(String bookingId, String userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        if (!isAdmin && !booking.getRenter().getId().equals(userId) && !booking.getOwner().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to access dispute details for this booking");
        }
        return disputeRepository.findByBookingId(bookingId);
    }


    public List<Dispute> getDisputesByUser(String userId) {
        return disputeRepository.findByReporterId(userId);
    }

    @Transactional
    public Dispute updateDisputeStatus(Long id, String status, String adminDecision) {
        Dispute dispute = disputeRepository.findById(id).orElseThrow(() -> new RuntimeException("Dispute not found"));
        dispute.setStatus(status);
        if (adminDecision != null) {
            dispute.setAdminDecision(adminDecision);
        }
        Dispute saved = disputeRepository.save(dispute);
        try {
            emailService.sendDisputeUpdate(saved.getReporter().getEmail(), saved);
        } catch (Exception e) {
            log.warn("Failed to send dispute update email: {}", e.getMessage());
        }
        return saved;
    }
}
