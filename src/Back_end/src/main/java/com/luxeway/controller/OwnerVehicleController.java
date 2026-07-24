package com.luxeway.controller;

import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/owner/vehicles")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OwnerVehicleController {

    @Autowired
    private VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyVehicles(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            List<VehicleDTOs.VehicleResponse> vehicles = vehicleService.getByOwner(user.getId());

            int start = page * size;
            int end = Math.min(start + size, vehicles.size());
            List<VehicleDTOs.VehicleResponse> paged = (start < vehicles.size())
                    ? vehicles.subList(start, end)
                    : List.of();

            Map<String, Object> response = new HashMap<>();
            response.put("vehicles", paged);
            response.put("currentPage", page);
            response.put("totalItems", vehicles.size());
            response.put("totalPages", (int) Math.ceil((double) vehicles.size() / size));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch vehicles", "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createVehicle(
            @AuthenticationPrincipal User user,
            @RequestBody VehicleDTOs.CreateVehicleRequest request) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            VehicleDTOs.VehicleResponse vehicle = vehicleService.create(user.getId(), request);
            return ResponseEntity.ok(Map.of("vehicle", vehicle));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create vehicle", "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateVehicle(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @RequestBody VehicleDTOs.UpdateVehicleRequest request) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            VehicleDTOs.VehicleResponse vehicle = vehicleService.update(id, request, user.getId(), false);
            return ResponseEntity.ok(Map.of("vehicle", vehicle));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update vehicle", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteVehicle(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            vehicleService.delete(id, user.getId(), false);
            return ResponseEntity.ok(Map.of("message", "Vehicle deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete vehicle", "message", e.getMessage()));
        }
    }
}
