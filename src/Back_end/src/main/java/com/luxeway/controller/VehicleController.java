package com.luxeway.controller;

import com.luxeway.dto.vehicle.VehicleDTOs;
import com.luxeway.entity.Vehicle;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vehicles")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VehicleController {

    // Injected only for admin/status queries that aren't covered by VehicleService yet
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
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            // Ecosystem specific params
            @RequestParam(required = false) String vehicleType,
            @RequestParam(required = false) Integer minEngineCc,
            @RequestParam(required = false) Integer maxEngineCc,
            @RequestParam(required = false) Boolean hasHelmet,
            @RequestParam(required = false) Boolean hasPhoneHolder,
            @RequestParam(required = false) Boolean hasRaincoat,
            @RequestParam(required = false) Boolean hasTouringPackage,
            @RequestParam(required = false) Boolean hasChauffeur,
            @RequestParam(required = false) Boolean airportDelivery,
            @RequestParam(required = false) Boolean weddingRental,
            @RequestParam(required = false) Boolean businessRental) {
        
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
            filter.setStartDate(startDate);
            filter.setEndDate(endDate);
            
            // Map ecosystem params
            filter.setVehicleType(vehicleType);
            filter.setMinEngineCc(minEngineCc);
            filter.setMaxEngineCc(maxEngineCc);
            filter.setHasHelmet(hasHelmet);
            filter.setHasPhoneHolder(hasPhoneHolder);
            filter.setHasRaincoat(hasRaincoat);
            filter.setHasTouringPackage(hasTouringPackage);
            filter.setHasChauffeur(hasChauffeur);
            filter.setAirportDelivery(airportDelivery);
            filter.setWeddingRental(weddingRental);
            filter.setBusinessRental(businessRental);
            
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
            // Use vehicleService to get properly mapped DTO (includes owner, images, features)
            VehicleDTOs.VehicleResponse vehicle = vehicleService.getById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("vehicle", vehicle);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                errorResponse.put("error", "Vehicle not found");
                errorResponse.put("id", id);
                return ResponseEntity.status(404).body(errorResponse);
            }
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
            @AuthenticationPrincipal com.luxeway.entity.User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        try {
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(errorResponse);
            }

            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && !user.getId().equals(ownerId)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Forbidden");
                errorResponse.put("message", "Not authorized to view this owner's fleet");
                return ResponseEntity.status(403).body(errorResponse);
            }

            // Use vehicleService to get properly mapped DTOs (consistent with other endpoints)
            List<VehicleDTOs.VehicleResponse> vehicles = vehicleService.getByOwner(ownerId);

            // Manual pagination since getByOwner returns List
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
            response.put("ownerId", ownerId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch owner's vehicles");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createVehicle(
            @AuthenticationPrincipal com.luxeway.entity.User user,
            @RequestBody VehicleDTOs.CreateVehicleRequest request) {
        try {
            VehicleDTOs.VehicleResponse vehicle = vehicleService.create(user.getId(), request);
            Map<String, Object> response = new HashMap<>();
            response.put("vehicle", vehicle);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create vehicle");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateVehicle(
            @PathVariable String id,
            @AuthenticationPrincipal com.luxeway.entity.User user,
            @RequestBody VehicleDTOs.CreateVehicleRequest request) {
        try {
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            VehicleDTOs.VehicleResponse vehicle = vehicleService.update(id, user.getId(), request, isAdmin);
            Map<String, Object> response = new HashMap<>();
            response.put("vehicle", vehicle);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update vehicle");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteVehicle(
            @PathVariable String id,
            @AuthenticationPrincipal com.luxeway.entity.User user) {
        try {
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            vehicleService.delete(id, user.getId(), isAdmin);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Vehicle deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete vehicle");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}