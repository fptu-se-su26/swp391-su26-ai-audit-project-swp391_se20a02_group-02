package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.booking.BookingDTOs;
import com.luxeway.dto.customer.CustomerDTOs;
import com.luxeway.dto.payment.PaymentDTOs;
import com.luxeway.dto.review.ReviewDTOs;
import com.luxeway.dto.user.UserDTOs;
import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_CUSTOMER') or hasAuthority('ROLE_OWNER') or hasAuthority('ROLE_ADMIN')")
@Tag(name = "Customer Dashboard", description = "Endpoints for Customer Dashboard & Booking Management")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/dashboard/overview")
    @Operation(summary = "Get customer dashboard overview KPIs and recent bookings")
    public ResponseEntity<ApiResponse<CustomerDTOs.CustomerDashboardOverview>> getOverview(
            @AuthenticationPrincipal User user) {
        CustomerDTOs.CustomerDashboardOverview overview = customerService.getOverview(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Overview loaded", overview));
    }

    @GetMapping("/bookings")
    @Operation(summary = "List customer bookings with optional status filter")
    public ResponseEntity<ApiResponse<Page<BookingDTOs.BookingResponse>>> getBookings(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<BookingDTOs.BookingResponse> bookings = customerService.getBookings(user.getId(), status, page, size);
        return ResponseEntity.ok(ApiResponse.<Page<BookingDTOs.BookingResponse>>builder()
                .success(true).data(bookings)
                .meta(ApiResponse.PageMeta.builder()
                        .page(bookings.getNumber()).pageSize(bookings.getSize())
                        .totalElements(bookings.getTotalElements()).totalPages(bookings.getTotalPages())
                        .build())
                .build());
    }

    @GetMapping("/bookings/upcoming")
    @Operation(summary = "Get list of customer upcoming active bookings")
    public ResponseEntity<ApiResponse<List<BookingDTOs.BookingResponse>>> getUpcomingBookings(
            @AuthenticationPrincipal User user) {
        List<BookingDTOs.BookingResponse> upcoming = customerService.getUpcomingBookings(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Upcoming bookings loaded", upcoming));
    }

    @GetMapping("/bookings/history")
    @Operation(summary = "Get list of customer past completed/cancelled bookings")
    public ResponseEntity<ApiResponse<List<BookingDTOs.BookingResponse>>> getPastBookings(
            @AuthenticationPrincipal User user) {
        List<BookingDTOs.BookingResponse> history = customerService.getPastBookings(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking history loaded", history));
    }

    @GetMapping("/saved-vehicles")
    @Operation(summary = "Get list of customer saved wishlist vehicles")
    public ResponseEntity<ApiResponse<List<VehicleDTOs.VehicleResponse>>> getSavedVehicles(
            @AuthenticationPrincipal User user) {
        List<VehicleDTOs.VehicleResponse> saved = customerService.getSavedVehicles(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Saved vehicles loaded", saved));
    }

    @GetMapping("/payments")
    @Operation(summary = "List customer payment transaction history")
    public ResponseEntity<ApiResponse<Page<PaymentDTOs.PaymentResponse>>> getPayments(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PaymentDTOs.PaymentResponse> payments = customerService.getPayments(user.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.<Page<PaymentDTOs.PaymentResponse>>builder()
                .success(true).data(payments)
                .meta(ApiResponse.PageMeta.builder()
                        .page(payments.getNumber()).pageSize(payments.getSize())
                        .totalElements(payments.getTotalElements()).totalPages(payments.getTotalPages())
                        .build())
                .build());
    }

    @GetMapping("/reviews")
    @Operation(summary = "Get list of reviews written by customer")
    public ResponseEntity<ApiResponse<List<ReviewDTOs.ReviewResponse>>> getReviews(
            @AuthenticationPrincipal User user) {
        List<ReviewDTOs.ReviewResponse> reviews = customerService.getReviews(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Reviews loaded", reviews));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get customer user profile details")
    public ResponseEntity<ApiResponse<UserDTOs.UserProfileResponse>> getProfile(
            @AuthenticationPrincipal User user) {
        UserDTOs.UserProfileResponse profile = customerService.getProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile loaded", profile));
    }
}
