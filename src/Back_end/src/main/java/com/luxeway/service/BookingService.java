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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.messaging.simp.SimpMessagingTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final BookingCounterRepository bookingCounterRepository;
    private final PaymentSettingRepository paymentSettingRepository;
    private final PaymentRepository paymentRepository;
    private final AuditService auditService;
    private final InvoiceService invoiceService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final BookingDeliveryRepository bookingDeliveryRepository;
    private final BookingCancellationRepository bookingCancellationRepository;
    private final BookingStatusHistoryRepository bookingStatusHistoryRepository;
    private final VehicleAvailabilityRepository vehicleAvailabilityRepository;
    private final DigitalContractRepository digitalContractRepository;
    private final PricingEngine pricingEngine;
    private final SimpMessagingTemplate messagingTemplate;
    private final ReviewRepository reviewRepository;

    @Value("${business.pricing.service-fee-rate:0.12}")
    private double serviceFeeRate;

    private boolean isBookingOwner(Booking booking, String userId) {
        String bookingOwnerId = booking.getOwner() != null ? booking.getOwner().getId() : null;
        String vehicleOwnerId = booking.getVehicle() != null && booking.getVehicle().getOwner() != null
                ? booking.getVehicle().getOwner().getId()
                : null;
        return userId != null && (userId.equals(bookingOwnerId) || userId.equals(vehicleOwnerId));
    }

    @Value("${business.pricing.tax-rate:0.08}")
    private double taxRate;

    // ====== Shared Booking Validation ======

    public void validateBookingEligibility(User renter, Vehicle vehicle, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new RuntimeException("Start date and end date are required");
        }
        if (!startDate.isBefore(endDate)) {
            throw new RuntimeException("Start date must be before end date");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }

        // Validate minimum and maximum rental days
        long rentalDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        if (rentalDays < 1) {
            rentalDays = 1;
        }
        if (vehicle.getMinRentalDays() != null && rentalDays < vehicle.getMinRentalDays()) {
            throw new RuntimeException("Thời gian thuê tối thiểu cho xe này là " + vehicle.getMinRentalDays() + " ngày.");
        }
        if (vehicle.getMaxRentalDays() != null && rentalDays > vehicle.getMaxRentalDays()) {
            throw new RuntimeException("Thời gian thuê tối đa cho xe này là " + vehicle.getMaxRentalDays() + " ngày.");
        }

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("This vehicle is currently unavailable");
        }

        // Check for overlapping bookings (PENDING, CONFIRMED, ACTIVE overlap with requested dates)
        if (bookingRepository.hasConflictingBooking(vehicle.getId(), startDate, endDate)) {
            throw new RuntimeException(
                "Vehicle is already booked for dates " + startDate + " to " + endDate +
                ". Please choose different dates."
            );
        }

        // Check for temporary locks preventing double booking
        List<VehicleAvailability> conflictingLocks = vehicleAvailabilityRepository.findConflictingLocks(
            vehicle.getId(), startDate, endDate, java.time.LocalDateTime.now(), renter.getId()
        );
        if (!conflictingLocks.isEmpty()) {
            throw new RuntimeException("Vehicle is temporarily locked or unavailable for these dates. Please choose different dates.");
        }

        // Enforce verified identity and driving license. License class OCR can be
        // incomplete in demo data, so approved accounts are not blocked by class.
        if (renter.getRole() != com.luxeway.enums.UserRole.ADMIN) {
            if (!"VERIFIED".equals(renter.getKycStatus())) {
                throw new RuntimeException("Please complete identity verification first");
            }

            boolean licenseVerified = Boolean.TRUE.equals(renter.getDrivingLicenseVerified())
                    || "VERIFIED".equalsIgnoreCase(renter.getDriverLicenseStatus());
            if (!licenseVerified) {
                throw new RuntimeException("Please complete driving license verification first");
            }
        }
    }

    @Transactional(readOnly = true)
    public void validatePreBook(String renterId, BookingDTOs.CreateBookingRequest req) {
        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new RuntimeException("Renter not found"));
        Vehicle vehicle = vehicleRepository.findById(req.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + req.getVehicleId()));
        validateBookingEligibility(renter, vehicle, req.getStartDate(), req.getEndDate());
    }

    // ====== Create Booking ======

    @Transactional
    public BookingDTOs.BookingResponse createBooking(String renterId, BookingDTOs.CreateBookingRequest req) {

        // Acquire PESSIMISTIC WRITE lock on the vehicle row to prevent race condition:
        Vehicle vehicle = vehicleRepository.findByIdForUpdate(req.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + req.getVehicleId()));

        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new RuntimeException("Renter not found"));

        validateBookingEligibility(renter, vehicle, req.getStartDate(), req.getEndDate());

        // Calculate pricing using Pricing Engine
        long totalDays = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        BigDecimal basePrice = pricingEngine.calculateBasePriceForPeriod(vehicle, req.getStartDate(), req.getEndDate());
        BigDecimal insuranceFee = req.isIncludeInsurance()
                ? vehicle.getPricePerDay().multiply(BigDecimal.valueOf(0.15)).multiply(BigDecimal.valueOf(totalDays))
                : BigDecimal.ZERO;
        BigDecimal deliveryFee = req.isIncludeDelivery() ? vehicle.getDeliveryFee() : BigDecimal.ZERO;
        BigDecimal serviceFee = basePrice.multiply(BigDecimal.valueOf(serviceFeeRate)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal taxes = basePrice.multiply(BigDecimal.valueOf(taxRate)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal cleaningFee = BigDecimal.ZERO; // Default cleaning fee snapshot
        BigDecimal total = basePrice.add(insuranceFee).add(deliveryFee).add(serviceFee).add(taxes).add(cleaningFee);

        // Concurrency-safe sequential booking code generation
        BookingCounter counter = bookingCounterRepository.findByNameForUpdate("bookings")
                .orElseThrow(() -> new RuntimeException("Booking counter sequence not initialized"));
        long nextValue = counter.getValue() + 1;
        counter.setValue(nextValue);
        bookingCounterRepository.saveAndFlush(counter);

        int yy = java.time.LocalDate.now().getYear() % 100;
        String bookingCode = String.format("LXW-%02d-%06d", yy, nextValue);

        Booking booking = Booking.builder()
                .vehicle(vehicle)
                .renter(renter)
                .owner(vehicle.getOwner())
                .status(BookingStatus.WAITING_PAYMENT)
                .bookingCode(bookingCode)
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
                .cleaningFee(cleaningFee)
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
                .comment("Booking created successfully with code: " + bookingCode)
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

        // Block Calendar immediately to prevent other users from booking during WAITING_PAYMENT
        blockAvailabilityCalendar(booking);

        // Notify Customer
        try {
            notificationService.createNotification(
                renterId,
                "booking",
                "Booking created successfully",
                "Your booking request for " + vehicle.getName() + " has been submitted successfully.",
                "/dashboard/bookings"
            );
        } catch (Exception e) {
            log.error("Failed to notify customer: {}", e.getMessage());
        }

        // Notify Owner
        try {
            notificationService.createNotification(
                booking.getOwner().getId(),
                "booking",
                "You received a new booking request",
                renter.getDisplayName() + " has requested to book " + vehicle.getName() + ".",
                "/owner/bookings"
            );
        } catch (Exception e) {
            log.error("Failed to notify owner: {}", e.getMessage());
        }

        // Notify Admin
        try {
            List<User> admins = userRepository.findByRole(com.luxeway.enums.UserRole.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(
                    admin.getId(),
                    "booking",
                    "New booking created",
                    "Renter " + renter.getDisplayName() + " booked " + vehicle.getName() + " owned by " + vehicle.getOwner().getDisplayName() + ".",
                    "/admin/bookings"
                );
            }
        } catch (Exception e) {
            log.error("Failed to notify admins: {}", e.getMessage());
        }

        log.info("Booking created: {} for vehicle {} by renter {}", booking.getId(), vehicle.getId(), renterId);
        
        // Dispatch email confirmation if confirmed instantly
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            try {
                emailService.sendBookingConfirmation(booking.getRenter().getEmail(), booking);
            } catch (Exception e) {
                log.error("Failed to dispatch email confirmation: {}", e.getMessage());
            }
        }

        BookingDTOs.BookingResponse response = toResponse(booking);
        broadcastLifecycleEvent(booking, "BOOKING_CREATED");
        return response;
    }

    // ====== Get bookings for renter ======

    @Transactional(readOnly = true)
    public Page<BookingDTOs.BookingResponse> getMyBookings(String renterId, int page, int size) {
        // Do NOT add Sort here - 'OrderByCreatedAtDesc' in method name already handles ordering
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.findByRenterIdOrderByCreatedAtDesc(renterId, pageable).map(this::toResponse);
    }

    // ====== Get bookings for owner ======

    @Transactional(readOnly = true)
    public Page<BookingDTOs.BookingResponse> getOwnerBookings(String ownerId, int page, int size) {
        // Do NOT add Sort here - 'OrderByCreatedAtDesc' in method name already handles ordering
        Pageable pageable = PageRequest.of(page, size);
        return bookingRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId, pageable).map(this::toResponse);
    }

    // ====== Get booking by ID ======

    @Transactional(readOnly = true)
    public BookingDTOs.BookingResponse getById(String bookingId, String requesterId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        String renterId = booking.getRenter() != null ? booking.getRenter().getId() : "";
        String ownerId = booking.getOwner() != null ? booking.getOwner().getId() : "";

        if (!isAdmin && !renterId.equals(requesterId)
                && !ownerId.equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view this booking");
        }

        return toResponse(booking);
    }

    // ====== Cancellation workflow ======

    @Transactional
    public BookingDTOs.BookingResponse requestCancellation(String bookingId, String requesterId,
                                                           BookingDTOs.CancelBookingRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRenter().getId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Only the renter can request cancellation");
        }

        if (booking.getStatus() == BookingStatus.CANCELLATION_REQUESTED) {
            return toResponse(booking);
        }

        if (!booking.canRequestCancellation()) {
            throw new RuntimeException("Cancellation cannot be requested in current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLATION_REQUESTED);
        booking.setCancellationReason(req.getReason());
        booking = bookingRepository.save(booking);

        bookingStatusHistoryRepository.save(BookingStatusHistory.builder()
                .booking(booking)
                .status(BookingStatus.CANCELLATION_REQUESTED.name())
                .comment("Cancellation requested by renter: " + req.getReason())
                .changedBy(requesterId)
                .build());

        notificationService.createNotification(
            booking.getOwner().getId(),
            "booking",
            "notification.booking.cancel_requested.title",
            "notification.booking.cancel_requested.body|vehicle=" + booking.getVehicle().getName(),
            "/owner/bookings"
        );

        log.info("Cancellation requested for booking {} by renter {}", bookingId, requesterId);
        return toResponse(booking);
    }

    @Transactional
    public BookingDTOs.BookingResponse approveCancellation(String bookingId, String ownerId,
                                                           BookingDTOs.CancelBookingRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!isBookingOwner(booking, ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Only the owner can approve cancellation");
        }

        if (booking.getStatus() != BookingStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Booking is not waiting for cancellation approval");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(java.time.LocalDateTime.now());
        if (req.getReason() != null && !req.getReason().isBlank()) {
            booking.setOwnerNotes(req.getReason());
        }
        booking = bookingRepository.save(booking);

        if (!bookingCancellationRepository.existsById(booking.getId())) {
            BookingCancellation cancellation = BookingCancellation.builder()
                    .booking(booking)
                    .cancelledBy(ownerId)
                    .reason(booking.getCancellationReason() != null ? booking.getCancellationReason() : "Cancellation approved by owner")
                    .refundAmount(booking.getTotal())
                    .penaltyAmount(BigDecimal.ZERO)
                    .build();
            bookingCancellationRepository.save(cancellation);
        }

        bookingStatusHistoryRepository.save(BookingStatusHistory.builder()
                .booking(booking)
                .status(BookingStatus.CANCELLED.name())
                .comment("Cancellation approved by owner: " + (req.getReason() != null ? req.getReason() : ""))
                .changedBy(ownerId)
                .build());

        freeAvailabilityCalendar(booking);

        notificationService.createNotification(
            booking.getRenter().getId(),
            "booking",
            "notification.booking.cancel_approved.title",
            "notification.booking.cancel_approved.body|vehicle=" + booking.getVehicle().getName(),
            "/dashboard/bookings/" + booking.getId()
        );

        try {
            emailService.sendBookingCancellation(booking.getRenter().getEmail(), booking);
            emailService.sendBookingCancellation(booking.getOwner().getEmail(), booking);
        } catch (Exception e) {
            log.warn("Failed to send booking cancellation email alerts: {}", e.getMessage());
        }

        log.info("Cancellation approved for booking {} by owner {}", bookingId, ownerId);
        return toResponse(booking);
    }

    @Transactional
    public BookingDTOs.BookingResponse rejectCancellation(String bookingId, String ownerId,
                                                          BookingDTOs.CancelBookingRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!isBookingOwner(booking, ownerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Only the owner can reject cancellation");
        }

        if (booking.getStatus() != BookingStatus.CANCELLATION_REQUESTED) {
            throw new RuntimeException("Booking is not waiting for cancellation approval");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setOwnerNotes(req.getReason());
        booking = bookingRepository.save(booking);

        bookingStatusHistoryRepository.save(BookingStatusHistory.builder()
                .booking(booking)
                .status(BookingStatus.CONFIRMED.name())
                .comment("Cancellation rejected by owner: " + req.getReason())
                .changedBy(ownerId)
                .build());

        notificationService.createNotification(
            booking.getRenter().getId(),
            "booking",
            "notification.booking.cancel_rejected.title",
            "notification.booking.cancel_rejected.body|vehicle=" + booking.getVehicle().getName(),
            "/dashboard/bookings/" + booking.getId()
        );

        log.info("Cancellation rejected for booking {} by owner {}", bookingId, ownerId);
        return toResponse(booking);
    }

    @Transactional
    public BookingDTOs.BookingResponse cancelBooking(String bookingId, String requesterId,
                                                     BookingDTOs.CancelBookingRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRenter().getId().equals(requesterId) && !isBookingOwner(booking, requesterId)) {
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

        if (!isBookingOwner(booking, ownerId)) {
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

        String eventName = null;
        if (newStatus == BookingStatus.PICKING_UP) {
            eventName = "VEHICLE_PICKING_UP";
        } else if (newStatus == BookingStatus.IN_PROGRESS || newStatus == BookingStatus.ACTIVE) {
            eventName = "TRIP_STARTED";
        } else if (newStatus == BookingStatus.COMPLETED) {
            eventName = "TRIP_COMPLETED";
        }
        if (eventName != null) {
            broadcastLifecycleEvent(booking, eventName);
        }

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
        LocalDate start = booking.getStartDate();
        LocalDate end = booking.getEndDate();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            final LocalDate currentDate = date;
            List<VehicleAvailability> existing = vehicleAvailabilityRepository
                    .findByVehicleIdAndDateBetween(booking.getVehicle().getId(), currentDate, currentDate);
            if (!existing.isEmpty()) {
                VehicleAvailability availability = existing.get(0);
                availability.setIsAvailable(false);
                availability.setBookingId(booking.getId());
                availability.setLockedUntil(null);
                availability.setLockedBy(null);
                vehicleAvailabilityRepository.save(availability);
            } else {
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
        broadcastLifecycleEvent(booking, "PAYMENT_COMPLETED");
    }

    public void broadcastLifecycleEvent(Booking booking, String eventName) {
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("bookingId", booking.getId());
            payload.put("event", eventName);
            payload.put("status", booking.getStatus().name());
            payload.put("booking", toResponse(booking));
            payload.put("timestamp", java.time.LocalDateTime.now().toString());

            String destination = "/topic/tracking/" + booking.getId();
            messagingTemplate.convertAndSend(destination, payload);
            log.info("Broadcasted lifecycle event {} to {}", eventName, destination);
        } catch (Exception e) {
            log.error("Failed to broadcast lifecycle event {}: {}", eventName, e.getMessage());
        }
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
        r.setReviewId(reviewRepository.findByBookingId(b.getId()).map(Review::getId).orElse(null));

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
            if (v.getCategory() != null) {
                vi.setCategory(v.getCategory().name().toLowerCase());
            }
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

        r.setBookingCode(b.getBookingCode());
        r.setVersion(b.getVersion());

        return r;
    }

    @Transactional
    public BookingDTOs.BookingResponse confirmTransfer(String bookingId, String renterId, String ip, String userAgent) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRenter().getId().equals(renterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to confirm this booking");
        }

        // Idempotency check:
        if (booking.getStatus() == BookingStatus.PAYMENT_PENDING) {
            log.info("Idempotent check hit: Booking {} is already in PAYMENT_PENDING", bookingId);
            return toResponse(booking);
        }

        if (booking.getStatus() != BookingStatus.WAITING_PAYMENT) {
            throw new RuntimeException("Booking must be in WAITING_PAYMENT status to confirm transfer. Current status: " + booking.getStatus());
        }

        DigitalContract contract = digitalContractRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Please sign the digital contract before confirming payment"));
        if (contract.getRenterSignedAt() == null) {
            throw new RuntimeException("Please sign the digital contract before confirming payment");
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.PAYMENT_PENDING);
        booking = bookingRepository.save(booking);

        // Timeline History Log
        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .status(BookingStatus.PAYMENT_PENDING.name())
                .comment("Customer clicked 'Tôi đã chuyển khoản' (I have transferred)")
                .changedBy(renterId)
                .build();
        bookingStatusHistoryRepository.save(history);

        // Complete Audit Log
        auditService.log(
            renterId,
            "PAYMENT_SUBMITTED",
            "Booking",
            bookingId,
            oldStatus.name(),
            BookingStatus.PAYMENT_PENDING.name(),
            ip,
            userAgent
        );

        // Notify Owner/Admin
        try {
            notificationService.createNotification(
                booking.getOwner().getId(),
                "booking",
                "Xác nhận thanh toán đang chờ duyệt",
                "Đơn đặt xe " + booking.getBookingCode() + " đã được xác nhận chuyển khoản. Vui lòng duyệt.",
                "/admin/bookings"
            );
        } catch (Exception e) {
            log.error("Failed to notify owner: {}", e.getMessage());
        }

        broadcastLifecycleEvent(booking, "PAYMENT_PENDING");

        return toResponse(booking);
    }

    @Transactional
    public BookingDTOs.BookingResponse verifyPayment(String bookingId, String adminId, String ip, String userAgent) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Booking must be in PAYMENT_PENDING status to verify. Current status: " + booking.getStatus());
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);

        // Generate detailed payment record
        Payment payment = Payment.builder()
                .booking(booking)
                .user(booking.getRenter())
                .amount(booking.getTotal())
                .currency("VND")
                .status(com.luxeway.enums.PaymentStatus.SUCCEEDED)
                .method("BANK_TRANSFER")
                .transactionId("LXW-" + booking.getBookingCode() + "-" + (System.currentTimeMillis() % 1000000))
                .description("Manual bank transfer payment verified by admin " + adminId)
                .transferContent(booking.getBookingCode())
                .verifiedBy(adminId)
                .verifiedTime(java.time.LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // Block calendar permanently
        blockAvailabilityCalendar(booking);

        // Timeline History Log
        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .status(BookingStatus.CONFIRMED.name())
                .comment("Admin verified bank transaction and confirmed booking")
                .changedBy(adminId)
                .build();
        bookingStatusHistoryRepository.save(history);

        // Generate PDF Invoice and email to customer
        try {
            invoiceService.generateInvoiceForBooking(booking.getId(), adminId, true);
        } catch (Exception e) {
            log.error("Failed to generate and email PDF invoice: {}", e.getMessage());
        }

        // Complete Audit Log
        auditService.log(
            adminId,
            "PAYMENT_APPROVED",
            "Booking",
            bookingId,
            oldStatus.name(),
            BookingStatus.CONFIRMED.name(),
            ip,
            userAgent
        );

        // Notify Customer & Owner
        try {
            notificationService.createNotification(
                booking.getRenter().getId(),
                "booking",
                "Thanh toán được xác nhận",
                "Thanh toán cho đơn đặt xe " + booking.getBookingCode() + " đã được xác nhận. Xe đã được giữ.",
                "/dashboard/bookings"
            );
        } catch (Exception e) {
            log.error("Failed to notify customer: {}", e.getMessage());
        }

        // Email Alert
        try {
            emailService.sendBookingConfirmation(booking.getRenter().getEmail(), booking);
        } catch (Exception e) {
            log.warn("Failed to send booking confirmation email async: {}", e.getMessage());
        }

        broadcastLifecycleEvent(booking, "PAYMENT_APPROVED");

        return toResponse(booking);
    }

    @Transactional
    public BookingDTOs.BookingResponse rejectPayment(String bookingId, String adminId, String reason, String ip, String userAgent) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Booking must be in PAYMENT_PENDING status to reject. Current status: " + booking.getStatus());
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.PAYMENT_REJECTED);
        booking = bookingRepository.save(booking);

        // Generate failed payment record
        Payment payment = Payment.builder()
                .booking(booking)
                .user(booking.getRenter())
                .amount(booking.getTotal())
                .currency("VND")
                .status(com.luxeway.enums.PaymentStatus.FAILED)
                .method("BANK_TRANSFER")
                .transactionId("REJ-" + booking.getBookingCode() + "-" + (System.currentTimeMillis() % 1000000))
                .description("Manual bank transfer payment rejected. Reason: " + reason)
                .transferContent(booking.getBookingCode())
                .verifiedBy(adminId)
                .verifiedTime(java.time.LocalDateTime.now())
                .rejectedReason(reason)
                .build();
        paymentRepository.save(payment);

        // Free Availability Calendar (release vehicle locks immediately)
        freeAvailabilityCalendar(booking);

        // Timeline History Log
        BookingStatusHistory history = BookingStatusHistory.builder()
                .booking(booking)
                .status(BookingStatus.PAYMENT_REJECTED.name())
                .comment("Admin rejected bank transaction. Reason: " + reason)
                .changedBy(adminId)
                .build();
        bookingStatusHistoryRepository.save(history);

        // Complete Audit Log
        auditService.log(
            adminId,
            "PAYMENT_REJECTED",
            "Booking",
            bookingId,
            oldStatus.name(),
            BookingStatus.PAYMENT_REJECTED.name(),
            ip,
            userAgent
        );

        // Notify Customer
        try {
            notificationService.createNotification(
                booking.getRenter().getId(),
                "booking",
                "Thanh toán bị từ chối",
                "Yêu cầu thanh toán đơn đặt xe " + booking.getBookingCode() + " đã bị từ chối. Lý do: " + reason,
                "/dashboard/bookings"
            );
        } catch (Exception e) {
            log.error("Failed to notify customer: {}", e.getMessage());
        }

        broadcastLifecycleEvent(booking, "PAYMENT_REJECTED");

        return toResponse(booking);
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    @Transactional
    public void checkExpiredBookings() {
        java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusMinutes(15);
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(
            BookingStatus.WAITING_PAYMENT, cutoff
        );

        for (Booking booking : expiredBookings) {
            try {
                BookingStatus oldStatus = booking.getStatus();
                booking.setStatus(BookingStatus.PAYMENT_EXPIRED);
                booking = bookingRepository.save(booking);

                // Free Availability Calendar immediately
                freeAvailabilityCalendar(booking);

                // Timeline History Log
                BookingStatusHistory history = BookingStatusHistory.builder()
                        .booking(booking)
                        .status(BookingStatus.PAYMENT_EXPIRED.name())
                        .comment("Payment timeout. Booking automatically expired and released.")
                        .changedBy("SYSTEM")
                        .build();
                bookingStatusHistoryRepository.save(history);

                // Audit Log
                auditService.log(
                    "SYSTEM",
                    "PAYMENT_TIMEOUT",
                    "Booking",
                    booking.getId(),
                    oldStatus.name(),
                    BookingStatus.PAYMENT_EXPIRED.name(),
                    "127.0.0.1",
                    "Scheduler"
                );

                // Notify Customer
                notificationService.createNotification(
                    booking.getRenter().getId(),
                    "booking",
                    "Đơn đặt xe hết hạn thanh toán",
                    "Đơn đặt xe " + booking.getBookingCode() + " đã hết hạn thanh toán 15 phút. Xe đã được giải phóng.",
                    "/dashboard/bookings"
                );

                broadcastLifecycleEvent(booking, "PAYMENT_EXPIRED");
            } catch (Exception ex) {
                log.error("Failed to process expiration for booking {}: {}", booking.getId(), ex.getMessage());
            }
        }
    }
}
