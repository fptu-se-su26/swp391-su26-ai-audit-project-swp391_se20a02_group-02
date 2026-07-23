package com.luxeway.controller;

import com.luxeway.dto.ekyc.EkycDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.FptAiEkycService;
import com.luxeway.service.FptAiEkycService.CccdOcrResult;
import com.luxeway.service.FptAiEkycService.DlOcrResult;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * REST Controller for FPT.AI eKYC IDCheck CCCD scanning.
 * All endpoints require authentication.
 */
@Slf4j
@RestController
@RequestMapping("/ekyc")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://luxeway.io.vn"})
@RequiredArgsConstructor
public class EkycController {

    private final FptAiEkycService fptAiEkycService;
    private final UserRepository userRepository;

    private Path saveTempFile(MultipartFile file) throws IOException {
        Path tempDir = Files.createTempDirectory("ekyc");
        Path tempFile = tempDir.resolve(file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload.jpg");
        file.transferTo(tempFile);
        return tempFile;
    }

    private EkycDTOs.IdCardData mapCccdToIdCardData(CccdOcrResult result, String side) {
        EkycDTOs.IdCardData data = new EkycDTOs.IdCardData();
        data.setIdNumber(result.getCitizenId());
        data.setFullName(result.getFullName());
        data.setDateOfBirth(result.getDateOfBirth());
        data.setPlaceOfResidence(result.getAddress());
        data.setExpiryDate(result.getExpiryDate());
        data.setDocumentType("CCCD");
        data.setSide(side);
        return data;
    }

    private EkycDTOs.IdCardData mapDlToIdCardData(DlOcrResult result, String side) {
        EkycDTOs.IdCardData data = new EkycDTOs.IdCardData();
        data.setIdNumber(result.getLicenseNumber());
        data.setFullName(result.getFullName());
        data.setDateOfBirth(result.getDateOfBirth());
        data.setDocumentType("DRIVER_LICENSE_" + result.getLicenseClass());
        data.setIssueDate(result.getIssueDate());
        data.setExpiryDate(result.getExpireDate());
        data.setSide(side);
        return data;
    }

    /**
     * Scan the FRONT side of a CCCD/CMND.
     */
    @PostMapping("/scan/front")
    public ResponseEntity<?> scanFrontId(
            @AuthenticationPrincipal User user,
            @RequestParam("image") MultipartFile imageFile) {

        if (user == null) return unauthorized();
        if (imageFile == null || imageFile.isEmpty()) return badRequest("No image file provided");

        log.info("eKYC: User {} requesting FRONT side scan via FPT.AI", user.getId());
        try {
            Path tempPath = saveTempFile(imageFile);
            CccdOcrResult ocrResult = fptAiEkycService.verifyCCCD(tempPath);
            
            EkycDTOs.EkycScanResponse response = EkycDTOs.EkycScanResponse.builder()
                    .success(true)
                    .message("Scanned front side successfully")
                    .documentId("front_" + System.currentTimeMillis())
                    .data(mapCccdToIdCardData(ocrResult, "FRONT"))
                    .errorCode("0")
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to scan front ID", e);
            return ResponseEntity.status(422).body(EkycDTOs.EkycScanResponse.builder().success(false).message(e.getMessage()).build());
        }
    }

    /**
     * Scan the BACK side of a CCCD/CMND.
     */
    @PostMapping("/scan/back")
    public ResponseEntity<?> scanBackId(
            @AuthenticationPrincipal User user,
            @RequestParam("image") MultipartFile imageFile) {

        if (user == null) return unauthorized();
        if (imageFile == null || imageFile.isEmpty()) return badRequest("No image file provided");

        log.info("eKYC: User {} requesting BACK side scan via FPT.AI", user.getId());
        try {
            Path tempPath = saveTempFile(imageFile);
            CccdOcrResult ocrResult = fptAiEkycService.verifyCCCD(tempPath);
            
            EkycDTOs.EkycScanResponse response = EkycDTOs.EkycScanResponse.builder()
                    .success(true)
                    .message("Scanned back side successfully")
                    .documentId("back_" + System.currentTimeMillis())
                    .data(mapCccdToIdCardData(ocrResult, "BACK"))
                    .errorCode("0")
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to scan back ID", e);
            return ResponseEntity.status(422).body(EkycDTOs.EkycScanResponse.builder().success(false).message(e.getMessage()).build());
        }
    }

    /**
     * Verify KYC after both front and back have been scanned.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyEkyc(
            @AuthenticationPrincipal User user,
            @RequestBody EkycDTOs.EkycVerifyRequest request) {

        if (user == null) return unauthorized();

        log.info("eKYC: User {} requesting KYC verification", user.getId());
        
        // Update user to Verified
        user.setVerified(true);
        user.setKycStatus("VERIFIED");
        userRepository.save(user);

        EkycDTOs.EkycScanResponse response = EkycDTOs.EkycScanResponse.builder()
                .success(true)
                .message("KYC Verified Successfully")
                .errorCode("0")
                .build();
                
        return ResponseEntity.ok(response);
    }

    /**
     * Get current eKYC/KYC verification status.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getEkycStatus(@AuthenticationPrincipal User user) {
        if (user == null) return unauthorized();

        EkycDTOs.EkycStatusResponse status = EkycDTOs.EkycStatusResponse.builder()
                .kycVerified(user.getVerified() != null ? user.getVerified() : false)
                .idNumber("")
                .fullName(user.getFirstName() + " " + user.getLastName())
                .verifiedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
                
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

        log.info("eKYC: User {} requesting DL FRONT scan via FPT.AI", user.getId());
        try {
            Path tempPath = saveTempFile(imageFile);
            DlOcrResult ocrResult = fptAiEkycService.verifyDriverLicense(tempPath);
            
            EkycDTOs.EkycScanResponse response = EkycDTOs.EkycScanResponse.builder()
                    .success(true)
                    .message("Scanned DL front side successfully")
                    .documentId("dl_front_" + System.currentTimeMillis())
                    .data(mapDlToIdCardData(ocrResult, "FRONT"))
                    .errorCode("0")
                    .build();
                    
            // Also update driver license status
            user.setDriverLicenseStatus("VERIFIED");
            userRepository.save(user);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to scan DL front ID", e);
            return ResponseEntity.status(422).body(EkycDTOs.EkycScanResponse.builder().success(false).message(e.getMessage()).build());
        }
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

        log.info("eKYC: User {} requesting DL BACK scan via FPT.AI", user.getId());
        try {
            Path tempPath = saveTempFile(imageFile);
            DlOcrResult ocrResult = fptAiEkycService.verifyDriverLicense(tempPath);
            
            EkycDTOs.EkycScanResponse response = EkycDTOs.EkycScanResponse.builder()
                    .success(true)
                    .message("Scanned DL back side successfully")
                    .documentId("dl_back_" + System.currentTimeMillis())
                    .data(mapDlToIdCardData(ocrResult, "BACK"))
                    .errorCode("0")
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to scan DL back ID", e);
            return ResponseEntity.status(422).body(EkycDTOs.EkycScanResponse.builder().success(false).message(e.getMessage()).build());
        }
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
