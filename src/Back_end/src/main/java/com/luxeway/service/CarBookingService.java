package com.luxeway.service;

import com.luxeway.dto.car.CarBookingDTOs;
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
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarBookingService {

    private final CarBookingRepository carBookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final CarAvailabilityRepository carAvailabilityRepository;

    @Transactional
    public CarBookingDTOs.CarBookingResponse createBooking(String renterId, CarBookingDTOs.CreateCarBookingRequest req) {
        if (req.getStartDate() == null || req.getEndDate() == null) {
            throw new RuntimeException("Start date and end date are required");
        }
        if (req.getEndDate().isBefore(req.getStartDate())) {
            throw new RuntimeException("End date must be on or after start date");
        }
        if (req.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }

        Car car = carRepository.findByIdForUpdate(req.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found: " + req.getCarId()));

        if (car.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("Car is not available for booking (status: " + car.getStatus() + ")");
        }

        if (carBookingRepository.hasConflictingBooking(req.getCarId(), req.getStartDate(), req.getEndDate())) {
            throw new RuntimeException("Car is already booked for these dates.");
        }

        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new RuntimeException("Renter not found"));

        if (renter.getRole() != com.luxeway.enums.UserRole.ADMIN) {
            if (!Boolean.TRUE.equals(renter.getKycVerified()) || !Boolean.TRUE.equals(renter.getDrivingLicenseVerified())) {
                throw new RuntimeException("KYC identity and driving license verification are required before booking.");
            }
        }

        long totalDays = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate()) + 1;
        BigDecimal basePrice = car.getPricePerDay().multiply(BigDecimal.valueOf(totalDays));
        
        BigDecimal insuranceFee = req.isIncludeInsurance()
                ? car.getPricePerDay().multiply(BigDecimal.valueOf(0.15)).multiply(BigDecimal.valueOf(totalDays))
                : BigDecimal.ZERO;
        
        BigDecimal deliveryFee = req.isAirportDelivery() ? BigDecimal.valueOf(200000) : BigDecimal.ZERO;
        BigDecimal chauffeurFee = req.isHasChauffeur() ? BigDecimal.valueOf(500000).multiply(BigDecimal.valueOf(totalDays)) : BigDecimal.ZERO;
        BigDecimal weddingFee = req.isWeddingPackage() ? BigDecimal.valueOf(1500000) : BigDecimal.ZERO;
        BigDecimal corporateDiscount = req.isBusinessPackage() ? basePrice.multiply(BigDecimal.valueOf(0.1)).setScale(0, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal serviceFee = basePrice.multiply(BigDecimal.valueOf(0.12)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal taxes = basePrice.multiply(BigDecimal.valueOf(0.08)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal total = basePrice.add(insuranceFee).add(deliveryFee).add(chauffeurFee).add(weddingFee).add(serviceFee).add(taxes).subtract(corporateDiscount);

        CarBooking booking = CarBooking.builder()
                .car(car)
                .renter(renter)
                .owner(car.getOwner())
                .status(BookingStatus.CONFIRMED)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .totalDays((int) totalDays)
                .basePrice(basePrice)
                .pricePerDay(car.getPricePerDay())
                .serviceFee(serviceFee)
                .taxes(taxes)
                .total(total)
                .deposit(car.getDeposit())
                .includeInsurance(req.isIncludeInsurance())
                .insuranceTier(req.getInsuranceTier() != null ? req.getInsuranceTier() : "premium")
                .hasChauffeur(req.isHasChauffeur())
                .airportDelivery(req.isAirportDelivery())
                .weddingPackage(req.isWeddingPackage())
                .businessPackage(req.isBusinessPackage())
                .deliveryAddress(req.getDeliveryAddress())
                .pickupLocation(req.getPickupLocation())
                .notes(req.getNotes())
                .couponCode(req.getCouponCode())
                .build();

        booking = carBookingRepository.save(booking);

        // Block calendar
        blockAvailability(booking);

        // Notify owner
        notificationService.createNotification(
                booking.getOwner().getId(),
                "booking",
                "notification.booking.new.title",
                "New car booking by " + renter.getDisplayName() + " for " + car.getName(),
                "/owner/bookings/" + booking.getId()
        );

        return toResponse(booking);
    }

    private void blockAvailability(CarBooking booking) {
        LocalDate start = booking.getStartDate();
        LocalDate end = booking.getEndDate();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            CarAvailability availability = CarAvailability.builder()
                    .car(booking.getCar())
                    .date(date)
                    .isAvailable(false)
                    .build();
            carAvailabilityRepository.save(availability);
        }
    }

    public List<CarBookingDTOs.CarBookingResponse> getBookingsByRenter(String renterId) {
        return carBookingRepository.findByRenterId(renterId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CarBookingDTOs.CarBookingResponse> getBookingsByOwner(String ownerId) {
        return carBookingRepository.findByOwnerId(ownerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CarBookingDTOs.CarBookingResponse getBookingById(String id) {
        CarBooking booking = carBookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car booking not found with ID: " + id));
        return toResponse(booking);
    }

    @Transactional
    public CarBookingDTOs.CarBookingResponse updateStatus(String bookingId, String status) {
        CarBooking booking = carBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Car booking not found"));
        booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        return toResponse(carBookingRepository.save(booking));
    }

    public CarBookingDTOs.CarBookingResponse toResponse(CarBooking b) {
        CarBookingDTOs.CarBookingResponse r = new CarBookingDTOs.CarBookingResponse();
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
        r.setInsuranceTier(b.getInsuranceTier());
        r.setHasChauffeur(b.isHasChauffeur());
        r.setAirportDelivery(b.isAirportDelivery());
        r.setWeddingPackage(b.isWeddingPackage());
        r.setBusinessPackage(b.isBusinessPackage());
        
        r.setDeliveryAddress(b.getDeliveryAddress());
        r.setPickupLocation(b.getPickupLocation());
        r.setNotes(b.getNotes());
        r.setOwnerNotes(b.getOwnerNotes());
        r.setCouponCode(b.getCouponCode());
        r.setCreatedAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);

        if (b.getCar() != null) {
            CarBookingDTOs.CarBookingResponse.CarInfo ci = new CarBookingDTOs.CarBookingResponse.CarInfo();
            ci.setId(b.getCar().getId());
            ci.setName(b.getCar().getName());
            ci.setBrandName(b.getCar().getModel().getBrand().getName());
            ci.setModelName(b.getCar().getModel().getName());
            ci.setCategory(b.getCar().getModel().getCategory());
            ci.setLicensePlate(b.getCar().getLicensePlate());
            if (b.getCar().getImages() != null && !b.getCar().getImages().isEmpty()) {
                ci.setThumbnailUrl(b.getCar().getImages().iterator().next().getUrl());
            }
            r.setCar(ci);
        }

        if (b.getRenter() != null) {
            CarBookingDTOs.CarBookingResponse.UserInfo ui = new CarBookingDTOs.CarBookingResponse.UserInfo();
            ui.setId(b.getRenter().getId());
            ui.setDisplayName(b.getRenter().getDisplayName());
            ui.setAvatar(b.getRenter().getAvatar());
            ui.setPhone(b.getRenter().getPhone());
            r.setRenter(ui);
        }

        if (b.getOwner() != null) {
            CarBookingDTOs.CarBookingResponse.UserInfo oi = new CarBookingDTOs.CarBookingResponse.UserInfo();
            oi.setId(b.getOwner().getId());
            oi.setDisplayName(b.getOwner().getDisplayName());
            oi.setAvatar(b.getOwner().getAvatar());
            oi.setPhone(b.getOwner().getPhone());
            r.setOwner(oi);
        }

        return r;
    }
}
