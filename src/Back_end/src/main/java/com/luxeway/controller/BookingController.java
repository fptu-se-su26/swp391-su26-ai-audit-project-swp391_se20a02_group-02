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

    @PutMapping("/{id}/status")
    @Operation(summary = "Update booking status (owner confirms, starts, or completes booking)")
    public ResponseEntity<ApiResponse<BookingDTOs.BookingResponse>> updateStatus(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BookingDTOs.UpdateBookingStatusRequest request) {
        BookingDTOs.BookingResponse booking = bookingService.updateStatus(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated", booking));
    }
}
