package com.luxeway.agent.client;

import com.luxeway.agent.dto.AgentRequest;
import com.luxeway.agent.dto.AgentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * AgentLayerClient — WebClient integration for Spring Boot → Agent Layer.
 *
 * Features:
 * - Reactive WebClient (non-blocking)
 * - JWT propagation via X-Agent-API-Key header
 * - Timeout: 30 seconds (matches orchestrator budget)
 * - Error mapping to domain exceptions
 */
@Component
@SuppressWarnings("all")
public class AgentLayerClient {

    private final WebClient webClient;

    public AgentLayerClient(
            WebClient.Builder builder,
            @Value("${agent.service.url:http://localhost:8001}") String agentServiceUrl,
            @Value("${agent.api.key:agent-internal-key-change-me}") String agentApiKey
    ) {
        this.webClient = builder
                .baseUrl(agentServiceUrl)
                .defaultHeader("X-Agent-API-Key", agentApiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * Trigger full fleet optimization orchestration.
     */
    public Mono<AgentResponse> orchestrate(AgentRequest request) {
        return webClient.post()
                .uri("/api/v1/orchestrate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AgentResponse.class)
                .timeout(Duration.ofSeconds(30))
                .onErrorMap(WebClientResponseException.class, ex ->
                        new AgentServiceException("Agent orchestration failed: " + ex.getMessage(), ex)
                )
                .onErrorMap(Exception.class, ex ->
                        new AgentServiceException("Agent service unreachable: " + ex.getMessage(), ex)
                );
    }

    /**
     * Health check against agent service.
     */
    public Mono<String> healthCheck() {
        return webClient.get()
                .uri("/health")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(5));
    }

    /**
     * Run standalone anomaly agent.
     */
    public Mono<Object> runAnomalyAgent(Object requestBody) {
        return webClient.post()
                .uri("/api/v1/agent/anomaly")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Object.class)
                .timeout(Duration.ofSeconds(10));
    }

    /**
     * Run standalone churn agent.
     */
    public Mono<Object> runChurnAgent(Object requestBody) {
        return webClient.post()
                .uri("/api/v1/agent/churn")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Object.class)
                .timeout(Duration.ofSeconds(10));
    }

    // ── Domain Exception ──────────────────────────────────────────────────────

    public static class AgentServiceException extends RuntimeException {
        public AgentServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
