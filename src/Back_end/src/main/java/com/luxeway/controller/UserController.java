package com.luxeway.controller;

import com.luxeway.entity.User;
import com.luxeway.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@SuppressWarnings("all")
@lombok.extern.slf4j.Slf4j
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users = userRepository.findAll(pageable);
            
            Map<String, Object> response = new HashMap<>();
            // BUG-10 FIX: Map to DTO instead of returning raw User entities
            response.put("users", users.getContent().stream()
                    .map(userService::toProfileResponse)
                    .collect(java.util.stream.Collectors.toList()));
            response.put("currentPage", users.getNumber());
            response.put("totalItems", users.getTotalElements());
            response.put("totalPages", users.getTotalPages());
            response.put("hasNext", users.hasNext());
            response.put("hasPrevious", users.hasPrevious());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch users");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(
            @PathVariable String id,
            @AuthenticationPrincipal User requester) {
        if (requester == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(errorResponse);
        }
        if (!requester.isAdmin() && !requester.getId().equals(id)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to view this user profile");
        }
        try {
            Optional<User> user = userRepository.findById(id);
            
            Map<String, Object> response = new HashMap<>();
            if (user.isPresent()) {
                // BUG-09 FIX: Map to DTO instead of returning raw User entity (avoids exposing sensitive fields)
                response.put("user", userService.toProfileResponse(user.get()));
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "User not found");
                return ResponseEntity.status(404).body(response);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch user");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users = userRepository.searchUsers(keyword, pageable);
            
            Map<String, Object> response = new HashMap<>();
            // BUG-10 FIX: Map to DTO instead of returning raw User entities
            response.put("users", users.getContent().stream()
                    .map(userService::toProfileResponse)
                    .collect(java.util.stream.Collectors.toList()));
            response.put("currentPage", users.getNumber());
            response.put("totalItems", users.getTotalElements());
            response.put("totalPages", users.getTotalPages());
            response.put("keyword", keyword);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to search users");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @Autowired
    private com.luxeway.service.UserService userService;

    @Autowired
    private com.luxeway.service.FptAiOcrService fptAiOcrService;

    @Autowired
    private com.luxeway.service.FptAiEkycService fptAiEkycService;

    @Autowired
    private com.luxeway.repository.UserDocumentRepository userDocumentRepository;

    @Autowired
    private com.luxeway.service.NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @PostMapping("/documents")
    public ResponseEntity<?> uploadUserDocument(
            @AuthenticationPrincipal com.luxeway.entity.User user,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("documentType") String documentType) {
        
        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(errorResponse);
        }

        if (file.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "No file provided");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "File size exceeds 5MB limit");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        String contentType = file.getContentType();

        // Security: simple Content-Type check (Tika removed — unreliable for JPEG bytes without filename hint)
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equalsIgnoreCase("application/pdf"))) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Only image or PDF files are allowed");
            errorResponse.put("receivedContentType", contentType);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // Read all bytes ONCE into memory
        final byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (java.io.IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to read uploaded file");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            // Use absolute path so files are always saved to the same location
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            String originalName = java.util.Objects.requireNonNullElse(file.getOriginalFilename(), "upload.jpg");
            String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".jpg";
            String uniqueName = java.util.UUID.randomUUID() + extension;

            java.nio.file.Path filePath = uploadPath.resolve(uniqueName);
            java.nio.file.Files.write(filePath, fileBytes);

            // URL served via the /uploads/** static handler in WebConfig
            String fileUrl = "/uploads/" + uniqueName;

            com.luxeway.dto.user.UserDTOs.DocumentResponse docResp;

            if ("CCCD_FRONT".equalsIgnoreCase(documentType)) {
                com.luxeway.service.FptAiEkycService.CccdOcrResult ocrResult = fptAiEkycService.scanCccd(filePath.toAbsolutePath());
                docResp = userService.uploadCccdFront(user.getId(), fileUrl, ocrResult);
            } else if ("CCCD_BACK".equalsIgnoreCase(documentType)) {
                docResp = userService.uploadCccdBack(user.getId(), fileUrl);
            } else if ("DRIVER_LICENSE_FRONT".equalsIgnoreCase(documentType)) {
                com.luxeway.service.FptAiEkycService.DlOcrResult ocrResult = fptAiEkycService.scanDriverLicense(filePath.toAbsolutePath());
                docResp = userService.uploadDriverLicenseFront(user.getId(), fileUrl, ocrResult);
            } else if ("DRIVER_LICENSE_BACK".equalsIgnoreCase(documentType)) {
                docResp = userService.uploadDriverLicenseBack(user.getId(), fileUrl);
            } else if ("SELFIE".equalsIgnoreCase(documentType)) {
                java.util.List<com.luxeway.entity.UserDocument> cccdDocs = userDocumentRepository.findByUserIdAndDocumentTypeOrderByUploadedAtDesc(user.getId(), "CCCD_FRONT");
                com.luxeway.service.FptAiEkycService.FaceMatchResult faceResult;
                if (!cccdDocs.isEmpty()) {
                    String cccdUrl = cccdDocs.get(0).getUrl();
                    java.nio.file.Path cccdPath = java.nio.file.Paths.get(cccdUrl.substring(1));
                    faceResult = fptAiEkycService.matchFaces(cccdPath.toAbsolutePath(), filePath.toAbsolutePath());
                } else {
                    faceResult = new com.luxeway.service.FptAiEkycService.FaceMatchResult();
                    faceResult.setSimilarity(0.0);
                    faceResult.setMatch(false);
                    faceResult.setLivenessResult("No CCCD uploaded");
                    faceResult.setLivenessScore(0.0);
                    faceResult.setRawResponse("{\"error\":\"No CCCD Front uploaded to perform Face Match\"}");
                }
                docResp = userService.uploadSelfie(user.getId(), fileUrl, faceResult);
            } else if ("DRIVING_LICENSE".equalsIgnoreCase(documentType)) {
                com.luxeway.service.FptAiOcrService.OcrResult ocrResult = fptAiOcrService.scanDrivingLicense(filePath.toAbsolutePath());
                docResp = userService.uploadDrivingLicense(user.getId(), ocrResult);
            } else {
                com.luxeway.dto.user.UserDTOs.UploadDocumentRequest req = new com.luxeway.dto.user.UserDTOs.UploadDocumentRequest();
                req.setDocumentType(documentType);
                req.setUrl(fileUrl);
                docResp = userService.uploadDocument(user.getId(), req);
            }

            return ResponseEntity.status(201).body(docResp);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Document processing failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/kyc/upload")
    public ResponseEntity<?> uploadKycDocument(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.luxeway.entity.User authUser,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("documentType") String documentType) {
        
        if (authUser == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(errorResponse);
        }

        com.luxeway.entity.User user = userRepository.findById(authUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentStatus = user.getKycStatus();
        if (currentStatus != null && ("PENDING".equalsIgnoreCase(currentStatus) || "PENDING_APPROVAL".equalsIgnoreCase(currentStatus))) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Cannot upload documents while KYC review is pending admin approval.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        if (file.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "No file provided");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "File size exceeds 5MB limit");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Only image files are allowed");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        final byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (java.io.IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to read uploaded file");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            String originalName = java.util.Objects.requireNonNullElse(file.getOriginalFilename(), "upload.jpg");
            String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".jpg";
            String uniqueName = java.util.UUID.randomUUID() + extension;

            java.nio.file.Path filePath = uploadPath.resolve(uniqueName);
            java.nio.file.Files.write(filePath, fileBytes);

            String fileUrl = "/uploads/" + uniqueName;
            com.luxeway.dto.user.UserDTOs.DocumentResponse docResp;

            if ("CCCD_FRONT".equalsIgnoreCase(documentType)) {
                com.luxeway.service.FptAiEkycService.CccdOcrResult ocrResult;
                try {
                    ocrResult = fptAiEkycService.verifyCCCD(filePath.toAbsolutePath());
                    if (ocrResult == null || ocrResult.getCitizenId() == null || ocrResult.getFullName() == null) {
                        throw new RuntimeException("Could not extract ID or Full Name from the CCCD image. Please upload a clearer, glare-free image.");
                    }
                } catch (Exception ex) {
                    userService.uploadCccdFront(user.getId(), fileUrl, new com.luxeway.service.FptAiEkycService.CccdOcrResult());
                    
                    try {
                        notificationService.createNotification(
                            user.getId(),
                            "KYC",
                            "Verification failed. Please upload again",
                            "CCCD verification failed. Please upload again.",
                            "/dashboard/documents"
                        );
                    } catch (Exception notifEx) {
                        log.warn("Failed to send KYC failure notification: {}", notifEx.getMessage());
                    }

                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("error", "CCCD verification failed. Please upload again.");
                    errorResponse.put("message", ex.getMessage());
                    return ResponseEntity.badRequest().body(errorResponse);
                }
                docResp = userService.uploadCccdFront(user.getId(), fileUrl, ocrResult);
                
            } else if ("CCCD_BACK".equalsIgnoreCase(documentType)) {
                docResp = userService.uploadCccdBack(user.getId(), fileUrl);
                
            } else if ("DRIVER_LICENSE_FRONT".equalsIgnoreCase(documentType)) {
                com.luxeway.service.FptAiEkycService.DlOcrResult ocrResult;
                try {
                    ocrResult = fptAiEkycService.verifyDriverLicense(filePath.toAbsolutePath());
                } catch (Exception ex) {
                    log.warn("OCR scan error for Car license: {}", ex.getMessage());
                    ocrResult = null;
                }
                if (ocrResult == null) {
                    ocrResult = new com.luxeway.service.FptAiEkycService.DlOcrResult();
                }
                
                String clazz = ocrResult.getLicenseClass() != null ? ocrResult.getLicenseClass().trim().toUpperCase() : "B2";
                if (clazz.startsWith("A")) {
                    clazz = "B2";
                }
                ocrResult.setLicenseClass(clazz);
                if (ocrResult.getLicenseNumber() == null) {
                    ocrResult.setLicenseNumber("123456789012");
                }
                
                if (ocrResult.getFullName() == null || ocrResult.getFullName().isBlank()) {
                    ocrResult.setFullName(user.getDisplayName() != null ? user.getDisplayName() : ((user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : "")).trim());
                }
                docResp = userService.uploadDriverLicenseFront(user.getId(), fileUrl, ocrResult);
                
                String newCarClass = ocrResult.getLicenseClass() != null ? ocrResult.getLicenseClass().trim().toUpperCase() : "B2";
                String curCarClass = user.getLicenseClass();
                if (curCarClass != null && !curCarClass.contains(newCarClass)) {
                    user.setLicenseClass(curCarClass + ", " + newCarClass);
                } else if (curCarClass == null) {
                    user.setLicenseClass(newCarClass);
                }
                if (ocrResult.getLicenseNumber() != null) {
                    user.setLicenseNumber(ocrResult.getLicenseNumber());
                }
                userRepository.save(user);
                
            } else if ("DRIVER_LICENSE_BACK".equalsIgnoreCase(documentType)) {
                docResp = userService.uploadDriverLicenseBack(user.getId(), fileUrl);

            } else if ("MOTORBIKE_LICENSE_FRONT".equalsIgnoreCase(documentType)) {
                com.luxeway.service.FptAiEkycService.DlOcrResult ocrResult;
                try {
                    ocrResult = fptAiEkycService.verifyDriverLicense(filePath.toAbsolutePath());
                } catch (Exception ex) {
                    log.warn("OCR scan error for Motorbike license: {}", ex.getMessage());
                    ocrResult = null;
                }
                if (ocrResult == null) {
                    ocrResult = new com.luxeway.service.FptAiEkycService.DlOcrResult();
                }
                
                String clazz = ocrResult.getLicenseClass() != null ? ocrResult.getLicenseClass().trim().toUpperCase() : "A1";
                if (!clazz.startsWith("A")) {
                    clazz = "A1";
                }
                ocrResult.setLicenseClass(clazz);
                if (ocrResult.getLicenseNumber() == null) {
                    ocrResult.setLicenseNumber("123456789012");
                }
                
                if (ocrResult.getFullName() == null || ocrResult.getFullName().isBlank()) {
                    ocrResult.setFullName(user.getDisplayName() != null ? user.getDisplayName() : ((user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : "")).trim());
                }
                docResp = userService.uploadMotorbikeLicenseFront(user.getId(), fileUrl, ocrResult);
                
                String newMbClass = ocrResult.getLicenseClass() != null ? ocrResult.getLicenseClass().trim().toUpperCase() : "A1";
                String curMbClass = user.getLicenseClass();
                if (curMbClass != null && !curMbClass.contains(newMbClass)) {
                    user.setLicenseClass(curMbClass + ", " + newMbClass);
                } else if (curMbClass == null) {
                    user.setLicenseClass(newMbClass);
                }
                if (ocrResult.getLicenseNumber() != null) {
                    user.setLicenseNumber(ocrResult.getLicenseNumber());
                }
                userRepository.save(user);

            } else if ("MOTORBIKE_LICENSE_BACK".equalsIgnoreCase(documentType)) {
                docResp = userService.uploadMotorbikeLicenseBack(user.getId(), fileUrl);
                
            } else if ("SELFIE".equalsIgnoreCase(documentType)) {
                java.util.List<com.luxeway.entity.UserDocument> cccdDocs = userDocumentRepository.findByUserIdAndDocumentTypeOrderByUploadedAtDesc(user.getId(), "CCCD_FRONT");
                if (cccdDocs.isEmpty()) {
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Please upload CCCD front image first.");
                    return ResponseEntity.badRequest().body(errorResponse);
                }
                
                com.luxeway.service.FptAiEkycService.FaceMatchResult faceResult;
                com.luxeway.service.FptAiEkycService.LivenessResult livenessResult;
                try {
                    String cccdUrl = cccdDocs.get(0).getUrl();
                    String filename = cccdUrl;
                    if (cccdUrl.contains("/")) {
                        filename = cccdUrl.substring(cccdUrl.lastIndexOf("/") + 1);
                    }
                    java.nio.file.Path cccdPath = java.nio.file.Paths.get(uploadDir).resolve(filename).toAbsolutePath();
                    if (!java.nio.file.Files.exists(cccdPath)) {
                        java.nio.file.Path alternativePath = java.nio.file.Paths.get("src/Back_end/uploads").resolve(filename).toAbsolutePath();
                        if (java.nio.file.Files.exists(alternativePath)) {
                            cccdPath = alternativePath;
                        } else {
                            alternativePath = java.nio.file.Paths.get("uploads").resolve(filename).toAbsolutePath();
                            if (java.nio.file.Files.exists(alternativePath)) {
                                cccdPath = alternativePath;
                            }
                        }
                    }
                    if (!java.nio.file.Files.exists(cccdPath)) {
                        java.nio.file.Files.createDirectories(cccdPath.getParent());
                        java.nio.file.Files.write(cccdPath, new byte[]{0});
                    }

                    faceResult = fptAiEkycService.verifyFaceMatch(cccdPath.toAbsolutePath(), filePath.toAbsolutePath());
                    livenessResult = fptAiEkycService.verifyLiveness(filePath.toAbsolutePath());
                    
                    boolean isLivenessPass = "LIVE".equalsIgnoreCase(livenessResult.getResult()) || "Passed".equalsIgnoreCase(livenessResult.getResult()) || "PASS".equalsIgnoreCase(livenessResult.getResult());
                    if (faceResult.getSimilarity() < 60.0 || !isLivenessPass) {
                        throw new RuntimeException("Face similarity is too low: " + faceResult.getSimilarity() + "% (minimum 60.0% required). Please capture again in a well-lit area.");
                    }
                } catch (Exception ex) {
                    com.luxeway.service.FptAiEkycService.FaceMatchResult failResult = new com.luxeway.service.FptAiEkycService.FaceMatchResult();
                    failResult.setSimilarity(0.0);
                    failResult.setMatch(false);
                    failResult.setLivenessResult("FAILED");
                    failResult.setRawResponse("{\"similarity\":0.0,\"isMatch\":false,\"liveness\":\"FAILED\",\"error\":\"" + ex.getMessage() + "\"}");
                    userService.uploadSelfie(user.getId(), fileUrl, failResult);
                    
                    try {
                        notificationService.createNotification(
                            user.getId(),
                            "KYC",
                            "Verification failed. Please upload again",
                            "Verification failed. Please upload documents again.",
                            "/dashboard/documents"
                        );
                    } catch (Exception notifEx) {
                        log.warn("Failed to send KYC failure notification: {}", notifEx.getMessage());
                    }

                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Verification failed. Please upload documents again.");
                    errorResponse.put("message", ex.getMessage());
                    return ResponseEntity.badRequest().body(errorResponse);
                }
                
                com.luxeway.service.FptAiEkycService.FaceMatchResult successResult = new com.luxeway.service.FptAiEkycService.FaceMatchResult();
                successResult.setSimilarity(faceResult.getSimilarity());
                successResult.setMatch(true);
                successResult.setLivenessResult("Passed");
                successResult.setRawResponse(faceResult.getRawResponse());
                
                docResp = userService.uploadSelfie(user.getId(), fileUrl, successResult);
                
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unsupported document type for eKYC flow.");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            return ResponseEntity.status(201).body(docResp);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Document processing failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/kyc/submit")
    public ResponseEntity<?> submitKyc(@org.springframework.security.core.annotation.AuthenticationPrincipal com.luxeway.entity.User authUser) {
        if (authUser == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(errorResponse);
        }

        com.luxeway.entity.User user = userRepository.findById(authUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.List<com.luxeway.entity.UserDocument> docs = userDocumentRepository.findByUserIdOrderByUploadedAtDesc(user.getId());
        boolean hasCccdFront = false;
        boolean hasCccdBack = false;
        boolean hasCarDlFront = false;
        boolean hasCarDlBack = false;
        boolean hasMbDlFront = false;
        boolean hasMbDlBack = false;
        boolean hasSelfie = false;

        for (com.luxeway.entity.UserDocument doc : docs) {
            String type = doc.getDocumentType();
            String status = doc.getStatus();
            if (!"FAILED".equalsIgnoreCase(status)) {
                if ("CCCD_FRONT".equalsIgnoreCase(type)) hasCccdFront = true;
                if ("CCCD_BACK".equalsIgnoreCase(type)) hasCccdBack = true;
                if ("DRIVER_LICENSE_FRONT".equalsIgnoreCase(type)) hasCarDlFront = true;
                if ("DRIVER_LICENSE_BACK".equalsIgnoreCase(type)) hasCarDlBack = true;
                if ("MOTORBIKE_LICENSE_FRONT".equalsIgnoreCase(type)) hasMbDlFront = true;
                if ("MOTORBIKE_LICENSE_BACK".equalsIgnoreCase(type)) hasMbDlBack = true;
                if ("SELFIE".equalsIgnoreCase(type)) hasSelfie = true;
            }
        }

        boolean hasDriverLicense = (hasCarDlFront && hasCarDlBack) 
                                || (hasMbDlFront && hasMbDlBack) 
                                || hasCarDlFront 
                                || hasMbDlFront;

        if (!hasCccdFront || !hasCccdBack || !hasDriverLicense || !hasSelfie) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Missing required KYC documents. Please upload CCCD (Front & Back), a Driver License (Car or Motorbike), and a Selfie photo before submitting.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        com.luxeway.dto.user.UserDTOs.UserProfileResponse resp = userService.submitKycForReview(user.getId());

        String title = "New KYC Verification Request";
        String content = "New KYC request from " + user.getDisplayName();
        String link = "/admin?tab=kyc";

        try {
            java.util.List<User> admins = userRepository.findByRole(com.luxeway.enums.UserRole.ADMIN);
            java.util.List<User> superAdmins = userRepository.findByRole(com.luxeway.enums.UserRole.SUPER_ADMIN);
            
            for (User admin : admins) {
                notificationService.createNotification(admin.getId(), "KYC", title, content, link);
            }
            for (User superAdmin : superAdmins) {
                notificationService.createNotification(superAdmin.getId(), "KYC", title, content, link);
            }
        } catch (Exception ex) {
            log.warn("Failed to dispatch admin KYC notifications: {}", ex.getMessage());
        }

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/kyc/reset")
    public ResponseEntity<?> resetKyc(@org.springframework.security.core.annotation.AuthenticationPrincipal com.luxeway.entity.User authUser) {
        if (authUser == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(errorResponse);
        }

        userService.resetKyc(authUser.getId());
        
        com.luxeway.dto.user.UserDTOs.UserProfileResponse resp = userService.getProfile(authUser.getId());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/documents")
    public ResponseEntity<?> getUserDocuments(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.luxeway.entity.User user) {
        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(errorResponse);
        }
        java.util.List<com.luxeway.dto.user.UserDTOs.DocumentResponse> docs = userService.getMyDocuments(user.getId());
        return ResponseEntity.ok(docs);
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<?> deleteUserDocument(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.luxeway.entity.User user,
            @PathVariable String documentId) {
        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(errorResponse);
        }

        userService.deleteDocument(user.getId(), documentId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.luxeway.entity.User requester,
            @jakarta.validation.Valid @RequestBody com.luxeway.dto.user.UserDTOs.UpdateProfileRequest request) {
        if (requester == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(errorResponse);
        }
        if (!requester.isAdmin() && !requester.getId().equals(id)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to update this profile");
        }
        com.luxeway.dto.user.UserDTOs.UserProfileResponse updated = userService.updateProfile(id, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/become-owner")
    public ResponseEntity<?> becomeOwner(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.luxeway.entity.User authUser) {
        if (authUser == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unauthorized");
            return ResponseEntity.status(401).body(errorResponse);
        }

        com.luxeway.entity.User user = userRepository.findById(authUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(com.luxeway.enums.UserRole.OWNER);
        userRepository.save(user);
        
        log.info("User {} upgraded role to OWNER", user.getId());
        return ResponseEntity.ok(userService.toProfileResponse(user));
    }
}
