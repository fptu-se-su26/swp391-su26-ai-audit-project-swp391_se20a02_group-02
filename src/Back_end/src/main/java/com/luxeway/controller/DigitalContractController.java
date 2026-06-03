package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.DigitalContract;
import com.luxeway.entity.User;
import com.luxeway.service.DigitalContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/contracts")
public class DigitalContractController {

    @Autowired
    private DigitalContractService contractService;

    @PostMapping
    public ResponseEntity<ApiResponse<DigitalContract>> createContract(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        DigitalContract contract = contractService.createContract(request.get("bookingId"), request.get("documentUrl"), user.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Contract created", contract));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<DigitalContract>> getContract(
            @PathVariable String bookingId,
            @AuthenticationPrincipal User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        DigitalContract contract = contractService.getContractByBooking(bookingId, user.getId(), isAdmin);
        if (contract == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("Success", contract));
    }

    @PutMapping("/{id}/sign")
    public ResponseEntity<ApiResponse<DigitalContract>> signContract(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request) {
        String signature = (String) request.get("signature");
        boolean isOwner = (Boolean) request.get("isOwner");
        DigitalContract contract = contractService.signContract(id, user.getId(), signature, isOwner);
        return ResponseEntity.ok(ApiResponse.success("Contract signed", contract));
    }
}
