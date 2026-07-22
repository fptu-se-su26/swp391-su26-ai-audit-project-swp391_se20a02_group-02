package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.FavoriteVehicle;
import com.luxeway.entity.User;
import com.luxeway.repository.FavoriteVehicleRepository;
import com.luxeway.repository.VehicleRepository;
import com.luxeway.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteVehicleController {

    private final FavoriteVehicleRepository favoriteVehicleRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleService vehicleService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<VehicleDTOs.VehicleResponse>>> list(@AuthenticationPrincipal User user) {
        List<VehicleDTOs.VehicleResponse> vehicles = favoriteVehicleRepository.findByUserId(user.getId()).stream()
                .map(FavoriteVehicle::getVehicle)
                .filter(java.util.Objects::nonNull)
                .map(vehicleService::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Favorite vehicles loaded", vehicles));
    }

    @GetMapping("/check/{vehicleId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> check(
            @PathVariable String vehicleId,
            @AuthenticationPrincipal User user) {
        boolean favorite = favoriteVehicleRepository.existsByUserIdAndVehicleId(user.getId(), vehicleId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("favorite", favorite)));
    }

    @PostMapping("/{vehicleId}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> add(
            @PathVariable String vehicleId,
            @AuthenticationPrincipal User user) {
        if (!vehicleRepository.existsById(vehicleId)) {
            return ResponseEntity.badRequest().body(ApiResponse.<Map<String, Boolean>>error("Vehicle not found"));
        }
        if (!favoriteVehicleRepository.existsByUserIdAndVehicleId(user.getId(), vehicleId)) {
            favoriteVehicleRepository.save(FavoriteVehicle.builder()
                    .userId(user.getId())
                    .vehicleId(vehicleId)
                    .build());
        }
        return ResponseEntity.ok(ApiResponse.success("Vehicle added to wishlist", Map.of("favorite", true)));
    }

    @DeleteMapping("/{vehicleId}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> remove(
            @PathVariable String vehicleId,
            @AuthenticationPrincipal User user) {
        favoriteVehicleRepository.deleteByUserIdAndVehicleId(user.getId(), vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Vehicle removed from wishlist", Map.of("favorite", false)));
    }
}
