package com.luxeway.service;

import com.luxeway.dto.booking.BookingDTOs;
import com.luxeway.entity.*;
import com.luxeway.enums.BookingStatus;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.UserRepository;
import com.luxeway.repository.VehicleRepository;
import com.luxeway.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final BookingDeliveryRepository bookingDeliveryRepository;
    private final BookingCancellationRepository bookingCancellationRepository;
    private final BookingStatusHistoryRepository bookingStatusHistoryRepository;
    private final VehicleAvailabilityRepository vehicleAvailabilityRepository;
    private final PricingEngine pricingEngine;

    @Value("${business.pricing.service-fee-rate:0.12}")
    private double serviceFeeRate;

    @Value("${business.pricing.tax-rate:0.08}")
    private double taxRate;

    // ====== Create Booking ======

    @Transactional
    public BookingDTOs.BookingResponse createBooking(String renterId, BookingDTOs.CreateBookingRequest req) {

        // Validate dates (BR-1: endDate must be >= startDate; BR-2: min 1 day = same-day allowed)
        if (req.getStartDate() == null || req.getEndDate() == null) {
            throw new RuntimeException("Start date and end date are required");
        }
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new RuntimeException("End date must be on or after start date");
        }
        if (req.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }

        // Acquire PESSIMISTIC WRITE lock on the vehicle row to prevent race condition:
        // If two users try to book the same vehicle simultaneously, only one can hold the lock.
        Vehicle vehicle = vehicleRepository.findByIdForUpdate(req.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + req.getVehicleId()));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("Vehicle is not available for booking (status: " + vehicle.getStatus() + ")");
        }

        // Check for overlapping bookings (PENDING, CONFIRMED, ACTIVE overlap with requested dates)
        if (bookingRepository.hasConflictingBooking(req.getVehicleId(), req.getStartDate(), req.getEndDate())) {
            throw new RuntimeException(
                "Vehicle is already booked for dates " + req.getStartDate() + " to " + req.getEndDate() +
                ". Please choose different dates."
            );
        }

        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new RuntimeException("Renter not found"));

        // BUG-02 FIX: All non-admin renters (CUSTOMER and OWNER renting another owner's vehicle)
        // must have KYC and driving license verified before creating a booking.
        if (renter.getRole() != com.luxeway.enums.UserRole.ADMIN) {
            if (!Boolean.TRUE.equals(renter.getKycVerified()) || !Boolean.TRUE.equals(renter.getDrivingLicenseVerified())) {
                throw new RuntimeException("KYC identity and driving license verification are required before booking. Please complete verification in your profile.");
            }
        }

        // Calculate pricing using Pricing Engine
        long totalDays = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        BigDecimal basePrice = pricingEngine.calculateBasePriceForPeriod(vehicle, req.getStartDate(), req.getEndDate());
        BigDecimal insuranceFee = req.isIncludeInsurance()
                ? vehicle.getPricePerDay().multiply(BigDecimal.valueOf(0.15)).multiply(BigDecimal.valueOf(totalDays))
                : BigDecimal.ZERO;
        BigDecimal deliveryFee = req.isIncludeDelivery() ? vehicle.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal serviceFee = basePrice.multiply(BigDecimal.valueOf(serviceFeeRate)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal taxes = basePrice.multiply(BigDecimal.valueOf(taxRate)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal total = basePrice.add(insuranceFee).add(deliveryFee).add(serviceFee).add(taxes);

        Booking booking = Booking.builder()
                .vehicle(vehicle)
                .renter(renter)
                .owner(vehicle.getOwner())
                .status(vehicle.getInstantBook() ? BookingStatus.CONFIRMED : BookingStatus.PENDING)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .totalDays((int) totalDays)
                .basePrice(basePrice)
                .pricePerDay(vehicle.getPricePerDay())
                .addonsTotal(BigDecimal.ZERO)
                .insuranceFee(insuranceFee)
                .deliveryFee(deliveryFee)
                .serviceFee(serviceFee)
                .taxes(taxes)
                .discount(BigDecimal.ZERO)
                .total(total)
                .deposit(vehicle.getDeposit())
                .includeInsurance(req.isIncludeInsurance())
                .includeDelivery(req.isIncludeDelivery())
                .deliveryAddress(req.getDeliveryAddress())
                .pickupLocation(req.getPickupLocation())
                .notes(req.getNotes())
                .couponCode(req.getCouponCode())
                .build();

        booking = bookingRepository.save(booking);

        // Audit Logging: Status History
        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .status(booking.getStatus().name())
                .comment("Booking created successfully")
                .changedBy(renterId)
                .build();
        bookingStatusHistoryRepository.save(history);

        // Save Delivery Details if included
        if (booking.getIncludeDelivery()) {
            BookingDelivery delivery = BookingDelivery.builder()
                    .booking(booking)
                    .address(booking.getDeliveryAddress() != null ? booking.getDeliveryAddress() : "Default Address")
                    .latitude(vehicle.getLatitude() != null ? vehicle.getLatitude() : BigDecimal.ZERO)
                    .longitude(vehicle.getLongitude() != null ? vehicle.getLongitude() : BigDecimal.ZERO)
                    .status("PENDING")
                    .build();
            bookingDeliveryRepository.save(delivery);
        }

        // Block Calendar if instantly confirmed
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            blockAvailabilityCalendar(booking);
        }

        // Notify owner
        notificationService.createNotification(
            booking.getOwner().getId(),
            "booking",
            "notification.booking.new.title",
            "notification.booking.new.body|renter=" + renter.getDisplayName() + "|vehicle=" + vehicle.getName(),
            "/owner/bookings/" + booking.getId()
        );

        log.info("Booking created: {} for vehicle {} by renter {}", booking.getId(), vehicle.getId(), renterId);
        
        // Dispatch email confirmation if confirmed instantly
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            try {
                emailService.sendBookingConfirmation(booking.getRenter().getEmail(), booking);
            } catch (Exception e) {
                log.error("Failed to dispatch email confirmation: {}", e.getMessage());
            }
        }

        return toResponse(booking);
    }

    // ====== Get bookings for renter ======

    public Page<BookingDTOs.BookingResponse> getMyBookings(String renterId, int page, int size) {
        // Do NOT add Sort here - 'OrderByCreatedAtDesc' in method name already handles ordering
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.findByRenterIdOrderByCreatedAtDesc(renterId, pageable).map(this::toResponse);
    }

    // ====== Get bookings for owner ======

    public Page<BookingDTOs.BookingResponse> getOwnerBookings(String ownerId, int page, int size) {
        // Do NOT add Sort here - 'OrderByCreatedAtDesc' in method name already handles ordering
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId, pageable).map(this::toResponse);
    }

    // ====== Get booking by ID ======

    public BookingDTOs.BookingResponse getById(String bookingId, String requesterId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!isAdmin && !booking.getRenter().getId().equals(requesterId)
                && !booking.getOwner().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view this booking");
        }

        return toResponse(booking);
    }

    // ====== Cancel booking ======

    @Transactional
    public BookingDTOs.BookingResponse cancelBooking(String bookingId, String requesterId,
                                                     BookingDTOs.CancelBookingRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRenter().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to cancel this booking");
        }

        if (!booking.canBeCancelled()) {
            throw new RuntimeException("Booking cannot be cancelled in its current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(java.time.LocalDateTime.now());
        booking.setCancellationReason(req.getReason());
        

        booking = bookingRepository.save(booking);

        // Save Cancellation Ledger Details
        BookingCancellation cancellation = BookingCancellation.builder()
                .booking(booking)
                .cancelledBy(requesterId)
                .reason(req.getReason())
                .refundAmount(booking.getTotal())
                .penaltyAmount(BigDecimal.ZERO)
                .build();
        bookingCancellationRepository.save(cancellation);

        // Status History Logging
        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .status(BookingStatus.CANCELLED.name())
                .comment("Booking cancelled: " + req.getReason())
                .changedBy(requesterId)
                .build();
        bookingStatusHistoryRepository.save(history);

        // Free Calendar Days
        freeAvailabilityCalendar(booking);
        
        // Notify the other party
        String notifyUserId = booking.getRenter().getId().equals(requesterId) ? 
                booking.getOwner().getId() : booking.getRenter().getId();
                
        notificationService.createNotification(
            notifyUserId,
            "booking",
            "notification.booking.cancelled.title",
            "notification.booking.cancelled.body|vehicle=" + booking.getVehicle().getName(),
            "/bookings/" + booking.getId()
        );

        try {
            emailService.sendBookingCancellation(booking.getRenter().getEmail(), booking);
            emailService.sendBookingCancellation(booking.getOwner().getEmail(), booking);
        } catch (Exception e) {
            log.warn("Failed to send booking cancellation email alerts: {}", e.getMessage());
        }

        log.info("Booking cancelled: {} by {}", bookingId, requesterId);
        return toResponse(booking);
    }

    // ====== Owner: confirm / mark active / complete ======

    @Transactional
    public BookingDTOs.BookingResponse updateStatus(String bookingId, String ownerId,
                                                    BookingDTOs.UpdateBookingStatusRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Only the vehicle owner can update booking status");
        }

        BookingStatus newStatus;
        try {
            newStatus = BookingStatus.valueOf(req.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid booking status: " + req.getStatus());
        }

        booking.setStatus(newStatus);
        if (req.getOwnerNotes() != null) {
            booking.setOwnerNotes(req.getOwnerNotes());
        }

        booking = bookingRepository.save(booking);

        // Status History Audit Logging
        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .status(newStatus.name())
                .comment("Status transitioned to " + newStatus.name())
                .changedBy(ownerId)
                .build();
        bookingStatusHistoryRepository.save(history);

        // Dynamic Availability Calendar operations
        if (newStatus == BookingStatus.CONFIRMED || newStatus == BookingStatus.ACTIVE) {
            blockAvailabilityCalendar(booking);
        } else if (newStatus == BookingStatus.CANCELLED) {
            freeAvailabilityCalendar(booking);
        }
        
        // Notify renter
        notificationService.createNotification(
            booking.getRenter().getId(),
            "booking",
            "notification.booking.status.title",
            "notification.booking.status.body|vehicle=" + booking.getVehicle().getName() + "|status=" + newStatus.name().toLowerCase(),
            "/bookings/" + booking.getId()
        );

        log.info("Booking {} status updated to {} by owner {}", bookingId, newStatus, ownerId);

        // Dispatch email confirmation if approved by owner
        if (newStatus == BookingStatus.CONFIRMED) {
            try {
                emailService.sendBookingConfirmation(booking.getRenter().getEmail(), booking);
            } catch (Exception e) {
                log.error("Failed to dispatch email confirmation: {}", e.getMessage());
            }
        }

        return toResponse(booking);
    }

    // ====== Availability Calendar Helpers ======

    private void blockAvailabilityCalendar(Booking booking) {
        // BUG-06 FIX: Check if record already exists for this date before inserting.
        // This prevents duplicate records on retry or re-confirmation calls.
        LocalDate start = booking.getStartDate();
        LocalDate end = booking.getEndDate();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            final LocalDate currentDate = date;
            boolean alreadyBlocked = vehicleAvailabilityRepository
                    .findByVehicleIdAndDateBetween(booking.getVehicle().getId(), currentDate, currentDate)
                    .stream()
                    .anyMatch(slot -> booking.getId().equals(slot.getBookingId()));
            if (!alreadyBlocked) {
                VehicleAvailability availability = VehicleAvailability.builder()
                        .vehicle(booking.getVehicle())
                        .date(currentDate)
                        .isAvailable(false)
                        .bookingId(booking.getId())
                        .build();
                vehicleAvailabilityRepository.save(availability);
            }
        }
    }

    /**
     * Public entry point called by PaymentService after payment is confirmed.
     * BUG-07 FIX: Ensures availability calendar is blocked when payment flow (not owner approval) confirms a booking.
     */
    @Transactional
    public void blockAvailabilityCalendarPublic(Booking booking) {
        blockAvailabilityCalendar(booking);
    }

    private void freeAvailabilityCalendar(Booking booking) {
        List<VehicleAvailability> slots = vehicleAvailabilityRepository.findByVehicleIdAndDateBetween(
                booking.getVehicle().getId(), booking.getStartDate(), booking.getEndDate()
        );
        for (VehicleAvailability slot : slots) {
            if (booking.getId().equals(slot.getBookingId())) {
                slot.setIsAvailable(true);
                slot.setBookingId(null);
                vehicleAvailabilityRepository.save(slot);
            }
        }
    }

    // ====== DTO Mapping ======

    public BookingDTOs.BookingResponse toResponse(Booking b) {
        BookingDTOs.BookingResponse r = new BookingDTOs.BookingResponse();
        r.setId(b.getId());
        r.setStatus(b.getStatus().name().toLowerCase());
        r.setStartDate(b.getStartDate());
        r.setEndDate(b.getEndDate());
        r.setTotalDays(b.getTotalDays());
        r.setIncludeInsurance(b.getIncludeInsurance());
        r.setIncludeDelivery(b.getIncludeDelivery());
        r.setDeliveryAddress(b.getDeliveryAddress());
        r.setPickupLocation(b.getPickupLocation());
        r.setNotes(b.getNotes());
        r.setOwnerNotes(b.getOwnerNotes());
        r.setCouponCode(b.getCouponCode());
        r.setCreatedAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
        r.setUpdatedAt(b.getUpdatedAt() != null ? b.getUpdatedAt().toString() : null);
        r.setCancelledAt(b.getCancelledAt() != null ? b.getCancelledAt().toString() : null);
        r.setCancellationReason(b.getCancellationReason());

        // Pricing
        BookingDTOs.BookingResponse.PricingInfo pricing = new BookingDTOs.BookingResponse.PricingInfo();
        pricing.setBasePrice(b.getBasePrice());
        pricing.setPricePerDay(b.getPricePerDay());
        pricing.setAddonsTotal(b.getAddonsTotal());
        pricing.setInsuranceFee(b.getInsuranceFee());
        pricing.setDeliveryFee(b.getDeliveryFee());
        pricing.setServiceFee(b.getServiceFee());
        pricing.setTaxes(b.getTaxes());
        pricing.setDiscount(b.getDiscount());
        pricing.setTotal(b.getTotal());
        pricing.setDeposit(b.getDeposit());
        pricing.setDepositRefunded(b.getDepositRefunded());
        r.setPricing(pricing);

        // Vehicle
        if (b.getVehicle() != null) {
            Vehicle v = b.getVehicle();
            BookingDTOs.BookingResponse.VehicleInfo vi = new BookingDTOs.BookingResponse.VehicleInfo();
            vi.setId(v.getId());
            vi.setName(v.getName());
            vi.setBrand(v.getBrand());
            vi.setThumbnailUrl(v.getThumbnailUrl());
            vi.setCity(v.getCity());
            vi.setCategory(v.getCategory().name().toLowerCase());
            r.setVehicle(vi);
        }

        // Renter
        if (b.getRenter() != null) {
            User u = b.getRenter();
            BookingDTOs.BookingResponse.UserInfo ui = new BookingDTOs.BookingResponse.UserInfo();
            ui.setId(u.getId());
            ui.setDisplayName(u.getDisplayName());
            ui.setAvatar(u.getAvatar());
            ui.setPhone(u.getPhone());
            ui.setRating(u.getRating() != null ? u.getRating().doubleValue() : 0.0);
            r.setRenter(ui);
        }

        // Owner
        if (b.getOwner() != null) {
            User o = b.getOwner();
            BookingDTOs.BookingResponse.UserInfo oi = new BookingDTOs.BookingResponse.UserInfo();
            oi.setId(o.getId());
            oi.setDisplayName(o.getDisplayName());
            oi.setAvatar(o.getAvatar());
            oi.setPhone(o.getPhone());
            oi.setRating(o.getRating() != null ? o.getRating().doubleValue() : 0.0);
            r.setOwner(oi);
        }

        return r;
    }
}
