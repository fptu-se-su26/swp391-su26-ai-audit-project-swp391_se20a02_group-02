package com.luxeway.service;

import com.luxeway.entity.Booking;
import com.luxeway.entity.DigitalContract;
import com.luxeway.entity.User;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.DigitalContractRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DigitalContractServiceTest {

    @Mock
    private DigitalContractRepository contractRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private DigitalContractService digitalContractService;

    // =======================================================
    // Helper to build a standard Booking with owner/renter
    // =======================================================
    private Booking createBooking(String ownerId, String renterId) {
        User owner = User.builder().id(ownerId).build();
        User renter = User.builder().id(renterId).build();
        return Booking.builder().owner(owner).renter(renter).build();
    }

    // =======================================================
    // createContract
    // =======================================================

    @Test
    void createContract_ValidRequestAsOwner_CreatesAndSaves() {
        Booking booking = createBooking("owner1", "renter1");
        
        when(bookingRepository.findById("b1")).thenReturn(Optional.of(booking));
        when(contractRepository.findByBookingId("b1")).thenReturn(Optional.empty());
        when(contractRepository.save(any(DigitalContract.class))).thenAnswer(i -> i.getArgument(0));

        DigitalContract result = digitalContractService.createContract("b1", "http://doc.url", "owner1", false);

        assertEquals("http://doc.url", result.getDocumentUrl());
        assertEquals(booking, result.getBooking());
        verify(contractRepository).save(any(DigitalContract.class));
    }

    @Test
    void createContract_UnauthorizedUser_ThrowsAccessDenied() {
        Booking booking = createBooking("owner1", "renter1");
        
        when(bookingRepository.findById("b1")).thenReturn(Optional.of(booking));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, 
            () -> digitalContractService.createContract("b1", "url", "hacker", false));
    }

    @Test
    void createContract_AlreadyExists_ThrowsRuntimeException() {
        Booking booking = createBooking("owner1", "renter1");
        
        when(bookingRepository.findById("b1")).thenReturn(Optional.of(booking));
        when(contractRepository.findByBookingId("b1")).thenReturn(Optional.of(new DigitalContract()));

        Exception ex = assertThrows(RuntimeException.class, 
            () -> digitalContractService.createContract("b1", "url", "owner1", false));
        assertTrue(ex.getMessage().contains("Contract already exists"));
    }

    // =======================================================
    // getContractByBooking
    // =======================================================

    @Test
    void getContractByBooking_AuthorizedAsRenter_ReturnsContract() {
        Booking booking = createBooking("owner1", "renter1");
        DigitalContract contract = DigitalContract.builder().booking(booking).build();
        
        when(contractRepository.findByBookingId("b1")).thenReturn(Optional.of(contract));

        DigitalContract result = digitalContractService.getContractByBooking("b1", "renter1", false);
        assertEquals(contract, result);
    }

    @Test
    void getContractByBooking_Unauthorized_ThrowsAccessDenied() {
        Booking booking = createBooking("owner1", "renter1");
        DigitalContract contract = DigitalContract.builder().booking(booking).build();
        
        when(contractRepository.findByBookingId("b1")).thenReturn(Optional.of(contract));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, 
            () -> digitalContractService.getContractByBooking("b1", "hacker", false));
    }

    // =======================================================
    // signContract
    // =======================================================

    @Test
    void signContract_ValidOwner_SignsAndSetsTime() {
        Booking booking = createBooking("owner1", "renter1");
        DigitalContract contract = DigitalContract.builder().booking(booking).build();
        
        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
        when(contractRepository.save(any(DigitalContract.class))).thenAnswer(i -> i.getArgument(0));

        DigitalContract result = digitalContractService.signContract(1L, "owner1", "owner-sig", true);

        assertEquals("owner-sig", result.getOwnerSignature());
        assertNotNull(result.getOwnerSignedAt());
        assertNull(result.getRenterSignature());
        verify(contractRepository).save(contract);
    }

    @Test
    void signContract_ValidRenter_SignsAndSetsTime() {
        Booking booking = createBooking("owner1", "renter1");
        DigitalContract contract = DigitalContract.builder().booking(booking).build();
        
        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));
        when(contractRepository.save(any(DigitalContract.class))).thenAnswer(i -> i.getArgument(0));

        DigitalContract result = digitalContractService.signContract(1L, "renter1", "renter-sig", false);

        assertEquals("renter-sig", result.getRenterSignature());
        assertNotNull(result.getRenterSignedAt());
        assertNull(result.getOwnerSignature());
        verify(contractRepository).save(contract);
    }

    @Test
    void signContract_WrongUserTryingToSignAsOwner_ThrowsException() {
        Booking booking = createBooking("owner1", "renter1");
        DigitalContract contract = DigitalContract.builder().booking(booking).build();
        
        when(contractRepository.findById(1L)).thenReturn(Optional.of(contract));

        Exception ex = assertThrows(RuntimeException.class, 
            () -> digitalContractService.signContract(1L, "renter1", "sig", true));
        assertTrue(ex.getMessage().contains("User is not the owner"));
    }
}
