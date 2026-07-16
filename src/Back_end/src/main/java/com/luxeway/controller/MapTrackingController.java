package com.luxeway.controller;

import com.luxeway.entity.Booking;
import com.luxeway.entity.Vehicle;
import com.luxeway.entity.VehicleTracking;
import com.luxeway.enums.VehicleStatus;
import com.luxeway.repository.BookingRepository;
import com.luxeway.repository.VehicleRepository;
import com.luxeway.repository.VehicleTrackingRepository;
import com.luxeway.service.GoongService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/location")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
@SuppressWarnings("all")
public class MapTrackingController {

    private final GoongService goongService;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final VehicleTrackingRepository vehicleTrackingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 1. Forward Geocoding
    @PostMapping("/geocode")
    public ResponseEntity<Map<String, Object>> geocode(@RequestBody Map<String, String> body) {
        String address = body.get("address");
        if (address == null || address.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Address is required"));
        }
        Map<String, Object> result = goongService.geocode(address);
        return ResponseEntity.ok(result);
    }

    // 2. Reverse Geocoding
    @PostMapping("/reverse")
    public ResponseEntity<Map<String, Object>> reverseGeocode(@RequestBody Map<String, Object> body) {
        Object latObj = body.get("lat");
        Object lngObj = body.get("lng");
        if (latObj == null || lngObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Latitude and Longitude are required"));
        }
        BigDecimal lat = new BigDecimal(latObj.toString());
        BigDecimal lng = new BigDecimal(lngObj.toString());
        Map<String, Object> result = goongService.reverseGeocode(lat, lng);
        return ResponseEntity.ok(result);
    }

    // 3. Directions & Routing polyline
    @PostMapping("/direction")
    public ResponseEntity<Map<String, Object>> getDirection(@RequestBody Map<String, Object> body) {
        Object originLatObj = body.get("originLat");
        Object originLngObj = body.get("originLng");
        Object destLatObj = body.get("destLat");
        Object destLngObj = body.get("destLng");

        if (originLatObj == null || originLngObj == null || destLatObj == null || destLngObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Origin and Destination lat/lng coordinates are required"));
        }

        BigDecimal originLat = new BigDecimal(originLatObj.toString());
        BigDecimal originLng = new BigDecimal(originLngObj.toString());
        BigDecimal destLat = new BigDecimal(destLatObj.toString());
        BigDecimal destLng = new BigDecimal(destLngObj.toString());

        Map<String, Object> result = goongService.getDirection(originLat, originLng, destLat, destLng);
        return ResponseEntity.ok(result);
    }

    // 3.5 Directions GET (for detail page map calculations)
    @GetMapping("/direction")
    public ResponseEntity<Map<String, Object>> getDirectionGet(
            @RequestParam String originLat,
            @RequestParam String originLng,
            @RequestParam String destLat,
            @RequestParam String destLng) {
        try {
            BigDecimal oLat = new BigDecimal(originLat);
            BigDecimal oLng = new BigDecimal(originLng);
            BigDecimal dLat = new BigDecimal(destLat);
            BigDecimal dLng = new BigDecimal(destLng);
            
            Map<String, Object> directionData = goongService.getDirection(oLat, oLng, dLat, dLng);
            
            Map<String, Object> response = new HashMap<>();
            response.put("distance", directionData.getOrDefault("distance_text", "0 km"));
            response.put("duration", directionData.getOrDefault("duration_text", "0 mins"));
            response.put("polyline", directionData.get("polyline"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to fetch directions via GET", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 4. Autocomplete
    @GetMapping("/autocomplete")
    public ResponseEntity<List<Map<String, Object>>> autocomplete(@RequestParam String input) {
        List<Map<String, Object>> suggestions = goongService.autocomplete(input);
        return ResponseEntity.ok(suggestions);
    }

    // 5. Place Detail
    @GetMapping("/detail")
    public ResponseEntity<Map<String, Object>> getPlaceDetail(@RequestParam String placeId) {
        Map<String, Object> detail = goongService.getPlaceDetail(placeId);
        if (detail == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(detail);
    }

    // 6. Nearby Vehicle Search with Distance Matrix sorting
    @GetMapping("/vehicles/nearby")
    public ResponseEntity<Map<String, Object>> findNearbyVehicles(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(required = false) String vehicleType,
            @RequestParam(defaultValue = "nearest") String sortBy) {

        // Query available vehicles
        List<Vehicle> allAvailable = vehicleRepository.findAll();
        List<Vehicle> eligible = new ArrayList<>();
        
        for (Vehicle v : allAvailable) {
            if (v.getStatus() == VehicleStatus.AVAILABLE && v.getLatitude() != null && v.getLongitude() != null) {
                if (vehicleType == null || v.getVehicleType().name().equalsIgnoreCase(vehicleType)) {
                    eligible.add(v);
                }
            }
        }

        if (eligible.isEmpty()) {
            return ResponseEntity.ok(Map.of("vehicles", Collections.emptyList()));
        }

        // Chunk matrix calls if they exceed 25 vehicles (Goong limit)
        // For simplicity, we just build the origin list
        StringBuilder origins = new StringBuilder();
        for (int i = 0; i < eligible.size(); i++) {
            Vehicle v = eligible.get(i);
            origins.append(v.getLatitude().toString()).append(",").append(v.getLongitude().toString());
            if (i < eligible.size() - 1) {
                origins.append("|");
            }
        }

        String destination = lat.toString() + "," + lng.toString();
        List<Map<String, Object>> matrix = goongService.getDistanceMatrix(origins.toString(), destination);

        List<Map<String, Object>> responseVehicles = new ArrayList<>();
        for (int i = 0; i < eligible.size(); i++) {
            Vehicle v = eligible.get(i);
            Map<String, Object> vMap = new HashMap<>();
            vMap.put("id", v.getId());
            vMap.put("name", v.getName());
            vMap.put("brand", v.getBrand());
            vMap.put("model", v.getModel());
            vMap.put("pricePerDay", v.getPricePerDay());
            vMap.put("thumbnailUrl", v.getThumbnailUrl());
            vMap.put("vehicleType", v.getVehicleType().name());
            vMap.put("latitude", v.getLatitude());
            vMap.put("longitude", v.getLongitude());

            // Default fallback metrics
            double dist = 9999.0;
            int dur = 999999;
            String distText = "N/A";
            String durText = "N/A";

            // Find matching matrix entry
            for (Map<String, Object> entry : matrix) {
                if (Integer.parseInt(entry.get("origin_index").toString()) == i) {
                    dist = Double.parseDouble(entry.get("distance_value").toString()) / 1000.0; // km
                    dur = Integer.parseInt(entry.get("duration_value").toString()) / 60; // minutes
                    distText = entry.get("distance_text").toString();
                    durText = entry.get("duration_text").toString();
                    break;
                }
            }

            vMap.put("distance_km", dist);
            vMap.put("duration_min", dur);
            vMap.put("distance_text", distText);
            vMap.put("duration_text", durText);
            responseVehicles.add(vMap);
        }

        // Sort results
        if ("fastest".equalsIgnoreCase(sortBy)) {
            responseVehicles.sort(Comparator.comparingDouble(m -> Double.parseDouble(m.get("duration_min").toString())));
        } else {
            responseVehicles.sort(Comparator.comparingDouble(m -> Double.parseDouble(m.get("distance_km").toString())));
        }

        return ResponseEntity.ok(Map.of("vehicles", responseVehicles));
    }

    // 7. Receive Location Updates and Broadcast via WebSockets
    @PostMapping("/tracking/update")
    public ResponseEntity<Map<String, Object>> updateLocation(@RequestBody Map<String, Object> body) {
        String vehicleId = (String) body.get("vehicleId");
        String bookingId = (String) body.get("bookingId");
        
        Object latObj = body.get("lat");
        Object lngObj = body.get("lng");

        if (vehicleId == null || latObj == null || lngObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "vehicleId, lat, and lng are required"));
        }

        BigDecimal lat = new BigDecimal(latObj.toString());
        BigDecimal lng = new BigDecimal(lngObj.toString());
        
        BigDecimal speed = body.containsKey("speed") && body.get("speed") != null 
                ? new BigDecimal(body.get("speed").toString()) : BigDecimal.ZERO;
        BigDecimal heading = body.containsKey("heading") && body.get("heading") != null 
                ? new BigDecimal(body.get("heading").toString()) : BigDecimal.ZERO;
        String status = (String) body.getOrDefault("status", "DELIVERING");

        // Update Vehicle current coordinates
        Optional<Vehicle> vOpt = vehicleRepository.findById(vehicleId);
        if (vOpt.isPresent()) {
            Vehicle v = vOpt.get();
            v.setCurrentLat(lat);
            v.setCurrentLng(lng);
            v.setLastLocationUpdate(LocalDateTime.now());
            v.setLocationStatus(status);
            vehicleRepository.save(v);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Vehicle not found"));
        }

        // Save tracking history
        Booking booking = null;
        if (bookingId != null && !bookingId.trim().isEmpty()) {
            Optional<Booking> bOpt = bookingRepository.findById(bookingId);
            if (bOpt.isPresent()) {
                booking = bOpt.get();
            }
        }

        VehicleTracking tracking = VehicleTracking.builder()
                .vehicle(vOpt.get())
                .booking(booking)
                .lat(lat)
                .lng(lng)
                .speed(speed)
                .heading(heading)
                .build();
        vehicleTrackingRepository.save(tracking);

        // Package WebSockets coordinate details
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("vehicleId", vehicleId);
        wsPayload.put("bookingId", bookingId);
        wsPayload.put("lat", lat);
        wsPayload.put("lng", lng);
        wsPayload.put("speed", speed);
        wsPayload.put("heading", heading);
        wsPayload.put("status", status);
        wsPayload.put("timestamp", LocalDateTime.now().toString());

        // Broadcast to clients subscribed to this booking or vehicle
        if (bookingId != null && !bookingId.trim().isEmpty()) {
            messagingTemplate.convertAndSend("/topic/tracking/" + bookingId, wsPayload);
        }
        messagingTemplate.convertAndSend("/topic/tracking/vehicle/" + vehicleId, wsPayload);

        return ResponseEntity.ok(Map.of("success", true, "wsBroadcasted", true));
    }

    // 8. Get booking tracking info (Coordinates, routes, history points)
    @GetMapping("/bookings/{id}/tracking")
    public ResponseEntity<Map<String, Object>> getBookingTracking(@PathVariable String id) {
        Optional<Booking> bOpt = bookingRepository.findById(id);
        if (!bOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bOpt.get();
        Vehicle vehicle = booking.getVehicle();

        Map<String, Object> response = new HashMap<>();
        response.put("bookingId", booking.getId());
        response.put("status", booking.getStatus().name());
        
        response.put("pickupLat", booking.getPickupLat());
        response.put("pickupLng", booking.getPickupLng());
        response.put("dropoffLat", booking.getDropoffLat());
        response.put("dropoffLng", booking.getDropoffLng());
        response.put("pickupLocation", booking.getPickupLocation());
        response.put("deliveryAddress", booking.getDeliveryAddress());
        
        response.put("routeDistanceKm", booking.getRouteDistance());
        response.put("estimatedTimeMin", booking.getEstimatedTime());
        response.put("routePolyline", booking.getRoutePolyline());

        if (vehicle != null) {
            response.put("vehicleId", vehicle.getId());
            response.put("vehicleName", vehicle.getName());
            response.put("currentLat", vehicle.getCurrentLat() != null ? vehicle.getCurrentLat() : vehicle.getLatitude());
            response.put("currentLng", vehicle.getCurrentLng() != null ? vehicle.getCurrentLng() : vehicle.getLongitude());
            response.put("locationStatus", vehicle.getLocationStatus());
            response.put("lastLocationUpdate", vehicle.getLastLocationUpdate());
        }

        // Fetch coordinate history points
        List<VehicleTracking> history = vehicleTrackingRepository.findByBookingIdOrderByCreatedAtAsc(booking.getId());
        List<Map<String, Object>> points = new ArrayList<>();
        for (VehicleTracking t : history) {
            Map<String, Object> p = new HashMap<>();
            p.put("lat", t.getLat());
            p.put("lng", t.getLng());
            p.put("speed", t.getSpeed());
            p.put("timestamp", t.getCreatedAt().toString());
            points.add(p);
        }
        response.put("trackingHistory", points);

        return ResponseEntity.ok(response);
    }
}
