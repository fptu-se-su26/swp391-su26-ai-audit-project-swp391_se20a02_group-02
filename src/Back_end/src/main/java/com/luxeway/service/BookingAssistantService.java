package com.luxeway.service;

import com.luxeway.entity.Booking;
import com.luxeway.enums.BookingStatus;
import com.luxeway.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class BookingAssistantService {

    private final BookingRepository bookingRepository;

    @Transactional
    public Map<String, Object> executeCancelBooking(String bookingId) {
        log.info("Executing cancellation request for booking: {}", bookingId);
        Map<String, Object> response = new HashMap<>();
        response.put("action", "CANCEL_BOOKING");
        response.put("bookingId", bookingId);

        Optional<Booking> opt = bookingRepository.findById(bookingId);
        if (opt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Booking reference not found.");
            return response;
        }

        Booking booking = opt.get();
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            response.put("success", true);
            response.put("message", "This rental has already been cancelled.");
            return response;
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            response.put("success", false);
            response.put("message", "Cannot cancel a completed booking.");
            return response;
        }

        // Check 24 hour policy (Warning: can bypass for mock/demo purposes, but let's implement standard check)
        LocalDate start = booking.getStartDate();
        if (start.isBefore(LocalDate.now().plusDays(1))) {
            response.put("success", false);
            response.put("message", "Cancellations must be requested at least 24 hours prior to the trip start date. Please submit an emergency ticket if you have issues.");
            return response;
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        response.put("success", true);
        response.put("message", "Booking successfully cancelled. A full refund has been initiated back to your original payment method.");
        response.put("refundAmount", booking.getTotal());
        return response;
    }

    @Transactional
    public Map<String, Object> executeModifyDates(String bookingId, int extensionDays) {
        log.info("Executing date extension for booking: {}, days: {}", bookingId, extensionDays);
        Map<String, Object> response = new HashMap<>();
        response.put("action", "MODIFY_BOOKING");
        response.put("bookingId", bookingId);
        response.put("extensionDays", extensionDays);

        Optional<Booking> opt = bookingRepository.findById(bookingId);
        if (opt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Booking reference not found.");
            return response;
        }

        Booking booking = opt.get();
        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.ACTIVE) {
            response.put("success", false);
            response.put("message", "Only active or confirmed bookings can be modified.");
            return response;
        }

        LocalDate oldEndDate = booking.getEndDate();
        LocalDate newEndDate = oldEndDate.plusDays(extensionDays);

        booking.setEndDate(newEndDate);
        
        long daysBetween = ChronoUnit.DAYS.between(booking.getStartDate(), newEndDate);
        booking.setTotalDays((int) daysBetween);

        // Update total cost
        BigDecimal additionalCost = booking.getPricePerDay().multiply(BigDecimal.valueOf(extensionDays));
        booking.setTotal(booking.getTotal().add(additionalCost));

        bookingRepository.save(booking);

        response.put("success", true);
        response.put("message", "Booking dates successfully extended by " + extensionDays + " days.");
        response.put("newEndDate", newEndDate.toString());
        response.put("additionalCost", additionalCost);
        response.put("newTotal", booking.getTotal());
        return response;
    }

    public Map<String, Object> retrieveInvoice(String bookingId) {
        log.info("Retrieving invoice metadata for booking: {}", bookingId);
        Map<String, Object> response = new HashMap<>();
        response.put("action", "DOWNLOAD_INVOICE");
        response.put("bookingId", bookingId);

        Optional<Booking> opt = bookingRepository.findById(bookingId);
        if (opt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Booking reference not found.");
            return response;
        }

        Booking booking = opt.get();
        response.put("success", true);
        response.put("invoiceNumber", "LWAY-" + booking.getId().substring(0, 8).toUpperCase());
        response.put("customerName", booking.getRenter() != null ? (booking.getRenter().getFirstName() + " " + booking.getRenter().getLastName()) : "Valued Customer");
        response.put("vehicleName", booking.getVehicle() != null ? booking.getVehicle().getName() : "Premium Vehicle");
        response.put("totalDays", booking.getTotalDays());
        response.put("pricePerDay", booking.getPricePerDay());
        response.put("serviceFee", booking.getServiceFee());
        response.put("taxes", booking.getTaxes());
        response.put("total", booking.getTotal());
        response.put("pdfUrl", "/api/v1/invoices/" + booking.getId() + "/pdf");

        return response;
    }
}
