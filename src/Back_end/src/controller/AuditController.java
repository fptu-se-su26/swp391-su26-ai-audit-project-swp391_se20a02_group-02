package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.AuditLog;
import com.luxeway.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/audit")
@RequiredArgsConstructor
@Tag(name = "Admin Audit Ledger", description = "Query security and transaction ledger trail details")
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get filtered administrative activity trail logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String targetType) {
        return ResponseEntity.ok(ApiResponse.success("Audit logs loaded", 
                auditService.getLogsByFilter(userId, action, targetType)));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Export filtered audit logs ledger in CSV format")
    public ResponseEntity<byte[]> exportLogsCsv(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String targetType) {
        byte[] csvBytes = auditService.exportAuditLogsCsv(userId, action, targetType);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "luxeway-audit-trail-ledger.csv");
        headers.setContentLength(csvBytes.length);
        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }
}
