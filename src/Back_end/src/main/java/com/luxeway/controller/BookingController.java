package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.booking.BookingDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Book vehicles, manage rental lifecycle")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping(value = {"", "/create"})
    @Operation(summary = "Create a new booking request")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> createBooking(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingDTOs.CreateBookingRequest request) {
        BookingDTOs.BookingResponse booking = bookingService.createBooking(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", booking));
    }

    @PostMapping("/validate-pre-book")
    @Operation(summary = "Validate booking criteria before proceeding to checkout")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> validatePreBook(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingDTOs.CreateBookingRequest request) {
        bookingService.validatePreBook(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Validation successful", java.util.Map.of("valid", true)));
    }

    @GetMapping
    @Operation(summary = "Get bookings for the authenticated user (as renter)")
    public ResponseEntity<ApiResponse<Page<BookingDTOs.BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<BookingDTOs.BookingResponse> bookings = bookingService.getMyBookings(user.getId(), page, size);
        ApiResponse<Page<BookingDTOs.BookingResponse>> response = ApiResponse.<Page<BookingDTOs.BookingResponse>>builder()
                .success(true)
                .data(bookings)
                .meta(ApiResponse.PageMeta.builder()
                        .page(bookings.getNumber())
                        .pageSize(bookings.getSize())
                        .totalElements(bookings.getTotalElements())
                        .totalPages(bookings.getTotalPages())
                        .build())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/owner")
    @Operation(summary = "Get all bookings for vehicles owned by the authenticated owner")
    public ResponseEntity<ApiResponse<Page<BookingDTOs.BookingResponse>>> getOwnerBookings(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<BookingDTOs.BookingResponse> bookings = bookingService.getOwnerBookings(user.getId(), page, size);
        ApiResponse<Page<BookingDTOs.BookingResponse>> response = ApiResponse.<Page<BookingDTOs.BookingResponse>>builder()
                .success(true)
                .data(bookings)
                .meta(ApiResponse.PageMeta.builder()
                        .page(bookings.getNumber())
                        .pageSize(bookings.getSize())
                        .totalElements(bookings.getTotalElements())
                        .totalPages(bookings.getTotalPages())
                        .build())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific booking by ID")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> getById(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        BookingDTOs.BookingResponse booking = bookingService.getById(id, user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking (renter or owner)")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> cancel(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingDTOs.CancelBookingRequest request) {
        BookingDTOs.BookingResponse booking = bookingService.cancelBooking(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", booking));
    }

    @PostMapping("/{id}/cancel-request")
    @Operation(summary = "Renter requests cancellation for owner approval")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> requestCancellation(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingDTOs.CancelBookingRequest request) {
        BookingDTOs.BookingResponse booking = bookingService.requestCancellation(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cancellation request sent to owner", booking));
    }

    @PostMapping("/{id}/cancel-request/approve")
    @Operation(summary = "Owner approves renter cancellation request")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> approveCancellation(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) BookingDTOs.CancelBookingRequest request) {
        BookingDTOs.CancelBookingRequest safeRequest = request != null ? request : new BookingDTOs.CancelBookingRequest();
        if (safeRequest.getReason() == null || safeRequest.getReason().isBlank()) {
            safeRequest.setReason("Approved by owner");
        }
        BookingDTOs.BookingResponse booking = bookingService.approveCancellation(id, user.getId(), safeRequest);
        return ResponseEntity.ok(ApiResponse.success("Cancellation approved", booking));
    }

    @PostMapping("/{id}/cancel-request/reject")
    @Operation(summary = "Owner rejects renter cancellation request")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> rejectCancellation(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) BookingDTOs.CancelBookingRequest request) {
        BookingDTOs.CancelBookingRequest safeRequest = request != null ? request : new BookingDTOs.CancelBookingRequest();
        if (safeRequest.getReason() == null || safeRequest.getReason().isBlank()) {
            safeRequest.setReason("Rejected by owner after policy review");
        }
        BookingDTOs.BookingResponse booking = bookingService.rejectCancellation(id, user.getId(), safeRequest);
        return ResponseEntity.ok(ApiResponse.success("Cancellation rejected", booking));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update booking status (owner confirms, starts, or completes booking)")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> updateStatus(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingDTOs.UpdateBookingStatusRequest request) {
        BookingDTOs.BookingResponse booking = bookingService.updateStatus(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated", booking));
    }

    @PostMapping("/{id}/confirm-transfer")
    @Operation(summary = "Renter confirms bank transfer has been executed")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> confirmTransfer(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        BookingDTOs.BookingResponse booking = bookingService.confirmTransfer(id, user.getId(), ip, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Transfer confirmation submitted. Waiting verification.", booking));
    }

    @PostMapping("/{id}/verify-payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Admin verifies payment and confirms booking")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> verifyPayment(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        BookingDTOs.BookingResponse booking = bookingService.verifyPayment(id, user.getId(), ip, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully. Booking is now CONFIRMED.", booking));
    }

    @PostMapping("/{id}/reject-payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Admin rejects payment")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> rejectPayment(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestParam String reason,
            jakarta.servlet.http.HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        BookingDTOs.BookingResponse booking = bookingService.rejectPayment(id, user.getId(), reason, ip, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Payment transfer request rejected.", booking));
    }
}
