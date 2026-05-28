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
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/vehicles")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class VehicleController {
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private com.luxeway.service.VehicleService vehicleService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllVehicles(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> category,
            @RequestParam(required = false) List<String> brand,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Integer minSeats,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "false") boolean instantBook,
            @RequestParam(defaultValue = "false") boolean deliveryAvailable,
            @RequestParam(defaultValue = "false") boolean isFeatured,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String status) {
        
        try {
            // Keep compatibility with specific non-AVAILABLE status queries (like Admin or list status queries)
            if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("AVAILABLE")) {
                Pageable pageable = PageRequest.of(page, size);
                VehicleStatus vehicleStatus = VehicleStatus.valueOf(status.toUpperCase());
                Page<Vehicle> vehicles = vehicleRepository.findByStatus(vehicleStatus, pageable);
                
                Map<String, Object> response = new HashMap<>();
                response.put("vehicles", vehicles.getContent().stream().map(vehicleService::toResponse).collect(java.util.stream.Collectors.toList()));
                response.put("currentPage", vehicles.getNumber());
                response.put("totalItems", vehicles.getTotalElements());
                response.put("totalPages", vehicles.getTotalPages());
                response.put("hasNext", vehicles.hasNext());
                response.put("hasPrevious", vehicles.hasPrevious());
                
                return ResponseEntity.ok(response);
            }
            
            // Build filter with multi-select support
            com.luxeway.dto.vehicle.VehicleDTOs.VehicleFilterRequest filter = new com.luxeway.dto.vehicle.VehicleDTOs.VehicleFilterRequest();
            filter.setLocation(location);
            // Support both single category param and multi category list
            if (category != null && !category.isEmpty()) {
                filter.setCategories(category);
                filter.setCategory(category.get(0)); // legacy fallback
            }
            // Multi-select brands (all lowercase for case-insensitive matching)
            if (brand != null && !brand.isEmpty()) {
                filter.setBrands(brand.stream()
                    .map(String::toLowerCase)
                    .collect(java.util.stream.Collectors.toList()));
            }
            filter.setMinPrice(minPrice);
            filter.setMaxPrice(maxPrice);
            filter.setMinSeats(minSeats);
            filter.setTransmission(transmission);
            filter.setFuelType(fuelType);
            filter.setMinRating(minRating);
            filter.setInstantBook(instantBook);
            filter.setDeliveryAvailable(deliveryAvailable);
            filter.setFeatured(isFeatured);
            filter.setSortBy(sortBy);
            filter.setPage(page);
            filter.setSize(size);
            
            Page<com.luxeway.dto.vehicle.VehicleDTOs.VehicleResponse> vehiclesPage = vehicleService.getVehicles(filter);
            
            Map<String, Object> response = new HashMap<>();
            response.put("vehicles", vehiclesPage.getContent());
            response.put("currentPage", vehiclesPage.getNumber());
            response.put("totalItems", vehiclesPage.getTotalElements());
            response.put("totalPages", vehiclesPage.getTotalPages());
            response.put("hasNext", vehiclesPage.hasNext());
            response.put("hasPrevious", vehiclesPage.hasPrevious());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
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
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        try {
            // Use advanced filter if brand/category/location provided
            if ((brand != null && !brand.isEmpty()) || 
                (category != null && !category.isEmpty()) || 
                (location != null && !location.isEmpty())) {
                
                com.luxeway.dto.vehicle.VehicleDTOs.VehicleFilterRequest filter = 
                    new com.luxeway.dto.vehicle.VehicleDTOs.VehicleFilterRequest();
                filter.setPage(page);
                filter.setSize(size);
                
                if (keyword != null && !keyword.isEmpty()) {
                    // keyword will be used by getVehicles for name search
                    filter.setLocation(location);
                }
                if (location != null && !location.isEmpty()) {
                    filter.setLocation(location);
                }
                if (category != null && !category.isEmpty()) {
                    filter.setCategory(category);
                    filter.setCategories(java.util.List.of(category));
                }
                if (brand != null && !brand.isEmpty()) {
                    filter.setBrands(java.util.List.of(brand.toLowerCase()));
                }
                
                org.springframework.data.domain.Page<com.luxeway.dto.vehicle.VehicleDTOs.VehicleResponse> vehiclesPage = 
                    vehicleService.getVehicles(filter);
                
                Map<String, Object> response = new HashMap<>();
                response.put("vehicles", vehiclesPage.getContent());
                response.put("currentPage", vehiclesPage.getNumber());
                response.put("totalItems", vehiclesPage.getTotalElements());
                response.put("totalPages", vehiclesPage.getTotalPages());
                if (keyword != null) response.put("keyword", keyword);
                
                return ResponseEntity.ok(response);
            }
            
            // Basic keyword search
            String searchTerm = (keyword != null && !keyword.isEmpty()) ? keyword : "";
            Pageable pageable = PageRequest.of(page, size);
            Page<Vehicle> vehicles;
            
            if (!searchTerm.isEmpty()) {
                vehicles = vehicleRepository.searchVehicles(searchTerm, VehicleStatus.AVAILABLE, pageable);
            } else {
                vehicles = vehicleRepository.findByStatus(VehicleStatus.AVAILABLE, pageable);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("vehicles", vehicles.getContent().stream()
                .map(vehicleService::toResponse)
                .collect(java.util.stream.Collectors.toList()));
            response.put("currentPage", vehicles.getNumber());
            response.put("totalItems", vehicles.getTotalElements());
            response.put("totalPages", vehicles.getTotalPages());
            response.put("keyword", searchTerm);
            
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