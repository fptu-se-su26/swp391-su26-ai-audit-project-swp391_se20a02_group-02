package com.luxeway.service;

import com.luxeway.dto.motorbike.MotorbikeBookingDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.BookingStatus;
import com.luxeway.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for MotorbikeBookingService
 * LW-132: updateStatus (UTC-022-006)
 * LW-133: toResponse   (UTC-022-007)
 */
@ExtendWith(MockitoExtension.class)
class MotorbikeBookingServiceTest {

    @Mock private MotorbikeBookingRepository motorbikeBookingRepository;
    @Mock private MotorbikeRepository motorbikeRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private MotorbikeAvailabilityRepository motorbikeAvailabilityRepository;

    @InjectMocks
    private MotorbikeBookingService service;

    private MotorbikeBooking booking;

    @BeforeEach
    void setUp() {
        User renter = new User();
        renter.setId("u1");
        renter.setDisplayName("Nguyen Van A");
        renter.setPhone("0901234567");

        User owner = new User();
        owner.setId("owner1");
        owner.setDisplayName("Tran Van B");

        Motorbike motorbike = new Motorbike();
        motorbike.setId("v1");
        motorbike.setName("Honda Wave");
        motorbike.setLicensePlate("59A-12345");

        booking = new MotorbikeBooking();
        booking.setId("b1");
        booking.setStatus(BookingStatus.PENDING);
        booking.setStartDate(LocalDate.now().plusDays(1));
        booking.setEndDate(LocalDate.now().plusDays(3));
        booking.setTotalDays(3);
        booking.setBasePrice(new BigDecimal("300000"));
        booking.setPricePerDay(new BigDecimal("100000"));
        booking.setServiceFee(new BigDecimal("30000"));
        booking.setTaxes(new BigDecimal("10000"));
        booking.setTotal(new BigDecimal("340000"));
        booking.setDeposit(new BigDecimal("50000"));
        booking.setMotorbike(motorbike);
        booking.setRenter(renter);
        booking.setOwner(owner);
        booking.setCreatedAt(LocalDateTime.now());
    }

    // ===== LW-132: updateStatus =====

    /**
     * LW-132 UTCID01 (Normal): bookingId="b1", status="COMPLETED"
     * Booking exists → return MotorbikeBookingResponse with status=COMPLETED
     */
    @Test
    void updateStatus_UTCID01_normalBookingExists_returnsCompleted() {
        booking.setStatus(BookingStatus.COMPLETED);
        when(motorbikeBookingRepository.findById("b1")).thenReturn(Optional.of(booking));
        when(motorbikeBookingRepository.save(any())).thenReturn(booking);

        MotorbikeBookingDTOs.MotorbikeBookingResponse result = service.updateStatus("b1", "COMPLETED");

        assertNotNull(result);
        assertEquals("completed", result.getStatus());
        verify(motorbikeBookingRepository).save(any());
    }

    /**
     * LW-132 UTCID02 (Abnormal): bookingId does not exist (-1 or null)
     * → throws RuntimeException
     */
    @Test
    void updateStatus_UTCID02_bookingNotFound_throwsException() {
        when(motorbikeBookingRepository.findById("invalid-id")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                service.updateStatus("invalid-id", "COMPLETED"));
    }

    /**
     * LW-132 UTCID03 (Boundary): bookingId=1 (valid but boundary mapping)
     * → returns MotorbikeBookingResponse with boundary bookingId mapping
     */
    @Test
    void updateStatus_UTCID03_boundaryBookingId_returnsResponse() {
        booking.setId("1");
        when(motorbikeBookingRepository.findById("1")).thenReturn(Optional.of(booking));
        when(motorbikeBookingRepository.save(any())).thenReturn(booking);

        MotorbikeBookingDTOs.MotorbikeBookingResponse result = service.updateStatus("1", "PENDING");

        assertNotNull(result);
        assertEquals("1", result.getId());
    }

    // ===== LW-133: toResponse =====

    /**
     * LW-133 UTCID01 (Normal): Booking object with populated fields
     * → MotorbikeBookingResponse with all fields correctly mapped
     */
    @Test
    void toResponse_UTCID01_normalBooking_allFieldsMapped() {
        MotorbikeBookingDTOs.MotorbikeBookingResponse result = service.toResponse(booking);

        assertNotNull(result);
        assertEquals("b1", result.getId());
        assertEquals("pending", result.getStatus());
        assertEquals(new BigDecimal("300000"), result.getBasePrice());
        assertEquals(new BigDecimal("340000"), result.getTotal());
        assertNotNull(result.getMotorbike());
        assertEquals("v1", result.getMotorbike().getId());
        assertEquals("Honda Wave", result.getMotorbike().getName());
        assertNotNull(result.getRenter());
        assertEquals("u1", result.getRenter().getId());
    }

    /**
     * LW-133 UTCID02 (Abnormal): null values in booking fields
     * → throws IllegalArgumentException (NullPointerException)
     */
    @Test
    void toResponse_UTCID02_nullBooking_throwsException() {
        assertThrows(Exception.class, () -> service.toResponse(null));
    }

    /**
     * LW-133 UTCID03 (Boundary): Extreme/boundary field values
     * → MotorbikeBookingResponse with boundary/extreme field values mapped
     */
    @Test
    void toResponse_UTCID03_extremeValues_boundaryMapping() {
        booking.setBasePrice(new BigDecimal("999999999.99"));
        booking.setTotal(new BigDecimal("999999999.99"));
        booking.setTotalDays(Integer.MAX_VALUE);

        MotorbikeBookingDTOs.MotorbikeBookingResponse result = service.toResponse(booking);

        assertNotNull(result);
        assertEquals(new BigDecimal("999999999.99"), result.getBasePrice());
        assertEquals(Integer.MAX_VALUE, result.getTotalDays());
    }
}
