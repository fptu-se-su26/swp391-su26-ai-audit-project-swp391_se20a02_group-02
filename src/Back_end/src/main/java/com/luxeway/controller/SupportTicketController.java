package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.User;
import com.luxeway.service.SupportTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Support Ticket endpoints.
 * Effective URLs (with WebConfig /api/v1 prefix):
 *   POST   /api/v1/support/tickets              — authenticated user
 *   GET    /api/v1/support/tickets/my            — authenticated user
 *   GET    /api/v1/support/tickets/{id}          — authenticated user (owner) or admin
 *   POST   /api/v1/support/tickets/{id}/reply    — authenticated user (owner) or admin
 *   PUT    /api/v1/support/tickets/{id}/status   — ADMIN only
 *   GET    /api/v1/support/tickets               — ADMIN only
 */
@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
@Tag(name = "Support Tickets", description = "Authenticated support request management")
public class SupportTicketController {

    private final SupportTicketService ticketService;

    @PostMapping("/tickets")
    @Operation(summary = "Submit a new support ticket")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTicket(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        Map<String, Object> ticket = ticketService.createTicket(
                user.getId(),
                body.get("subject"),
                body.get("category"),
                body.get("priority"),
                body.get("bookingId"),
                body.get("message")
        );
        return ResponseEntity.ok(ApiResponse.success("Ticket created", ticket));
    }

    @GetMapping("/tickets/my")
    @Operation(summary = "Get all tickets submitted by the current user")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyTickets(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Tickets fetched",
                ticketService.getMyTickets(user.getId())));
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Get ticket detail with message thread")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(ApiResponse.success("Ticket fetched",
                ticketService.getTicketDetail(id, user.getId(), isAdmin)));
    }

    @PostMapping("/tickets/{id}/reply")
    @Operation(summary = "Add a reply message to a ticket")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reply(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(ApiResponse.success("Reply sent",
                ticketService.replyToTicket(id, user.getId(), body.get("message"), isAdmin)));
    }

    @PutMapping("/tickets/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update ticket status (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                ticketService.updateStatus(id, body.get("status"))));
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all support tickets (Admin only)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success("All tickets",
                ticketService.getAllTickets()));
    }
}
