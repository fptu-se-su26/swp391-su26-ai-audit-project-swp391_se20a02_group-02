package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.admin.AdminDTOs;
import com.luxeway.dto.booking.BookingDTOs;
import com.luxeway.dto.payment.PaymentDTOs;
import com.luxeway.dto.user.UserDTOs;
import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.Dispute;
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
@lombok.extern.slf4j.Slf4j
public class AdminController {

    private final AdminService adminService;
    private final com.luxeway.service.SystemSettingService systemSettingService;
    private final com.luxeway.service.FAQService faqService;
    private final com.luxeway.service.AnalyticsService analyticsService;

    // ====== Dashboard ======

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform-wide dashboard statistics")
    public ResponseEntity<ApiResponse<AdminDTOs.DashboardStatsResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // ====== User Management ======

    @GetMapping("/users")
    @Operation(summary = "List all users with optional role, KYC status filter, and search")
    public ResponseEntity<ApiResponse<Page<UserDTOs.UserProfileResponse>>> listUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String kycStatus,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserDTOs.UserProfileResponse> users = adminService.listUsers(role, kycStatus, keyword, page, size);
        return ResponseEntity.ok(ApiResponse.<Page<UserDTOs.UserProfileResponse>>builder()
                .success(true).data(users)
                .meta(ApiResponse.PageMeta.builder()
                        .page(users.getNumber()).pageSize(users.getSize())
                        .totalElements(users.getTotalElements()).totalPages(users.getTotalPages())
                        .build())
                .build());
    }

    @GetMapping("/users/{userId}/documents")
    @Operation(summary = "Get a specific user's uploaded documents")
    public ResponseEntity<ApiResponse<java.util.List<UserDTOs.DocumentResponse>>> getUserDocuments(
            @PathVariable String userId) {
        java.util.List<UserDTOs.DocumentResponse> docs = adminService.getUserDocuments(userId);
        return ResponseEntity.ok(ApiResponse.success("Success", docs));
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
    @Operation(summary = "List all vehicles with optional status and search keyword filter")
    public ResponseEntity<ApiResponse<Page<VehicleDTOs.VehicleResponse>>> listAllVehicles(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<VehicleDTOs.VehicleResponse> vehicles = adminService.listAllVehicles(status, keyword, page, size);
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
    public ResponseEntity<ApiResponse<VehicleDTOs.VehicleResponse>> approveVehicle(
            @PathVariable String id,
            @AuthenticationPrincipal User admin) {
        String adminId = admin != null ? admin.getId() : "SYSTEM";
        VehicleDTOs.VehicleResponse vehicle = adminService.approveVehicle(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Vehicle approved", vehicle));
    }

    @PutMapping("/vehicles/{id}/reject")
    @Operation(summary = "Reject a vehicle listing")
    public ResponseEntity<ApiResponse<VehicleDTOs.VehicleResponse>> rejectVehicle(
            @PathVariable String id,
            @RequestBody(required = false) AdminDTOs.ApproveVehicleRequest request,
            @AuthenticationPrincipal User admin) {
        String reason = request != null ? request.getReason() : "Does not meet platform standards";
        String adminId = admin != null ? admin.getId() : "SYSTEM";
        VehicleDTOs.VehicleResponse vehicle = adminService.rejectVehicle(id, reason, adminId);
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

    // ====== Dispute Management ======

    @GetMapping("/disputes")
    @Operation(summary = "List all disputes on the platform")
    public ResponseEntity<ApiResponse<java.util.List<Dispute>>> listAllDisputes() {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.listAllDisputes()));
    }

    @PutMapping("/users/documents/{id}/status")
    @Operation(summary = "Review user KYC/Verification Document")
    public ResponseEntity<ApiResponse<UserDTOs.DocumentResponse>> reviewUserDocument(
            @PathVariable String id,
            @Valid @RequestBody AdminDTOs.ReviewDocumentRequest request) {
        UserDTOs.DocumentResponse doc = adminService.reviewDocument(id, request);
        return ResponseEntity.ok(ApiResponse.success("Document status updated successfully", doc));
    }

    @GetMapping("/kyc")
    @Operation(summary = "Get list of all users with PENDING KYC status")
    public ResponseEntity<ApiResponse<java.util.List<UserDTOs.UserProfileResponse>>> getPendingKyc() {
        return ResponseEntity.ok(ApiResponse.success("Success", adminService.getPendingKycUsers()));
    }

    @PutMapping("/kyc/{userId}/approve")
    @Operation(summary = "Approve user's KYC application")
    public ResponseEntity<ApiResponse<UserDTOs.UserProfileResponse>> approveUserKyc(
            @PathVariable String userId,
            @AuthenticationPrincipal User admin) {
        UserDTOs.UserProfileResponse user = adminService.approveUserKyc(userId, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("KYC approved", user));
    }

    @PutMapping("/kyc/{userId}/reject")
    @Operation(summary = "Reject user's KYC application")
    public ResponseEntity<ApiResponse<UserDTOs.UserProfileResponse>> rejectUserKyc(
            @PathVariable String userId,
            @AuthenticationPrincipal User admin,
            @RequestBody(required = false) java.util.Map<String, String> payload) {
        String reason = "Documents rejected by administrator";
        if (payload != null && payload.containsKey("reason")) {
            reason = payload.get("reason");
        }
        UserDTOs.UserProfileResponse user = adminService.rejectUserKyc(userId, reason, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("KYC rejected", user));
    }

    @GetMapping("/settings")
    @Operation(summary = "List all dynamic platform system configurations")
    public ResponseEntity<ApiResponse<java.util.List<com.luxeway.entity.SystemSetting>>> listSettings() {
        return ResponseEntity.ok(ApiResponse.success("System settings retrieved successfully", systemSettingService.getAllSettings()));
    }

    @PutMapping("/settings")
    @Operation(summary = "Update a specific platform configuration setting")
    public ResponseEntity<ApiResponse<com.luxeway.entity.SystemSetting>> updateSetting(
            @RequestBody java.util.Map<String, String> payload) {
        String key = payload.get("settingKey");
        String value = payload.get("settingValue");
        if (key == null || value == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("settingKey and settingValue are required"));
        }
        try {
            com.luxeway.entity.SystemSetting updated = systemSettingService.updateSetting(key, value);
            return ResponseEntity.ok(ApiResponse.success("System setting updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/faqs")
    @Operation(summary = "List all active and inactive FAQs for admin panel")
    public ResponseEntity<ApiResponse<java.util.List<com.luxeway.entity.FAQ>>> listAllFAQs() {
        return ResponseEntity.ok(ApiResponse.success("FAQs retrieved successfully", faqService.getAllFAQs()));
    }

    @PostMapping("/faqs")
    @Operation(summary = "Create a new FAQ resource entry")
    public ResponseEntity<ApiResponse<com.luxeway.entity.FAQ>> createFAQ(
            @RequestBody com.luxeway.entity.FAQ faq) {
        try {
            com.luxeway.entity.FAQ created = faqService.createFAQ(faq);
            return ResponseEntity.status(201).body(ApiResponse.success("FAQ created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/faqs/{id}")
    @Operation(summary = "Update an existing FAQ entry by ID")
    public ResponseEntity<ApiResponse<com.luxeway.entity.FAQ>> updateFAQ(
            @PathVariable Long id,
            @RequestBody com.luxeway.entity.FAQ faq) {
        try {
            com.luxeway.entity.FAQ updated = faqService.updateFAQ(id, faq);
            return ResponseEntity.ok(ApiResponse.success("FAQ updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/faqs/{id}")
    @Operation(summary = "Hard delete an FAQ entry from platform resources")
    public ResponseEntity<ApiResponse<Void>> deleteFAQ(
            @PathVariable Long id) {
        try {
            faqService.deleteFAQ(id);
            return ResponseEntity.ok(ApiResponse.success("FAQ deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    // ====== Analytics Management ======

    @GetMapping("/analytics/overview")
    @Operation(summary = "Get platform-wide cumulative summary analytics")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getAnalyticsOverview() {
        return ResponseEntity.ok(ApiResponse.success("Analytics overview retrieved", analyticsService.getOverviewStats()));
    }

    @GetMapping("/analytics/historical")
    @Operation(summary = "Get historical daily analytics records")
    public ResponseEntity<ApiResponse<java.util.List<com.luxeway.entity.Analytics>>> getHistoricalAnalytics(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success("Historical metrics retrieved", analyticsService.getHistoricalMetrics(days)));
    }

    @PostMapping("/analytics/trigger")
    @Operation(summary = "Trigger manual analytics compilation for a specific date")
    public ResponseEntity<ApiResponse<com.luxeway.entity.Analytics>> triggerCompilation(
            @RequestParam String date) {
        try {
            java.time.LocalDate localDate = java.time.LocalDate.parse(date);
            com.luxeway.entity.Analytics compiled = analyticsService.compileAnalyticsForDate(localDate);
            return ResponseEntity.ok(ApiResponse.success("Analytics compiled successfully", compiled));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    // ====== Report Exporters ======

    @GetMapping("/reports/revenue/pdf")
    @Operation(summary = "Export platform gross revenue and sales audit report in PDF format")
    public ResponseEntity<byte[]> exportRevenueReportPdf() {
        try {
            byte[] pdfBytes = adminService.exportRevenueReportPdf();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDisposition(org.springframework.http.ContentDisposition.builder("attachment")
                    .filename("luxeway-revenue-report-" + System.currentTimeMillis() + ".pdf")
                    .build());
            headers.setContentLength(pdfBytes.length);
            return new ResponseEntity<>(pdfBytes, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to generate and export PDF report: {}", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/reports/revenue/excel")
    @Operation(summary = "Export platform gross revenue and sales report in Excel CSV format")
    public ResponseEntity<byte[]> exportRevenueReportExcel() {
        try {
            byte[] csvBytes = adminService.exportRevenueReportExcel();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.parseMediaType("text/csv"));
            headers.setContentDisposition(org.springframework.http.ContentDisposition.builder("attachment")
                    .filename("luxeway-revenue-report-" + System.currentTimeMillis() + ".csv")
                    .build());
            headers.setContentLength(csvBytes.length);
            return new ResponseEntity<>(csvBytes, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to generate and export Excel report: {}", e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
