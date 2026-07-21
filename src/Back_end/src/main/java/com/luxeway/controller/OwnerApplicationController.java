package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.ownerapplication.OwnerApplicationDTOs.*;
import com.luxeway.entity.User;
import com.luxeway.service.OwnerApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/owner-applications")
@RequiredArgsConstructor
@Tag(name = "Owner Application", description = "Endpoints for Customer to become an Owner")
public class OwnerApplicationController {

    private final OwnerApplicationService applicationService;

    @GetMapping("/me")
    @Operation(summary = "Get my active owner application")
    public ResponseEntity<ApiResponse<OwnerApplicationResponse>> getMyApplication(
            @AuthenticationPrincipal User user) {
        OwnerApplicationResponse response = applicationService.getMyApplication(user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @Operation(summary = "Create a draft owner application")
    public ResponseEntity<ApiResponse<OwnerApplicationResponse>> createDraft(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.createDraft(user.getId())));
    }

    @PutMapping("/{id}/personal-info")
    @Operation(summary = "Update personal info (Step 1)")
    public ResponseEntity<ApiResponse<OwnerApplicationResponse>> updatePersonalInfo(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @Valid @RequestBody PersonalInfoRequest request) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.updatePersonalInfo(user.getId(), id, request)));
    }

    @PutMapping("/{id}/owner-profile")
    @Operation(summary = "Update owner profile (Step 3)")
    public ResponseEntity<ApiResponse<OwnerApplicationResponse>> updateOwnerProfile(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @Valid @RequestBody OwnerProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.updateOwnerProfile(user.getId(), id, request)));
    }

    @PutMapping("/{id}/payout")
    @Operation(summary = "Update payout info (Step 4)")
    public ResponseEntity<ApiResponse<OwnerApplicationResponse>> updatePayout(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @Valid @RequestBody PayoutRequest request) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.updatePayout(user.getId(), id, request)));
    }

    @PostMapping("/{id}/documents")
    @Operation(summary = "Add document reference (Step 2)")
    public ResponseEntity<ApiResponse<OwnerApplicationResponse>> addDocument(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @Valid @RequestBody DocumentUploadRequest request) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.addDocument(user.getId(), id, request)));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit application (Step 5)")
    public ResponseEntity<ApiResponse<OwnerApplicationResponse>> submitApplication(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @Valid @RequestBody TermsAcceptanceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.submitApplication(user.getId(), id, request)));
    }
}
