package com.luxeway.controller;

import com.luxeway.entity.Vehicle;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/vehicles")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VehicleController {
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String status) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Vehicle> vehicles;
            
            if (status != null && !status.isEmpty()) {
                VehicleStatus vehicleStatus = VehicleStatus.valueOf(status.toUpperCase());
                vehicles = vehicleRepository.findByStatus(vehicleStatus, pageable);
            } else {
                vehicles = vehicleRepository.findAll(pageable);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("vehicles", vehicles.getContent());
            response.put("currentPage", vehicles.getNumber());
            response.put("totalItems", vehicles.getTotalElements());
            response.put("totalPages", vehicles.getTotalPages());
            response.put("hasNext", vehicles.hasNext());
            response.put("hasPrevious", vehicles.hasPrevious());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch vehicles");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getVehicleById(@PathVariable String id) {
        try {
            Optional<Vehicle> vehicle = vehicleRepository.findById(id);
            
            Map<String, Object> response = new HashMap<>();
            if (vehicle.isPresent()) {
                response.put("vehicle", vehicle.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Vehicle not found");
                return ResponseEntity.status(404).body(response);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch vehicle");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchVehicles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Vehicle> vehicles = vehicleRepository.searchVehicles(keyword, VehicleStatus.AVAILABLE, pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("vehicles", vehicles.getContent());
            response.put("currentPage", vehicles.getNumber());
            response.put("totalItems", vehicles.getTotalElements());
            response.put("totalPages", vehicles.getTotalPages());
            response.put("keyword", keyword);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to search vehicles");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<Map<String, Object>> getVehiclesByOwner(
            @PathVariable String ownerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Vehicle> vehicles = vehicleRepository.findByOwnerId(ownerId, pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("vehicles", vehicles.getContent());
            response.put("currentPage", vehicles.getNumber());
            response.put("totalItems", vehicles.getTotalElements());
            response.put("totalPages", vehicles.getTotalPages());
            response.put("ownerId", ownerId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch owner's vehicles");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}