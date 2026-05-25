package com.luxeway.service;

import com.luxeway.entity.Booking;
import com.luxeway.entity.Dispute;
import com.luxeway.entity.User;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.DisputeRepository;
import com.luxeway.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DisputeService {

    @Autowired
    private DisputeRepository disputeRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;

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

        return disputeRepository.save(dispute);
    }

    public List<Dispute> getDisputesByBooking(String bookingId) {
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
        return disputeRepository.save(dispute);
    }
}
