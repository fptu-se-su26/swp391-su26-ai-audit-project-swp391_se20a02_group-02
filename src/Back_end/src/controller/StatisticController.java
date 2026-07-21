package com.luxeway.controller;

import com.luxeway.service.StatisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/stats")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class StatisticController {

    @Autowired
    private StatisticService statisticService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(statisticService.getLandingPageStats());
    }
}
