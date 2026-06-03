package com.luxeway.service;

import com.luxeway.entity.Booking;
import com.luxeway.entity.DigitalContract;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.DigitalContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DigitalContractService {

    @Autowired
    private DigitalContractRepository contractRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    public DigitalContract createContract(String bookingId, String documentUrl, String requesterId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!isAdmin && !booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to create contract for this booking");
        }
        
        Optional<DigitalContract> existing = contractRepository.findByBookingId(bookingId);
        if (existing.isPresent()) {
            throw new RuntimeException("Contract already exists for this booking");
        }

        DigitalContract contract = DigitalContract.builder()
                .booking(booking)
                .documentUrl(documentUrl)
                .build();

        return contractRepository.save(contract);
    }

    public DigitalContract getContractByBooking(String bookingId, String requesterId, boolean isAdmin) {
        Optional<DigitalContract> contractOpt = contractRepository.findByBookingId(bookingId);
        if (contractOpt.isPresent()) {
            DigitalContract contract = contractOpt.get();
            Booking booking = contract.getBooking();
            if (!isAdmin && !booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
                throw new org.springframework.security.access.AccessDeniedException("Not authorized to view contract for this booking");
            }
            return contract;
        }
        return null;
    }

    @Transactional
    public DigitalContract signContract(Long contractId, String userId, String signature, boolean isOwner) {
        DigitalContract contract = contractRepository.findById(contractId).orElseThrow(() -> new RuntimeException("Contract not found"));
        Booking booking = contract.getBooking();

        if (isOwner) {
            if (!booking.getOwner().getId().equals(userId)) throw new RuntimeException("User is not the owner");
            contract.setOwnerSignature(signature);
            contract.setOwnerSignedAt(LocalDateTime.now());
        } else {
            if (!booking.getRenter().getId().equals(userId)) throw new RuntimeException("User is not the renter");
            contract.setRenterSignature(signature);
            contract.setRenterSignedAt(LocalDateTime.now());
        }

        contract.checkAndSetFullySigned();
        return contractRepository.save(contract);
    }
}
