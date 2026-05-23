package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.admin.AdminDTOs;
import com.luxeway.dto.booking.BookingDTOs;
import com.luxeway.dto.payment.PaymentDTOs;
import com.luxeway.dto.user.UserDTOs;
import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only management endpoints")
public class AdminController {

    private final AdminService adminService;

    // ====== Dashboard ======

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform-wide dashboard statistics")
    public ResponseEntity<ApiResponse<AdminDTOs.DashboardStatsResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // ====== User Management ======

    @GetMapping("/users")
    @Operation(summary = "List all users with optional role filter and search")
    public ResponseEntity<ApiResponse<Page<UserDTOs.UserProfileResponse>>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserDTOs.UserProfileResponse> users = adminService.listUsers(role, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.<Page<UserDTOs.UserProfileResponse>>builder()
                .success(true).data(users)
                .meta(ApiResponse.PageMeta.builder()
                        .page(users.getNumber()).pageSize(users.getSize())
                        .totalElements(users.getTotalElements()).totalPages(users.getTotalPages())
                        .build())
                .build());
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Update user account status (activate/deactivate, verify)")
    public ResponseEntity<ApiResponse<UserDTOs.UserProfileResponse>> updateUserStatus(
            @PathVariable String id,
            @Valid @RequestBody AdminDTOs.UpdateUserStatusRequest request) {
        UserDTOs.UserProfileResponse user = adminService.updateUserStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("User status updated", user));
    }

    // ====== Vehicle Management ======

    @GetMapping("/vehicles")
    @Operation(summary = "List all vehicles with optional status filter")
    public ResponseEntity<ApiResponse<Page<VehicleDTOs.VehicleResponse>>> listAllVehicles(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<VehicleDTOs.VehicleResponse> vehicles = adminService.listAllVehicles(status, page, size);
        return ResponseEntity.ok(ApiResponse.<Page<VehicleDTOs.VehicleResponse>>builder()
                .success(true).data(vehicles)
                .meta(ApiResponse.PageMeta.builder()
                        .page(vehicles.getNumber()).pageSize(vehicles.getSize())
                        .totalElements(vehicles.getTotalElements()).totalPages(vehicles.getTotalPages())
                        .build())
                .build());
    }

    @GetMapping("/vehicles/pending")
    @Operation(summary = "List all vehicles pending approval")
    public ResponseEntity<ApiResponse<Page<VehicleDTOs.VehicleResponse>>> listPendingVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<VehicleDTOs.VehicleResponse> vehicles = adminService.listPendingVehicles(page, size);
        return ResponseEntity.ok(ApiResponse.<Page<VehicleDTOs.VehicleResponse>>builder()
                .success(true).data(vehicles)
                .meta(ApiResponse.PageMeta.builder()
                        .page(vehicles.getNumber()).pageSize(vehicles.getSize())
                        .totalElements(vehicles.getTotalElements()).totalPages(vehicles.getTotalPages())
                        .build())
                .build());
    }

    @PutMapping("/vehicles/{id}/approve")
    @Operation(summary = "Approve a vehicle listing")
    public ResponseEntity<ApiResponse<VehicleDTOs.VehicleResponse>> approveVehicle(@PathVariable String id) {
        VehicleDTOs.VehicleResponse vehicle = adminService.approveVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle approved", vehicle));
    }

    @PutMapping("/vehicles/{id}/reject")
    @Operation(summary = "Reject a vehicle listing")
    public ResponseEntity<ApiResponse<VehicleDTOs.VehicleResponse>> rejectVehicle(
            @PathVariable String id,
            @RequestBody(required = false) AdminDTOs.ApproveVehicleRequest request) {
        String reason = request != null ? request.getReason() : "Does not meet platform standards";
        VehicleDTOs.VehicleResponse vehicle = adminService.rejectVehicle(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Vehicle rejected", vehicle));
    }

    // ====== Booking Management ======

    @GetMapping("/bookings")
    @Operation(summary = "List all bookings with optional status filter")
    public ResponseEntity<ApiResponse<Page<BookingDTOs.BookingResponse>>> listAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<BookingDTOs.BookingResponse> bookings = adminService.listAllBookings(status, page, size);
        return ResponseEntity.ok(ApiResponse.<Page<BookingDTOs.BookingResponse>>builder()
                .success(true).data(bookings)
                .meta(ApiResponse.PageMeta.builder()
                        .page(bookings.getNumber()).pageSize(bookings.getSize())
                        .totalElements(bookings.getTotalElements()).totalPages(bookings.getTotalPages())
                        .build())
                .build());
    }

    // ====== Payment Management ======

    @GetMapping("/payments")
    @Operation(summary = "List all payments")
    public ResponseEntity<ApiResponse<Page<PaymentDTOs.PaymentResponse>>> listAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PaymentDTOs.PaymentResponse> payments = adminService.listAllPayments(page, size);
        return ResponseEntity.ok(ApiResponse.<Page<PaymentDTOs.PaymentResponse>>builder()
                .success(true).data(payments)
                .meta(ApiResponse.PageMeta.builder()
                        .page(payments.getNumber()).pageSize(payments.getSize())
                        .totalElements(payments.getTotalElements()).totalPages(payments.getTotalPages())
                        .build())
                .build());
    }

    @PutMapping("/payments/{id}/refund")
    @Operation(summary = "Process a refund for a payment")
    public ResponseEntity<ApiResponse<PaymentDTOs.PaymentResponse>> processRefund(
            @PathVariable String id,
            @AuthenticationPrincipal User admin,
            @RequestBody AdminDTOs.RefundPaymentRequest request) {
        PaymentDTOs.PaymentResponse payment = adminService.processRefund(id, request, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("Refund processed", payment));
    }
}
