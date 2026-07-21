package com.luxeway.controller;

import com.luxeway.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/locations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/top")
    public ResponseEntity<List<Map<String, Object>>> getTopCities(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(locationService.getTopCities(limit));
    }
}
