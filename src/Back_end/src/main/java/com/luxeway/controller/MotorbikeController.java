package com.luxeway.controller;

import com.luxeway.dto.motorbike.MotorbikeDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.MotorbikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import com.luxeway.dto.motorbike.MotorbikeBookingDTOs;
import com.luxeway.service.MotorbikeBookingService;
import java.util.List;

@RestController
@RequestMapping("/motorbikes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MotorbikeController {

    @Autowired
    private MotorbikeService motorbikeService;

    @Autowired
    private MotorbikeBookingService motorbikeBookingService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> searchMotorbikes(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer engineCc,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) Boolean helmetIncluded,
            @RequestParam(required = false) Boolean raincoatIncluded,
            @RequestParam(required = false) Boolean phoneHolder,
            @RequestParam(required = false) Boolean luggageRack,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Page<MotorbikeDTOs.MotorbikeResponse> motorbikes = motorbikeService.searchMotorbikes(
                city, engineCc, transmission, helmetIncluded, raincoatIncluded, phoneHolder, luggageRack, page, size
            );
            Map<String, Object> response = new HashMap<>();
            response.put("vehicles", motorbikes.getContent());
            response.put("currentPage", motorbikes.getNumber());
            response.put("totalItems", motorbikes.getTotalElements());
            response.put("totalPages", motorbikes.getTotalPages());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to search motorbikes");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getMotorbikeById(@PathVariable String id) {
        try {
            MotorbikeDTOs.MotorbikeResponse motorbike = motorbikeService.getMotorbikeById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("vehicle", motorbike);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Motorbike not found");
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createMotorbike(
            @AuthenticationPrincipal User user,
            @RequestBody MotorbikeDTOs.CreateMotorbikeRequest request) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            MotorbikeDTOs.MotorbikeResponse motorbike = motorbikeService.createMotorbike(request, user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("vehicle", motorbike);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create motorbike");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMotorbike(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            motorbikeService.deleteMotorbike(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Motorbike deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete motorbike");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/bookings")
    public ResponseEntity<Map<String, Object>> createMotorbikeBooking(
            @AuthenticationPrincipal User user,
            @RequestBody MotorbikeBookingDTOs.CreateMotorbikeBookingRequest request) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            MotorbikeBookingDTOs.MotorbikeBookingResponse booking = motorbikeBookingService.createBooking(user.getId(), request);
            Map<String, Object> response = new HashMap<>();
            response.put("booking", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create motorbike booking");
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<Map<String, Object>> getMyMotorbikeBookings(
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            List<MotorbikeBookingDTOs.MotorbikeBookingResponse> bookings = motorbikeBookingService.getBookingsByRenter(user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("bookings", bookings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve motorbike bookings");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/bookings/owner")
    public ResponseEntity<Map<String, Object>> getOwnerMotorbikeBookings(
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            List<MotorbikeBookingDTOs.MotorbikeBookingResponse> bookings = motorbikeBookingService.getBookingsByOwner(user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("bookings", bookings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve owner motorbike bookings");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<Map<String, Object>> getMotorbikeBookingById(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            MotorbikeBookingDTOs.MotorbikeBookingResponse booking = motorbikeBookingService.getBookingById(id);
            if (!booking.getRenter().getId().equals(user.getId()) &&
                !booking.getOwner().getId().equals(user.getId()) &&
                user.getRole() != com.luxeway.enums.UserRole.ADMIN) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Forbidden");
                return ResponseEntity.status(403).body(error);
            }
            Map<String, Object> response = new HashMap<>();
            response.put("booking", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Motorbike booking not found");
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<Map<String, Object>> updateMotorbikeBookingStatus(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @RequestParam String status) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            MotorbikeBookingDTOs.MotorbikeBookingResponse booking = motorbikeBookingService.updateStatus(id, status);
            Map<String, Object> response = new HashMap<>();
            response.put("booking", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update status");
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }
}
