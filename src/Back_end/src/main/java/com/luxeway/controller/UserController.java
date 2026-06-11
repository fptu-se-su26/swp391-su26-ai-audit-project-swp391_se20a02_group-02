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
        try {
            org.apache.tika.Tika tika = new org.apache.tika.Tika();
            String detectedType = tika.detect(file.getInputStream());
            if (detectedType == null || (!detectedType.startsWith("image/") && !detectedType.equalsIgnoreCase("application/pdf"))) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Security check failed: Only image or PDF files are allowed");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            if (contentType == null || (!contentType.startsWith("image/") && !contentType.equalsIgnoreCase("application/pdf"))) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Claimed format not supported");
                return ResponseEntity.badRequest().body(errorResponse);
            }
        } catch (java.io.IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to verify file integrity");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            String originalName = java.util.Objects.requireNonNull(file.getOriginalFilename());
            String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".jpg";
            String uniqueName = java.util.UUID.randomUUID() + extension;

            java.nio.file.Path filePath = uploadPath.resolve(uniqueName);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/" + uploadDir + uniqueName;

            if ("DRIVING_LICENSE".equalsIgnoreCase(documentType)) {
                try {
                    com.luxeway.service.FptAiOcrService.OcrResult ocrResult = fptAiOcrService.scanDrivingLicense(filePath);
                    java.nio.file.Files.deleteIfExists(filePath);

                    com.luxeway.dto.user.UserDTOs.DocumentResponse docResp = userService.uploadDrivingLicense(
                            user.getId(), ocrResult);
                    return ResponseEntity.status(201).body(docResp);
                } catch (Exception e) {
                    try {
                        java.nio.file.Files.deleteIfExists(filePath);
                    } catch (Exception ex) {
                        // ignore
                    }
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Driving license verification failed");
                    errorResponse.put("message", e.getMessage());
                    return ResponseEntity.badRequest().body(errorResponse);
                }
            } else {
                com.luxeway.dto.user.UserDTOs.UploadDocumentRequest req = new com.luxeway.dto.user.UserDTOs.UploadDocumentRequest();
                req.setDocumentType(documentType);
                req.setUrl(fileUrl);

                com.luxeway.dto.user.UserDTOs.DocumentResponse docResp = userService.uploadDocument(user.getId(), req);

                return ResponseEntity.status(201).body(docResp);
            }

        } catch (java.io.IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to save file");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
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
}
