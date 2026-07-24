package com.luxeway.controller;

import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/vehicles")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminVehicleController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> approveVehicle(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        try {
            VehicleDTOs.VehicleResponse vehicle = adminService.approveVehicle(id, user.getId());
            return ResponseEntity.ok(Map.of("message", "Vehicle approved successfully", "vehicle", vehicle));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to approve vehicle", "message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectVehicle(
            @PathVariable String id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> payload) {
        try {
            String reason = payload.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("error", "Rejection reason is required"));
            }
            VehicleDTOs.VehicleResponse vehicle = adminService.rejectVehicle(id, user.getId(), reason);
            return ResponseEntity.ok(Map.of("message", "Vehicle rejected successfully", "vehicle", vehicle));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to reject vehicle", "message", e.getMessage()));
        }
    }
}
