package com.luxeway.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
public class UploadController {

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file) {

        // Validate file presence
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "No file provided"));
        }

        // Validate file size (5MB max)
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "File size exceeds 5MB limit"));
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Only JPG, PNG, and WEBP files are allowed"));
        }

        try {
            // Create uploads directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalName = Objects.requireNonNull(file.getOriginalFilename());
            String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".jpg";
            String uniqueName = UUID.randomUUID() + extension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = uploadDir + uniqueName;
            log.info("File uploaded: {}", fileUrl);

            return ResponseEntity.ok(Map.of(
                "imageUrl", "/" + fileUrl,
                "url", "/" + fileUrl,
                "filename", uniqueName,
                "size", file.getSize(),
                "contentType", contentType
            ));

        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to save file. Please try again."));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "Upload service is running"));
    }

    /**
     * Alias endpoint specifically for vehicle image upload.
     * Frontend ImageUploader calls POST /upload/vehicle-image
     */
    @PostMapping("/vehicle-image")
    public ResponseEntity<Map<String, Object>> uploadVehicleImage(
            @RequestParam("file") MultipartFile file) {
        return uploadFile(file);
    }
}
