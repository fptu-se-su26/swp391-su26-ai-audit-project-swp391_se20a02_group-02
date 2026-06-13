package com.luxeway.agent.service;

import com.luxeway.agent.client.AgentLayerClient;
import com.luxeway.agent.dto.AgentRequest;
import com.luxeway.agent.dto.AgentResponse;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * AgentServiceImpl — implementation with Resilience4j circuit breaker, retry, and rate limiter.
 *
 * Circuit Breaker: "agentService"
 *   - Failure threshold: 50%
 *   - Wait duration in OPEN state: 10 seconds
 *   - Fallback: return degraded response
 *
 * Rate Limiter: "agentService"
 *   - 1000 req/min (16.6 req/s)
 *
 * Retry: 2 attempts with 500ms wait
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentServiceImpl implements AgentService {

    private final AgentLayerClient agentLayerClient;

    // ── Synchronous orchestration (blocking) ─────────────────────────────────

    @Override
    @CircuitBreaker(name = "agentService", fallbackMethod = "orchestrateFallback")
    @RateLimiter(name = "agentService")
    @Retry(name = "agentService")
    public AgentResponse orchestrate(AgentRequest request) {
        log.info("Triggering agent orchestration, correlationId={}", request.getCorrelationId());
        return agentLayerClient.orchestrate(request)
                .block(Duration.ofSeconds(35));
    }

    // ── Async reactive orchestration ─────────────────────────────────────────

    @Override
    @CircuitBreaker(name = "agentService", fallbackMethod = "orchestrateAsyncFallback")
    @RateLimiter(name = "agentService")
    public Mono<AgentResponse> orchestrateAsync(AgentRequest request) {
        log.info("Async agent orchestration started, correlationId={}", request.getCorrelationId());
        return agentLayerClient.orchestrate(request);
    }

    // ── Health ────────────────────────────────────────────────────────────────

    @Override
    public String healthCheck() {
        return agentLayerClient.healthCheck().block(Duration.ofSeconds(5));
    }

    // ── Fallback methods ─────────────────────────────────────────────────────

    /**
     * Circuit breaker fallback — returns a degraded response to prevent cascade failure.
     */
    public AgentResponse orchestrateFallback(AgentRequest request, Exception ex) {
        log.error("Agent service circuit breaker OPEN, returning fallback. Error: {}", ex.getMessage());
        return AgentResponse.builder()
                .runId(UUID.randomUUID().toString())
                .status("DEGRADED")
                .agentStatuses(Map.of("orchestrator", "CIRCUIT_BREAKER_OPEN"))
                .errors(Map.of("orchestrator", "Service temporarily unavailable: " + ex.getMessage()))
                .executionTimeMs(0.0)
                .build();
    }

    public Mono<AgentResponse> orchestrateAsyncFallback(AgentRequest request, Exception ex) {
        log.error("Async agent circuit breaker OPEN: {}", ex.getMessage());
        return Mono.just(AgentResponse.builder()
                .runId(UUID.randomUUID().toString())
                .status("DEGRADED")
                .errors(Map.of("orchestrator", ex.getMessage()))
                .build());
    }
}
