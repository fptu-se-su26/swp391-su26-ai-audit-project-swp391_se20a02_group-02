package com.luxeway.agent.controller;

import com.luxeway.agent.dto.AgentRequest;
import com.luxeway.agent.dto.AgentResponse;
import com.luxeway.agent.service.AgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * AgentController — REST API for the Agent Layer integration.
 *
 * Endpoints:
 *   POST /api/v1/agent/orchestrate  — Full fleet optimization orchestration
 *   POST /api/v1/agent/orchestrate/async — Non-blocking orchestration
 *   GET  /api/v1/agent/health       — Agent service health
 *
 * Security: JWT required (ROLE_ADMIN or ROLE_MANAGER for orchestration)
 * OpenAPI: annotated for Springdoc
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
@Tag(name = "Agent Layer", description = "Agentic AI orchestration for LuxeWay fleet optimization")
@SecurityRequirement(name = "bearerAuth")
public class AgentController {

    private final AgentService agentService;

    // ── Full Orchestration ─────────────────────────────────────────────────

    @PostMapping(
        value = "/orchestrate",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
        summary = "Run fleet optimization orchestration",
        description = "Triggers the FleetOptimizationOrchestrator. Runs all 6 agents "
            + "(Health, Anomaly, Churn, Demand, Revenue, Utilization) and returns a FleetActionPlan. "
            + "Requires ADMIN or MANAGER role. Response time: <2 seconds under normal load."
    )
    public ResponseEntity<AgentResponse> orchestrate(
            @Valid @RequestBody AgentRequest request
    ) {
        // Inject correlation ID for distributed tracing
        if (request.getCorrelationId() == null) {
            request.setCorrelationId(UUID.randomUUID().toString());
        }

        log.info("Orchestration requested, correlationId={}", request.getCorrelationId());
        AgentResponse response = agentService.orchestrate(request);

        return ResponseEntity.ok(response);
    }

    // ── Async Orchestration ──────────────────────────────────────────────────

    @PostMapping(
        value = "/orchestrate/async",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(
        summary = "Non-blocking fleet optimization orchestration",
        description = "Returns immediately with run_id. Poll /api/v1/agent/status/{runId} for results."
    )
    public Mono<ResponseEntity<AgentResponse>> orchestrateAsync(
            @Valid @RequestBody AgentRequest request
    ) {
        if (request.getCorrelationId() == null) {
            request.setCorrelationId(UUID.randomUUID().toString());
        }
        return agentService.orchestrateAsync(request)
                .map(ResponseEntity::ok);
    }

    // ── Health ────────────────────────────────────────────────────────────────

    @GetMapping("/health")
    @Operation(summary = "Check agent service health")
    public ResponseEntity<String> health() {
        String result = agentService.healthCheck();
        return ResponseEntity.ok(result);
    }
}
