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
    public DigitalContract createContract(String bookingId, String documentUrl) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
        
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

    public DigitalContract getContractByBooking(String bookingId) {
        return contractRepository.findByBookingId(bookingId).orElse(null);
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
