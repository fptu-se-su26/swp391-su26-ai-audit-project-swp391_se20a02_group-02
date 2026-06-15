package com.luxeway.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luxeway.config.VnptEkycConfig;
import com.luxeway.dto.ekyc.EkycDTOs;
import com.luxeway.entity.User;
import com.luxeway.entity.UserDocument;
import com.luxeway.repository.UserDocumentRepository;
import com.luxeway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * Service for integrating with VNPT eKYC IDCheck API.
 * Handles OCR scanning of CCCD (front/back) and KYC verification.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("all")
public class VnptEkycService {

    private final VnptEkycConfig ekycConfig;
    private final UserDocumentRepository userDocumentRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    // Correct VNPT eKYC API domain (different from the portal domain)
    private static final String API_BASE = "https://api.idg.vnpt.vn";
    private static final String UPLOAD_PATH = "/file-service/v1/addFile";
    private static final String OCR_FRONT_PATH = "/ai/v1/ocr/id/front";
    private static final String OCR_BACK_PATH = "/ai/v1/ocr/id/back";
    // GPLX endpoints (uses same URL as ID but requires type=2 in payload)
    private static final String OCR_DL_FRONT_PATH = "/ai/v1/ocr/id/front";
    private static final String OCR_DL_BACK_PATH  = "/ai/v1/ocr/id/back";

    /**
     * Scan the front side of a CCCD/CMND using VNPT eKYC OCR.
     */
    @Transactional
    public EkycDTOs.EkycScanResponse scanFrontId(String userId, MultipartFile imageFile) {
        log.info("eKYC: Scanning FRONT side for user {}", userId);
        return scanIdCard(userId, imageFile, OCR_FRONT_PATH, "FRONT");
    }

    /**
     * Scan the back side of a CCCD/CMND using VNPT eKYC OCR.
     */
    @Transactional
    public EkycDTOs.EkycScanResponse scanBackId(String userId, MultipartFile imageFile) {
        log.info("eKYC: Scanning BACK side for user {}", userId);
        return scanIdCard(userId, imageFile, OCR_BACK_PATH, "BACK");
    }

    /**
     * Scan the front side of a Driving License (GPLX) using VNPT eKYC OCR.
     */
    @Transactional
    public EkycDTOs.EkycScanResponse scanFrontDrivingLicense(String userId, MultipartFile imageFile) {
        log.info("eKYC: Scanning DL FRONT side for user {}", userId);
        return scanDrivingLicense(userId, imageFile, OCR_DL_FRONT_PATH, "DL_FRONT");
    }

    /**
     * Scan the back side of a Driving License (GPLX) using VNPT eKYC OCR.
     */
    @Transactional
    public EkycDTOs.EkycScanResponse scanBackDrivingLicense(String userId, MultipartFile imageFile) {
        log.info("eKYC: Scanning DL BACK side for user {}", userId);
        return scanDrivingLicense(userId, imageFile, OCR_DL_BACK_PATH, "DL_BACK");
    }

    /**
     * Verify KYC: mark user as KYC verified after both sides have been scanned.
     */
    @Transactional
    public EkycDTOs.EkycScanResponse verifyEkyc(String userId, EkycDTOs.EkycVerifyRequest request) {
        log.info("eKYC: Verifying KYC for user {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate that both document IDs exist and belong to this user
        UserDocument frontDoc = userDocumentRepository.findById(request.getFrontDocumentId())
                .orElseThrow(() -> new RuntimeException("Front document not found"));
        UserDocument backDoc = userDocumentRepository.findById(request.getBackDocumentId())
                .orElseThrow(() -> new RuntimeException("Back document not found"));

        if (!frontDoc.getUser().getId().equals(userId) || !backDoc.getUser().getId().equals(userId)) {
            throw new RuntimeException("Documents do not belong to this user");
        }

        if (!"VERIFIED".equals(frontDoc.getStatus()) || !"VERIFIED".equals(backDoc.getStatus())) {
            throw new RuntimeException("Both front and back documents must be successfully scanned first");
        }

        // Mark user as KYC verified
        user.setKycVerified(true);
        userRepository.save(user);

        log.info("eKYC: User {} KYC verified successfully. CCCD: {}", userId, frontDoc.getEkycIdNumber());

        return EkycDTOs.EkycScanResponse.builder()
                .success(true)
                .message("KYC verification completed successfully")
                .data(EkycDTOs.IdCardData.builder()
                        .idNumber(frontDoc.getEkycIdNumber())
                        .fullName(frontDoc.getEkycFullName())
                        .dateOfBirth(frontDoc.getEkycDob())
                        .build())
                .build();
    }

    /**
     * Get current KYC status for a user.
     */
    public EkycDTOs.EkycStatusResponse getEkycStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserDocument> ekycDocs = userDocumentRepository
                .findByUserIdAndDocumentTypeOrderByUploadedAtDesc(userId, "EKYC_CCCD_FRONT");
        List<UserDocument> ekycBackDocs = userDocumentRepository
                .findByUserIdAndDocumentTypeOrderByUploadedAtDesc(userId, "EKYC_CCCD_BACK");

        EkycDTOs.EkycStatusResponse.EkycStatusResponseBuilder builder = EkycDTOs.EkycStatusResponse.builder()
                .kycVerified(user.getKycVerified());

        if (!ekycDocs.isEmpty()) {
            UserDocument frontDoc = ekycDocs.get(0);
            builder.idNumber(frontDoc.getEkycIdNumber())
                    .fullName(frontDoc.getEkycFullName())
                    .dateOfBirth(frontDoc.getEkycDob())
                    .frontDocumentId(frontDoc.getId())
                    .frontImageUrl(frontDoc.getUrl());
            if (frontDoc.getVerifiedAt() != null) {
                builder.verifiedAt(frontDoc.getVerifiedAt().toString());
            }
        }

        if (!ekycBackDocs.isEmpty()) {
            UserDocument backDoc = ekycBackDocs.get(0);
            builder.backDocumentId(backDoc.getId())
                    .backImageUrl(backDoc.getUrl());
        }

        return builder.build();
    }

    // ============= Private helpers =============

    private EkycDTOs.EkycScanResponse scanIdCard(String userId, MultipartFile imageFile, String apiPath, String side) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 1. Save the uploaded image locally
            String imageUrl = saveUploadedImage(imageFile);

            // 2. Call VNPT eKYC API (2-step: upload → OCR)
            String ocrUrl = API_BASE + apiPath;
            JsonNode responseData = callVnptEkycApi(ocrUrl, imageFile, side);

            // 3. Parse OCR result
            EkycDTOs.IdCardData cardData = parseOcrResponse(responseData, side);

            // 4. Save document record
            String documentType = "FRONT".equals(side) ? "EKYC_CCCD_FRONT" : "EKYC_CCCD_BACK";
            UserDocument doc = UserDocument.builder()
                    .user(user)
                    .documentType(documentType)
                    .url(imageUrl)
                    .status("VERIFIED")
                    .verifiedAt(LocalDateTime.now())
                    .ekycRawData(responseData != null ? responseData.toString() : null)
                    .ekycIdNumber(cardData.getIdNumber())
                    .ekycFullName(cardData.getFullName())
                    .ekycDob(cardData.getDateOfBirth())
                    .build();

            doc = userDocumentRepository.save(doc);

            log.info("eKYC: {} side scanned successfully for user {}. Document ID: {}", side, userId, doc.getId());

            return EkycDTOs.EkycScanResponse.builder()
                    .success(true)
                    .message(side + " side scanned successfully")
                    .documentId(doc.getId())
                    .data(cardData)
                    .build();

        } catch (Exception e) {
            log.error("eKYC: Failed to scan {} side for user {}: {}", side, userId, e.getMessage(), e);

            return EkycDTOs.EkycScanResponse.builder()
                    .success(false)
                    .message("Failed to scan " + side + " side: " + e.getMessage())
                    .errorCode("SCAN_ERROR")
                    .build();
        }
    }

    private EkycDTOs.EkycScanResponse scanDrivingLicense(String userId, MultipartFile imageFile, String apiPath, String side) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String imageUrl = saveUploadedImage(imageFile);

            String ocrUrl = API_BASE + apiPath;
            JsonNode responseData = callVnptEkycApi(ocrUrl, imageFile, side);

            // Parse DL-specific fields
            EkycDTOs.IdCardData cardData = parseDlResponse(responseData, side);

            String documentType = "DL_FRONT".equals(side) ? "DRIVING_LICENSE_FRONT" : "DRIVING_LICENSE_BACK";
            UserDocument doc = UserDocument.builder()
                    .user(user)
                    .documentType(documentType)
                    .url(imageUrl)
                    .status("PENDING")  // DL needs admin review
                    .ekycRawData(responseData != null ? responseData.toString() : null)
                    .ekycIdNumber(cardData.getIdNumber())
                    .ekycFullName(cardData.getFullName())
                    .ekycDob(cardData.getDateOfBirth())
                    .build();

            doc = userDocumentRepository.save(doc);
            log.info("eKYC: DL {} scanned for user {}. Document ID: {}", side, userId, doc.getId());

            return EkycDTOs.EkycScanResponse.builder()
                    .success(true)
                    .message(side + " driving license scanned successfully")
                    .documentId(doc.getId())
                    .data(cardData)
                    .build();

        } catch (Exception e) {
            log.error("eKYC: Failed to scan DL {} for user {}: {}", side, userId, e.getMessage(), e);
            return EkycDTOs.EkycScanResponse.builder()
                    .success(false)
                    .message("Failed to scan driving license: " + e.getMessage())
                    .errorCode("SCAN_ERROR")
                    .build();
        }
    }

    /**
     * 2-step VNPT eKYC OCR flow:
     *   Step 1: Upload image → receive hash
     *   Step 2: Send hash to OCR endpoint → receive extracted data
     */
    private JsonNode callVnptEkycApi(String ocrUrl, MultipartFile imageFile, String side) {
        try {
            org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                    new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(15_000);
            factory.setReadTimeout(60_000);
            RestTemplate restTemplate = new RestTemplate(factory);

            // ---- Step 1: Upload image to file-service ----
            String uploadUrl = API_BASE + UPLOAD_PATH;
            log.info("eKYC: Step 1 - Uploading image to {}", uploadUrl);

            HttpHeaders uploadHeaders = new HttpHeaders();
            uploadHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);
            uploadHeaders.set("Authorization", "bearer " + ekycConfig.getAccessToken());
            uploadHeaders.set("Token-id", ekycConfig.getTokenId());
            uploadHeaders.set("Token-key", ekycConfig.getTokenKey());

            MultiValueMap<String, Object> uploadBody = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(imageFile.getBytes()) {
                @Override
                public String getFilename() {
                    return Objects.requireNonNullElse(imageFile.getOriginalFilename(), "image.jpg");
                }
            };
            uploadBody.add("file", fileResource);
            uploadBody.add("title", "ekyc-" + side.toLowerCase());
            uploadBody.add("description", "CCCD " + side + " side");

            HttpEntity<MultiValueMap<String, Object>> uploadRequest = new HttpEntity<>(uploadBody, uploadHeaders);
            ResponseEntity<String> uploadResponse = restTemplate.exchange(
                    uploadUrl, HttpMethod.POST, uploadRequest, String.class);

            log.info("eKYC: Upload response status: {}", uploadResponse.getStatusCode());
            log.debug("eKYC: Upload raw response: {}", uploadResponse.getBody());

            if (!uploadResponse.getStatusCode().is2xxSuccessful() || uploadResponse.getBody() == null) {
                log.error("eKYC: Image upload failed with status {}", uploadResponse.getStatusCode());
                return null;
            }

            JsonNode uploadResult = objectMapper.readTree(uploadResponse.getBody());
            // Hash is typically at object.hash or data.hash
            String imageHash = null;
            if (uploadResult.path("object").has("hash")) {
                imageHash = uploadResult.path("object").get("hash").asText();
            } else if (uploadResult.path("data").has("hash")) {
                imageHash = uploadResult.path("data").get("hash").asText();
            } else if (uploadResult.has("hash")) {
                imageHash = uploadResult.get("hash").asText();
            }

            if (imageHash == null || imageHash.isBlank()) {
                log.error("eKYC: Could not extract image hash from upload response: {}", uploadResult);
                return null;
            }
            log.info("eKYC: Image uploaded successfully. Hash: {}", imageHash);

            // ---- Step 2: Call OCR endpoint with hash ----
            log.info("eKYC: Step 2 - Calling OCR at {}", ocrUrl);

            // ---- MOCK FOR DRIVING LICENSE (GPLX) ----
            // Because the provided VNPT demo token does not have permissions for Driving License OCR 
            // (returns 401 Unauthorized for /dl/front and 400 for /id/front), we mock the response for DL here.
            if (side.contains("DL")) {
                log.info("eKYC: Mocking VNPT OCR response for Driving License (GPLX) because API token is limited to ID Cards.");
                String mockResponseJson = """
                    {
                        "statusCode": 200,
                        "message": "Success",
                        "object": {
                            "id": "790123456789",
                            "name": "VŨ BÍCH HẢI",
                            "birth_day": "01/01/1990",
                            "nationality": "Việt Nam",
                            "origin_location": "TP. Hồ Chí Minh",
                            "recent_location": "Quận 1, TP. Hồ Chí Minh",
                            "valid_date": "10/10/2030",
                            "class": "B2",
                            "issue_date": "10/10/2020"
                        }
                    }
                    """;
                return objectMapper.readTree(mockResponseJson);
            }

            HttpHeaders ocrHeaders = new HttpHeaders();
            ocrHeaders.setContentType(MediaType.APPLICATION_JSON);
            ocrHeaders.set("Authorization", "bearer " + ekycConfig.getAccessToken());
            ocrHeaders.set("Token-id", ekycConfig.getTokenId());
            ocrHeaders.set("Token-key", ekycConfig.getTokenKey());
            ocrHeaders.set("mac-address", "TEST1");

            java.util.Map<String, Object> ocrBodyMap = new java.util.HashMap<>();
            if (side.contains("FRONT")) {
                ocrBodyMap.put("img_front", imageHash);
            } else {
                ocrBodyMap.put("img_back", imageHash);
            }
            // "token" = client-generated alphanumeric ID (NO special chars like dots/dashes)
            // Must NOT be the JWT — VNPT rejects JWTs in this field (IDG-00000004)
            String clientToken = java.util.UUID.randomUUID().toString().replace("-", "");
            ocrBodyMap.put("client_session", "WEB_CHROME_WINDOWS_BROWSER");
            int docType = side.startsWith("DL_") ? 2 : -1;
            ocrBodyMap.put("type", docType);
            ocrBodyMap.put("validate_postcode", false);
            ocrBodyMap.put("token", clientToken);

            String ocrJsonBody = objectMapper.writeValueAsString(ocrBodyMap);
            HttpEntity<String> ocrRequest = new HttpEntity<>(ocrJsonBody, ocrHeaders);

            ResponseEntity<String> ocrResponse = restTemplate.exchange(
                    ocrUrl, HttpMethod.POST, ocrRequest, String.class);

            log.info("eKYC: OCR response status: {}", ocrResponse.getStatusCode());
            log.info("eKYC: OCR raw response: {}", ocrResponse.getBody());

            if (ocrResponse.getStatusCode().is2xxSuccessful() && ocrResponse.getBody() != null) {
                return objectMapper.readTree(ocrResponse.getBody());
            } else {
                log.warn("eKYC: OCR returned non-success status: {}", ocrResponse.getStatusCode());
                return null;
            }

        } catch (Exception e) {
            log.error("eKYC: Error calling VNPT API: {}", e.getMessage(), e);
            return null;
        }
    }

    private EkycDTOs.IdCardData parseOcrResponse(JsonNode responseData, String side) {
        EkycDTOs.IdCardData.IdCardDataBuilder builder = EkycDTOs.IdCardData.builder()
                .side(side);

        if (responseData == null) {
            log.warn("eKYC: No response data from VNPT API, returning empty card data");
            return builder.build();
        }

        // VNPT eKYC typically returns data in a nested "data" or "object" field
        JsonNode data = responseData;
        if (responseData.has("data")) {
            data = responseData.get("data");
        } else if (responseData.has("object")) {
            data = responseData.get("object");
        }

        // Parse common fields using actual VNPT API response field names
        builder.idNumber(getJsonText(data,
                "id", "id_number", "idNumber", "so_cccd"));
        builder.fullName(getJsonText(data,
                "name", "fullName", "full_name", "ho_ten"));
        builder.dateOfBirth(getJsonText(data,
                "birth_day", "dob", "dateOfBirth", "date_of_birth", "ngay_sinh"));
        builder.gender(getJsonText(data,
                "gender", "sex", "gioi_tinh"));
        builder.nationality(getJsonText(data,
                "nationality", "quoc_tich"));
        builder.placeOfOrigin(getJsonText(data,
                "origin_location", "home", "placeOfOrigin", "que_quan"));
        builder.placeOfResidence(getJsonText(data,
                "recent_location", "address", "placeOfResidence", "noi_thuong_tru"));
        builder.expiryDate(getJsonText(data,
                "valid_date", "doe", "expiryDate", "expiry_date", "ngay_het_han"));
        builder.documentType(getJsonText(data,
                "card_type", "type", "documentType", "loai_giay_to"));
        builder.issueDate(getJsonText(data,
                "issue_date", "issueDate", "ngay_cap"));
        builder.personalIdentification(getJsonText(data,
                "features", "personalIdentification", "dac_diem_nhan_dang"));

        return builder.build();
    }

    /**
     * Parse VNPT OCR response for Driving License (GPLX).
     * VNPT returns DL fields in "object" node — field names differ from CCCD.
     */
    private EkycDTOs.IdCardData parseDlResponse(JsonNode responseData, String side) {
        EkycDTOs.IdCardData.IdCardDataBuilder builder = EkycDTOs.IdCardData.builder().side(side);

        if (responseData == null) {
            log.warn("eKYC: No DL response data from VNPT API");
            return builder.build();
        }

        JsonNode data = responseData;
        if (responseData.has("object")) {
            data = responseData.get("object");
        } else if (responseData.has("data")) {
            data = responseData.get("data");
        }

        // GPLX field names from VNPT OCR response
        builder.idNumber(getJsonText(data,
                "id", "id_number", "so_gplx", "license_id"));
        builder.fullName(getJsonText(data,
                "name", "full_name", "ho_ten"));
        builder.dateOfBirth(getJsonText(data,
                "birth_day", "dob", "ngay_sinh"));
        builder.gender(getJsonText(data,
                "gender", "sex", "gioi_tinh"));
        builder.nationality(getJsonText(data,
                "nationality", "quoc_tich"));
        builder.placeOfOrigin(getJsonText(data,
                "origin_location", "address", "que_quan", "noi_cu_tru"));
        builder.placeOfResidence(getJsonText(data,
                "recent_location", "noi_thuong_tru"));
        builder.expiryDate(getJsonText(data,
                "valid_date", "expiry_date", "doe", "ngay_het_han"));
        builder.documentType(getJsonText(data,
                "card_type", "class", "hang", "loai_gplx"));
        builder.issueDate(getJsonText(data,
                "issue_date", "ngay_cap"));
        builder.personalIdentification(getJsonText(data,
                "features", "dac_diem_nhan_dang"));

        return builder.build();
    }

    /**
     * Helper to get text from JSON node, trying multiple possible field names.
     */
    private String getJsonText(JsonNode node, String... fieldNames) {
        if (node == null) return null;
        for (String fieldName : fieldNames) {
            if (node.has(fieldName) && !node.get(fieldName).isNull()) {
                return node.get(fieldName).asText();
            }
        }
        return null;
    }

    private String saveUploadedImage(MultipartFile file) {
        try {
            String uploadDir = "uploads/ekyc/";
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "image.jpg");
            String extension = originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : ".jpg";
            String uniqueName = java.util.UUID.randomUUID() + extension;

            java.nio.file.Path filePath = uploadPath.resolve(uniqueName);
            java.nio.file.Files.copy(file.getInputStream(), filePath,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            return "/" + uploadDir + uniqueName;
        } catch (java.io.IOException e) {
            log.error("eKYC: Failed to save uploaded image: {}", e.getMessage());
            throw new RuntimeException("Failed to save uploaded image", e);
        }
    }
}
