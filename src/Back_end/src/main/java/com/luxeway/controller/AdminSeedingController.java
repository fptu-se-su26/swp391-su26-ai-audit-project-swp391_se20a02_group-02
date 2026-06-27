package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.repository.UserRepository;
import com.luxeway.service.SeedingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/seed")
@RequiredArgsConstructor
@Tag(name = "Admin Seeding", description = "Endpoints to trigger enterprise seed data")
public class AdminSeedingController {

    private final SeedingService seedingService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Trigger manual execution of enterprise database seeding (all tables)")
    public ResponseEntity<ApiResponse<String>> triggerSeeding() {
        try {
            seedingService.seedAll();
            return ResponseEntity.ok(ApiResponse.success("Database seeding executed successfully", "Success"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to seed database: " + e.getMessage()));
        }
    }

    @PostMapping("/vehicles")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Seed only the unified vehicles table (used by Landing Page & Marketplace)")
    public ResponseEntity<ApiResponse<String>> triggerVehicleSeeding() {
        try {
            // Get or create the default owner to associate vehicles with
            com.luxeway.entity.User owner = userRepository.findByEmail("owner@luxeway.com")
                .orElseThrow(() -> new RuntimeException("Default owner not found. Run /admin/seed first."));
            seedingService.seedVehicles(owner);
            return ResponseEntity.ok(ApiResponse.success("Vehicles table seeded successfully", "Success"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to seed vehicles: " + e.getMessage()));
        }
    }
}
