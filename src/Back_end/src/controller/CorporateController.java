package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.Company;
import com.luxeway.entity.CompanyBooking;
import com.luxeway.entity.CorporateEmployee;
import com.luxeway.entity.Department;
import com.luxeway.entity.User;
import com.luxeway.service.CorporateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/corporate")
@RequiredArgsConstructor
@Tag(name = "Corporate Accounts", description = "Endpoints for managing company billing, budget control, and employee reservations")
public class CorporateController {

    private final CorporateService corporateService;

    @PostMapping("/company")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Register a new corporate enterprise account")
    public ResponseEntity<ApiResponse<Company>> registerCompany(@RequestBody Company company) {
        return ResponseEntity.status(201).body(ApiResponse.success("Company registered", 
                corporateService.registerCompany(company)));
    }

    @PostMapping("/company/{companyId}/department")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Create a new corporate department with budget limits")
    public ResponseEntity<ApiResponse<Department>> createDepartment(
            @PathVariable String companyId, @RequestBody Department department) {
        return ResponseEntity.status(201).body(ApiResponse.success("Department created", 
                corporateService.createDepartment(companyId, department)));
    }

    @PostMapping("/employee")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Register an employee under a corporate department")
    public ResponseEntity<ApiResponse<CorporateEmployee>> addEmployee(
            @RequestBody AddEmployeeRequest request) {
        return ResponseEntity.status(201).body(ApiResponse.success("Employee added successfully", 
                corporateService.addEmployee(request.getUserId(), request.getDepartmentId(), request.getRole())));
    }

    @GetMapping("/employee/profile")
    @Operation(summary = "Get corporate employee profile of current user")
    public ResponseEntity<ApiResponse<CorporateEmployee>> getEmployeeProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return corporateService.getEmployeeProfile(user.getId())
                .map(emp -> ResponseEntity.ok(ApiResponse.success("Profile loaded", emp)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Corporate profile not found")));
    }

    @PostMapping("/bookings")
    @Operation(summary = "Submit corporate booking reservation request for approval")
    public ResponseEntity<ApiResponse<CompanyBooking>> submitBooking(
            @AuthenticationPrincipal User user,
            @RequestBody SubmitCorporateBookingRequest request) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            CompanyBooking booking = corporateService.createCompanyBookingRequest(
                    request.getBookingId(), user.getId(), request.getTotalCost());
            return ResponseEntity.ok(ApiResponse.success("Corporate booking request submitted for review", booking));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/approvals")
    @Operation(summary = "Get list of pending corporate booking approvals")
    public ResponseEntity<ApiResponse<List<CompanyBooking>>> getApprovals() {
        return ResponseEntity.ok(ApiResponse.success("Approvals loaded", corporateService.getPendingApprovals()));
    }

    @PostMapping("/bookings/{bookingId}/review")
    @Operation(summary = "Review (Approve or Reject) a corporate booking reservation")
    public ResponseEntity<ApiResponse<CompanyBooking>> reviewBooking(
            @AuthenticationPrincipal User user,
            @PathVariable String bookingId,
            @RequestParam boolean approved) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(ApiResponse.success("Booking reviewed successfully", 
                corporateService.reviewCompanyBooking(bookingId, user.getId(), approved)));
    }

    @Data
    public static class AddEmployeeRequest {
        private String userId;
        private String departmentId;
        private String role;
    }

    @Data
    public static class SubmitCorporateBookingRequest {
        private String bookingId;
        private BigDecimal totalCost;
    }
}
