package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.Dispute;
import com.luxeway.entity.User;
import com.luxeway.service.DisputeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/disputes")
public class DisputeController {

    @Autowired
    private DisputeService disputeService;

    @PostMapping
    public ResponseEntity<ApiResponse<Dispute>> createDispute(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request) {
        Dispute dispute = disputeService.createDispute(
                request.get("bookingId"),
                user.getId(),
                request.get("reason"),
                request.get("description"),
                request.get("evidenceUrl")
        );
        return ResponseEntity.ok(ApiResponse.success("Dispute created", dispute));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<Dispute>>> getDisputesByBooking(@PathVariable String bookingId) {
        return ResponseEntity.ok(ApiResponse.success("Success", disputeService.getDisputesByBooking(bookingId)));
    }

    @GetMapping("/my-disputes")
    public ResponseEntity<ApiResponse<List<Dispute>>> getMyDisputes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Success", disputeService.getDisputesByUser(user.getId())));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Dispute>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        // In a real scenario, this endpoint should be restricted to ADMIN role.
        Dispute dispute = disputeService.updateDisputeStatus(id, request.get("status"), request.get("adminDecision"));
        return ResponseEntity.ok(ApiResponse.success("Dispute updated", dispute));
    }
}
