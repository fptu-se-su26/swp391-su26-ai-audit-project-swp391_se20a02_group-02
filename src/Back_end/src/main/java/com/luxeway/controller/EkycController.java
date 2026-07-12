package com.luxeway.controller;

import com.luxeway.dto.ekyc.EkycDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.VnptEkycService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for VNPT eKYC IDCheck CCCD scanning.
 * All endpoints require authentication.
 */
@Slf4j
@RestController
@RequestMapping("/ekyc")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class EkycController {

    private final VnptEkycService vnptEkycService;

    /**
     * Scan the FRONT side of a CCCD/CMND.
     * Accepts image file via multipart/form-data.
     */
    @PostMapping("/scan/front")
    public ResponseEntity<?> scanFrontId(
            @AuthenticationPrincipal User user,
            @RequestParam("image") MultipartFile imageFile) {

        if (user == null) {
            return unauthorized();
        }

        if (imageFile == null || imageFile.isEmpty()) {
            return badRequest("No image file provided");
        }

        if (imageFile.getSize() > 10 * 1024 * 1024) {
            return badRequest("Image file size exceeds 10MB limit");
        }

        log.info("eKYC: User {} requesting FRONT side scan", user.getId());
        EkycDTOs.EkycScanResponse response = vnptEkycService.scanFrontId(user.getId(), imageFile);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(422).body(response);
        }
    }

    /**
     * Scan the BACK side of a CCCD/CMND.
     * Accepts image file via multipart/form-data.
     */
    @PostMapping("/scan/back")
    public ResponseEntity<?> scanBackId(
            @AuthenticationPrincipal User user,
            @RequestParam("image") MultipartFile imageFile) {

        if (user == null) {
            return unauthorized();
        }

        if (imageFile == null || imageFile.isEmpty()) {
            return badRequest("No image file provided");
        }

        if (imageFile.getSize() > 10 * 1024 * 1024) {
            return badRequest("Image file size exceeds 10MB limit");
        }

        log.info("eKYC: User {} requesting BACK side scan", user.getId());
        EkycDTOs.EkycScanResponse response = vnptEkycService.scanBackId(user.getId(), imageFile);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(422).body(response);
        }
    }

    /**
     * Verify KYC after both front and back have been scanned.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyEkyc(
            @AuthenticationPrincipal User user,
            @RequestBody EkycDTOs.EkycVerifyRequest request) {

        if (user == null) {
            return unauthorized();
        }

        if (request.getFrontDocumentId() == null || request.getBackDocumentId() == null) {
            return badRequest("Both front and back document IDs are required");
        }

        log.info("eKYC: User {} requesting KYC verification", user.getId());
        EkycDTOs.EkycScanResponse response = vnptEkycService.verifyEkyc(user.getId(), request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(422).body(response);
        }
    }

    /**
     * Get current eKYC/KYC verification status.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getEkycStatus(@AuthenticationPrincipal User user) {
        if (user == null) {
            return unauthorized();
        }

        EkycDTOs.EkycStatusResponse status = vnptEkycService.getEkycStatus(user.getId());
        return ResponseEntity.ok(status);
    }

    /**
     * Scan the FRONT side of a Driving License (GPLX).
     */
    @PostMapping("/driving-license/scan/front")
    public ResponseEntity<?> scanDrivingLicenseFront(
            @AuthenticationPrincipal User user,
            @RequestParam("image") MultipartFile imageFile) {

        if (user == null) return unauthorized();
        if (imageFile == null || imageFile.isEmpty()) return badRequest("No image file provided");
        if (imageFile.getSize() > 10 * 1024 * 1024) return badRequest("Image size exceeds 10MB limit");

        log.info("eKYC: User {} requesting DL FRONT scan", user.getId());
        EkycDTOs.EkycScanResponse response = vnptEkycService.scanFrontDrivingLicense(user.getId(), imageFile);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.status(422).body(response);
    }

    /**
     * Scan the BACK side of a Driving License (GPLX).
     */
    @PostMapping("/driving-license/scan/back")
    public ResponseEntity<?> scanDrivingLicenseBack(
            @AuthenticationPrincipal User user,
            @RequestParam("image") MultipartFile imageFile) {

        if (user == null) return unauthorized();
        if (imageFile == null || imageFile.isEmpty()) return badRequest("No image file provided");
        if (imageFile.getSize() > 10 * 1024 * 1024) return badRequest("Image size exceeds 10MB limit");

        log.info("eKYC: User {} requesting DL BACK scan", user.getId());
        EkycDTOs.EkycScanResponse response = vnptEkycService.scanBackDrivingLicense(user.getId(), imageFile);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.status(422).body(response);
    }

    // ============= Helpers =============

    private ResponseEntity<Map<String, String>> unauthorized() {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Unauthorized");
        error.put("message", "Authentication is required");
        return ResponseEntity.status(401).body(error);
    }

    private ResponseEntity<Map<String, String>> badRequest(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Bad Request");
        error.put("message", message);
        return ResponseEntity.badRequest().body(error);
    }
}
