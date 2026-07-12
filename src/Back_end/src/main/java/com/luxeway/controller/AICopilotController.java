package com.luxeway.controller;

import com.luxeway.agent.client.AgentLayerClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Controller for the AI Copilot conversational interface.
 * Routes natural language prompts to the Python Agent Layer.
 */
@Slf4j
@RestController
@RequestMapping("/admin/copilot")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@RequiredArgsConstructor
public class AICopilotController {

    private final AgentLayerClient agentLayerClient;

    /**
     * DTO for Copilot Request from the frontend.
     */
    public static class CopilotChatRequest {
        public String prompt;
        public Map<String, Object> context;
    }

    @PostMapping("/chat")
    public ResponseEntity<Object> chatWithCopilot(@RequestBody CopilotChatRequest request, Authentication auth) {
        String adminId = auth != null ? auth.getName() : "unknown-admin";
        
        Map<String, Object> agentPayload = Map.of(
            "prompt", request.prompt != null ? request.prompt : "",
            "context", request.context != null ? request.context : Map.of(),
            "admin_id", adminId
        );
        
        try {
            Object response = agentLayerClient.runCopilotAgent(agentPayload).block();
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Failed to communicate with Copilot Agent", ex);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Copilot service is currently unavailable.",
                "detail", ex.getMessage()
            ));
        }
    }
}
