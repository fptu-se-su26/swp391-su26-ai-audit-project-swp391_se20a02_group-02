package com.luxeway.service;

import com.luxeway.dto.motorbike.MotorbikeBookingDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.BookingStatus;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @deprecated Use {@link BookingService} instead.
 * Handled in Phase 1 by delegating internal persistence to the unified bookings table.
 */
@Deprecated
@Slf4j
@Service
@RequiredArgsConstructor
public class MotorbikeBookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final VehicleAvailabilityRepository vehicleAvailabilityRepository;

    @Transactional
    public MotorbikeBookingDTOs.MotorbikeBookingResponse createBooking(String renterId, MotorbikeBookingDTOs.CreateMotorbikeBookingRequest req) {
        if (req.getStartDate() == null || req.getEndDate() == null) {
            throw new RuntimeException("Start date and end date are required");
        }
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new RuntimeException("End date must be on or after start date");
        }
        if (req.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }

        Vehicle motorbike = vehicleRepository.findByIdForUpdate(req.getMotorbikeId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + req.getMotorbikeId()));

        if (motorbike.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("Motorbike is not available for booking (status: " + motorbike.getStatus() + ")");
        }

        if (bookingRepository.hasConflictingBooking(req.getMotorbikeId(), req.getStartDate(), req.getEndDate())) {
            throw new RuntimeException("Motorbike is already booked for these dates.");
        }

        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new RuntimeException("Renter not found"));

        if (renter.getRole() != com.luxeway.enums.UserRole.ADMIN) {
            if (!Boolean.TRUE.equals(renter.getKycVerified()) || !Boolean.TRUE.equals(renter.getDrivingLicenseVerified())) {
                throw new RuntimeException("KYC identity and driving license verification are required before booking.");
            }
        }

        long totalDays = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        BigDecimal basePrice = motorbike.getPricePerDay().multiply(BigDecimal.valueOf(totalDays));
        
        BigDecimal insuranceFee = req.isIncludeInsurance()
                ? motorbike.getPricePerDay().multiply(BigDecimal.valueOf(0.15)).multiply(BigDecimal.valueOf(totalDays))
                : BigDecimal.ZERO;
        
        BigDecimal helmetFee = req.isHasHelmet() ? BigDecimal.valueOf(20000).multiply(BigDecimal.valueOf(totalDays)) : BigDecimal.ZERO;
        BigDecimal raincoatFee = req.isHasRaincoat() ? BigDecimal.valueOf(10000).multiply(BigDecimal.valueOf(totalDays)) : BigDecimal.ZERO;
        BigDecimal phoneHolderFee = req.isHasPhoneHolder() ? BigDecimal.valueOf(10000).multiply(BigDecimal.valueOf(totalDays)) : BigDecimal.ZERO;
        BigDecimal touringFee = req.isHasTouringPackage() ? BigDecimal.valueOf(100000).multiply(BigDecimal.valueOf(totalDays)) : BigDecimal.ZERO;

        BigDecimal serviceFee = basePrice.multiply(BigDecimal.valueOf(0.12)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal taxes = basePrice.multiply(BigDecimal.valueOf(0.08)).setScale(0, RoundingMode.HALF_UP);
        
        // Sum specialized motorbike fees into addonsTotal
        BigDecimal addonsTotal = helmetFee.add(raincoatFee).add(phoneHolderFee).add(touringFee);
        BigDecimal total = basePrice.add(insuranceFee).add(serviceFee).add(taxes).add(addonsTotal);

        Booking booking = Booking.builder()
                .vehicle(motorbike)
                .renter(renter)
                .owner(motorbike.getOwner())
                .status(BookingStatus.CONFIRMED)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .totalDays((int) totalDays)
                .basePrice(basePrice)
                .pricePerDay(motorbike.getPricePerDay())
                .serviceFee(serviceFee)
                .taxes(taxes)
                .addonsTotal(addonsTotal)
                .insuranceFee(insuranceFee)
                .total(total)
                .deposit(motorbike.getDeposit())
                .includeInsurance(req.isIncludeInsurance())
                .notes(req.getNotes())
                .couponCode(req.getCouponCode())
                .build();

        booking = bookingRepository.save(booking);

        // Block calendar using unified VehicleAvailability table
        blockAvailability(booking);

        // Notify owner
        notificationService.createNotification(
                booking.getOwner().getId(),
                "booking",
                "notification.booking.new.title",
                "New motorbike booking by " + renter.getDisplayName() + " for " + motorbike.getName(),
                "/owner/bookings/" + booking.getId()
        );

        return toResponse(booking);
    }

    private void blockAvailability(Booking booking) {
        LocalDate start = booking.getStartDate();
        LocalDate end = booking.getEndDate();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            VehicleAvailability availability = VehicleAvailability.builder()
                    .vehicle(booking.getVehicle())
                    .date(date)
                    .isAvailable(false)
                    .bookingId(booking.getId())
                    .build();
            vehicleAvailabilityRepository.save(availability);
        }
    }

    public List<MotorbikeBookingDTOs.MotorbikeBookingResponse> getBookingsByRenter(String renterId) {
        return bookingRepository.findByRenterId(renterId).stream()
                .filter(b -> b.getVehicle().getVehicleType() == com.luxeway.enums.VehicleType.MOTORBIKE)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<MotorbikeBookingDTOs.MotorbikeBookingResponse> getBookingsByOwner(String ownerId) {
        return bookingRepository.findByOwnerId(ownerId).stream()
                .filter(b -> b.getVehicle().getVehicleType() == com.luxeway.enums.VehicleType.MOTORBIKE)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MotorbikeBookingDTOs.MotorbikeBookingResponse getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motorbike booking not found with ID: " + id));
        return toResponse(booking);
    }

    @Transactional
    public MotorbikeBookingDTOs.MotorbikeBookingResponse updateStatus(String bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Motorbike booking not found"));
        booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        return toResponse(bookingRepository.save(booking));
    }

    public MotorbikeBookingDTOs.MotorbikeBookingResponse toResponse(Booking b) {
        MotorbikeBookingDTOs.MotorbikeBookingResponse r = new MotorbikeBookingDTOs.MotorbikeBookingResponse();
        r.setId(b.getId());
        r.setStatus(b.getStatus().name().toLowerCase());
        r.setStartDate(b.getStartDate());
        r.setEndDate(b.getEndDate());
        r.setTotalDays(b.getTotalDays());
        
        r.setBasePrice(b.getBasePrice());
        r.setPricePerDay(b.getPricePerDay());
        r.setServiceFee(b.getServiceFee());
        r.setTaxes(b.getTaxes());
        r.setTotal(b.getTotal());
        r.setDeposit(b.getDeposit());

        r.setIncludeInsurance(b.getIncludeInsurance());
        r.setHasHelmet(false); // Legacy fallback, handled via addonsTotal now
        r.setHasRaincoat(false);
        r.setHasPhoneHolder(false);
        r.setHasTouringPackage(false);
        
        r.setNotes(b.getNotes());
        r.setOwnerNotes(b.getOwnerNotes());
        r.setCouponCode(b.getCouponCode());
        r.setCreatedAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);

        if (b.getVehicle() != null) {
            MotorbikeBookingDTOs.MotorbikeBookingResponse.MotorbikeInfo mi = new MotorbikeBookingDTOs.MotorbikeBookingResponse.MotorbikeInfo();
            mi.setId(b.getVehicle().getId());
            mi.setName(b.getVehicle().getName());
            mi.setBrandName(b.getVehicle().getBrand());
            mi.setModelName(b.getVehicle().getModel());
            mi.setCategory(b.getVehicle().getCategory() != null ? b.getVehicle().getCategory().name() : null);
            mi.setLicensePlate(b.getVehicle().getLicensePlate());
            mi.setThumbnailUrl(b.getVehicle().getThumbnailUrl());
            r.setMotorbike(mi);
        }

        if (b.getRenter() != null) {
            MotorbikeBookingDTOs.MotorbikeBookingResponse.UserInfo ui = new MotorbikeBookingDTOs.MotorbikeBookingResponse.UserInfo();
            ui.setId(b.getRenter().getId());
            ui.setDisplayName(b.getRenter().getDisplayName());
            ui.setAvatar(b.getRenter().getAvatar());
            ui.setPhone(b.getRenter().getPhone());
            r.setRenter(ui);
        }

        if (b.getOwner() != null) {
            MotorbikeBookingDTOs.MotorbikeBookingResponse.UserInfo oi = new MotorbikeBookingDTOs.MotorbikeBookingResponse.UserInfo();
            oi.setId(b.getOwner().getId());
            oi.setDisplayName(b.getOwner().getDisplayName());
            oi.setAvatar(b.getOwner().getAvatar());
            oi.setPhone(b.getOwner().getPhone());
            r.setOwner(oi);
        }

        return r;
    }
}
