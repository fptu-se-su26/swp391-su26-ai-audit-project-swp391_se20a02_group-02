package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.NotificationLog;
import com.luxeway.entity.NotificationTemplate;
import com.luxeway.repository.NotificationLogRepository;
import com.luxeway.repository.NotificationTemplateRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/notifications")
@RequiredArgsConstructor
@Tag(name = "Admin Notifications Hub", description = "Endpoints for templates registry and historical logs")
public class NotificationHubController {

    private final NotificationTemplateRepository templateRepository;
    private final NotificationLogRepository logRepository;

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get list of registered message templates")
    public ResponseEntity<ApiResponse<List<NotificationTemplate>>> getTemplates() {
        return ResponseEntity.ok(ApiResponse.success("Templates loaded", templateRepository.findAll()));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get log entries for dispatched messages")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getLogs() {
        return ResponseEntity.ok(ApiResponse.success("Dispatched logs loaded", logRepository.findAll()));
    }
}
