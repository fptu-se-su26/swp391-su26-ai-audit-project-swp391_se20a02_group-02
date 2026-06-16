package com.luxeway.controller;

import com.luxeway.dto.ApiResponse;
import com.luxeway.entity.AIChatMessage;
import com.luxeway.entity.AIFeedback;
import com.luxeway.entity.AIUserPreference;
import com.luxeway.entity.User;
import com.luxeway.service.AIChatService;
import com.luxeway.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"})
@Tag(name = "LuxeWay Luxury AI Concierge API", description = "Endpoints for luxury concierge AI dialogues, feedback, preferences, and admin dashboard statistics")
public class AIChatController {

    private final AIChatService aiChatService;
    private final ConversationService conversationService;

    @PostMapping("/chat")
    @Operation(summary = "Query the VIP AI Concierge chatbot with session page variables")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chat(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {

        String sessionId = body.get("sessionId");
        String message = body.get("message");
        String currentPage = body.get("currentPage");
        String activeVehicleId = body.get("activeVehicleId");
        String activeBookingId = body.get("activeBookingId");

        if (sessionId == null || sessionId.trim().isEmpty()) {
            sessionId = UUID.randomUUID().toString();
        }

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Message content cannot be blank"));
        }

        String userId = (user != null) ? user.getId() : null;

        Map<String, Object> chatResult = aiChatService.generateConciergeResponse(
                sessionId, message, userId, currentPage, activeVehicleId, activeBookingId
        );

        return ResponseEntity.ok(ApiResponse.success("AI dialogue complete", chatResult));
    }

    @PostMapping("/feedback")
    @Operation(summary = "Submit rating feedback for an assistant response")
    public ResponseEntity<ApiResponse<AIFeedback>> submitFeedback(
            @RequestBody Map<String, Object> body) {

        String sessionId = (String) body.get("sessionId");
        String messageId = (String) body.get("messageId");
        Boolean isPositive = (Boolean) body.get("isPositive");
        String feedbackText = (String) body.get("feedbackText");

        if (sessionId == null || messageId == null || isPositive == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("SessionId, MessageId, and isPositive are required"));
        }

        AIFeedback feedback = conversationService.saveFeedback(sessionId, messageId, isPositive, feedbackText);
        return ResponseEntity.ok(ApiResponse.success("Feedback registered successfully", feedback));
    }

    @GetMapping("/history")
    @Operation(summary = "Load message history thread for a chat session")
    public ResponseEntity<ApiResponse<List<AIChatMessage>>> getHistory(
            @RequestParam String sessionId) {
        List<AIChatMessage> history = conversationService.getChatHistory(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Chat history loaded", history));
    }

    @GetMapping("/preferences")
    @Operation(summary = "Retrieve AI user preferences configuration")
    public ResponseEntity<ApiResponse<AIUserPreference>> getPreferences(
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }
        AIUserPreference preference = conversationService.getUserPreferences(user.getId());
        return ResponseEntity.ok(ApiResponse.success("AI preferences loaded", preference));
    }

    @PostMapping("/preferences")
    @Operation(summary = "Configure preferred voice details, language, or vehicle types")
    public ResponseEntity<ApiResponse<AIUserPreference>> savePreferences(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication required"));
        }

        String language = (String) body.getOrDefault("preferredLanguage", "en");
        Boolean voiceEnabled = (Boolean) body.getOrDefault("voiceEnabled", false);
        String vehicleType = (String) body.get("preferredVehicleType");

        AIUserPreference saved = conversationService.saveUserPreferences(user.getId(), language, voiceEnabled, vehicleType);
        return ResponseEntity.ok(ApiResponse.success("AI preferences saved", saved));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Retrieve dashboard performance charts statistics (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> stats = conversationService.getAdminAIAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Admin AI stats loaded", stats));
    }
}
