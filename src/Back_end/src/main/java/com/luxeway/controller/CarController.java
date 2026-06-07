package com.luxeway.controller;

import com.luxeway.dto.car.CarDTOs;
import com.luxeway.entity.User;
import com.luxeway.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import com.luxeway.dto.car.CarBookingDTOs;
import com.luxeway.service.CarBookingService;
import java.util.List;

@RestController
@RequestMapping("/cars")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CarController {

    @Autowired
    private CarService carService;

    @Autowired
    private CarBookingService carBookingService;


    @GetMapping
    public ResponseEntity<Map<String, Object>> searchCars(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) Boolean hasChauffeur,
            @RequestParam(required = false) Boolean airportDelivery,
            @RequestParam(required = false) Boolean electric,
            @RequestParam(required = false) Boolean hybrid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            Page<CarDTOs.CarResponse> cars = carService.searchCars(
                city, seats, transmission, fuelType, hasChauffeur, airportDelivery, electric, hybrid, page, size
            );
            Map<String, Object> response = new HashMap<>();
            response.put("vehicles", cars.getContent());
            response.put("currentPage", cars.getNumber());
            response.put("totalItems", cars.getTotalElements());
            response.put("totalPages", cars.getTotalPages());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to search cars");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCarById(@PathVariable String id) {
        try {
            CarDTOs.CarResponse car = carService.getCarById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("vehicle", car);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Car not found");
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCar(
            @AuthenticationPrincipal User user,
            @RequestBody CarDTOs.CreateCarRequest request) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            CarDTOs.CarResponse car = carService.createCar(request, user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("vehicle", car);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create car");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCar(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            carService.deleteCar(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Car deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete car");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/bookings")
    public ResponseEntity<Map<String, Object>> createCarBooking(
            @AuthenticationPrincipal User user,
            @RequestBody CarBookingDTOs.CreateCarBookingRequest request) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            CarBookingDTOs.CarBookingResponse booking = carBookingService.createBooking(user.getId(), request);
            Map<String, Object> response = new HashMap<>();
            response.put("booking", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create car booking");
            error.put("message", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<Map<String, Object>> getMyCarBookings(
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            List<CarBookingDTOs.CarBookingResponse> bookings = carBookingService.getBookingsByRenter(user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("bookings", bookings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve car bookings");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/bookings/owner")
    public ResponseEntity<Map<String, Object>> getOwnerCarBookings(
            @AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            List<CarBookingDTOs.CarBookingResponse> bookings = carBookingService.getBookingsByOwner(user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("bookings", bookings);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve owner car bookings");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<Map<String, Object>> getCarBookingById(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            CarBookingDTOs.CarBookingResponse booking = carBookingService.getBookingById(id);
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
            error.put("error", "Car booking not found");
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<Map<String, Object>> updateCarBookingStatus(
            @AuthenticationPrincipal User user,
            @PathVariable String id,
            @RequestParam String status) {
        try {
            if (user == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Unauthorized");
                return ResponseEntity.status(401).body(error);
            }
            CarBookingDTOs.CarBookingResponse booking = carBookingService.updateStatus(id, status);
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
