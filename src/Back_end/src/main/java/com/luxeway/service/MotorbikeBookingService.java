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

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class MotorbikeBookingService {

    private final MotorbikeBookingRepository motorbikeBookingRepository;
    private final MotorbikeRepository motorbikeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MotorbikeAvailabilityRepository motorbikeAvailabilityRepository;

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

        Motorbike motorbike = motorbikeRepository.findByIdForUpdate(req.getMotorbikeId())
                .orElseThrow(() -> new RuntimeException("Motorbike not found: " + req.getMotorbikeId()));

        if (motorbike.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("Motorbike is not available for booking (status: " + motorbike.getStatus() + ")");
        }

        if (motorbikeBookingRepository.hasConflictingBooking(req.getMotorbikeId(), req.getStartDate(), req.getEndDate())) {
            throw new RuntimeException("Motorbike is already booked for these dates.");
        }

        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new RuntimeException("Renter not found"));

        if (renter.getRole() != com.luxeway.enums.UserRole.ADMIN) {
            if (!"VERIFIED".equals(renter.getKycStatus())) {
                throw new RuntimeException("Please complete KYC verification first.");
            }

            boolean licenseVerified = Boolean.TRUE.equals(renter.getDrivingLicenseVerified())
                    || "VERIFIED".equalsIgnoreCase(renter.getDriverLicenseStatus());
            if (!licenseVerified) {
                throw new RuntimeException("Please complete driving license verification first.");
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
        BigDecimal total = basePrice.add(insuranceFee).add(helmetFee).add(raincoatFee).add(phoneHolderFee).add(touringFee).add(serviceFee).add(taxes);

        MotorbikeBooking booking = MotorbikeBooking.builder()
                .motorbike(motorbike)
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
                .total(total)
                .deposit(motorbike.getDeposit())
                .includeInsurance(req.isIncludeInsurance())
                .hasHelmet(req.isHasHelmet())
                .hasRaincoat(req.isHasRaincoat())
                .hasPhoneHolder(req.isHasPhoneHolder())
                .hasTouringPackage(req.isHasTouringPackage())
                .notes(req.getNotes())
                .couponCode(req.getCouponCode())
                .build();

        booking = motorbikeBookingRepository.save(booking);

        // Block calendar
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

    private void blockAvailability(MotorbikeBooking booking) {
        LocalDate start = booking.getStartDate();
        LocalDate end = booking.getEndDate();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            MotorbikeAvailability availability = MotorbikeAvailability.builder()
                    .motorbike(booking.getMotorbike())
                    .date(date)
                    .isAvailable(false)
                    .build();
            motorbikeAvailabilityRepository.save(availability);
        }
    }

    @Transactional(readOnly = true)
    public List<MotorbikeBookingDTOs.MotorbikeBookingResponse> getBookingsByRenter(String renterId) {
        return motorbikeBookingRepository.findByRenterId(renterId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MotorbikeBookingDTOs.MotorbikeBookingResponse> getBookingsByOwner(String ownerId) {
        return motorbikeBookingRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MotorbikeBookingDTOs.MotorbikeBookingResponse getBookingById(String id) {
        MotorbikeBooking booking = motorbikeBookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Motorbike booking not found with ID: " + id));
        return toResponse(booking);
    }

    @Transactional
    public MotorbikeBookingDTOs.MotorbikeBookingResponse updateStatus(String bookingId, String status) {
        MotorbikeBooking booking = motorbikeBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Motorbike booking not found"));
        booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        return toResponse(motorbikeBookingRepository.save(booking));
    }

    public MotorbikeBookingDTOs.MotorbikeBookingResponse toResponse(MotorbikeBooking b) {
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

        r.setIncludeInsurance(b.isIncludeInsurance());
        r.setHasHelmet(b.isHasHelmet());
        r.setHasRaincoat(b.isHasRaincoat());
        r.setHasPhoneHolder(b.isHasPhoneHolder());
        r.setHasTouringPackage(b.isHasTouringPackage());
        
        r.setNotes(b.getNotes());
        r.setOwnerNotes(b.getOwnerNotes());
        r.setCouponCode(b.getCouponCode());
        r.setCreatedAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);

        if (b.getMotorbike() != null) {
            MotorbikeBookingDTOs.MotorbikeBookingResponse.MotorbikeInfo mi = new MotorbikeBookingDTOs.MotorbikeBookingResponse.MotorbikeInfo();
            mi.setId(b.getMotorbike().getId());
            mi.setName(b.getMotorbike().getName());
            if (b.getMotorbike().getModel() != null) {
                mi.setModelName(b.getMotorbike().getModel().getName());
                mi.setCategory(b.getMotorbike().getModel().getCategory());
                if (b.getMotorbike().getModel().getBrand() != null) {
                    mi.setBrandName(b.getMotorbike().getModel().getBrand().getName());
                }
            }
            mi.setLicensePlate(b.getMotorbike().getLicensePlate());
            if (b.getMotorbike().getImages() != null && !b.getMotorbike().getImages().isEmpty()) {
                mi.setThumbnailUrl(b.getMotorbike().getImages().iterator().next().getUrl());
            }
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
