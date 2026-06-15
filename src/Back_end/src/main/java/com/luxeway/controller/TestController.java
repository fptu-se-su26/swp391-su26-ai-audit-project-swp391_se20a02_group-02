package com.luxeway.controller;

import com.luxeway.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
@PreAuthorize("hasRole('ADMIN')")
@Profile("dev")
public class TestController {
    
    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            boolean isConnected = connection != null && !connection.isClosed();
            
            // Test repository
            long userCount = userRepository.count();
            
            response.put("status", "SUCCESS");
            response.put("message", "LuxeWay Backend is running!");
            response.put("database_connected", isConnected);
            response.put("total_users", userCount);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", "Database connection failed");
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/db-info")
    public ResponseEntity<Map<String, Object>> getDatabaseInfo() {
        Map<String, Object> response = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            if (connection != null) {
                response.put("database_product_name", connection.getMetaData().getDatabaseProductName());
                response.put("database_product_version", connection.getMetaData().getDatabaseProductVersion());
                response.put("driver_name", connection.getMetaData().getDriverName());
                response.put("driver_version", connection.getMetaData().getDriverVersion());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}