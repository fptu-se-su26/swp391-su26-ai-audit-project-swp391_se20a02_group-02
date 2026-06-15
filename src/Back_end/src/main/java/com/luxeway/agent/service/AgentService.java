package com.luxeway.agent.service;

import com.luxeway.agent.dto.AgentRequest;
import com.luxeway.agent.dto.AgentResponse;
import reactor.core.publisher.Mono;

/**
 * AgentService — service contract for agent layer integration.
 */
public interface AgentService {

    /**
     * Run the full FleetOptimizationOrchestrator and return an action plan.
     */
    AgentResponse orchestrate(AgentRequest request);

    /**
     * Async orchestration returning a reactive Mono.
     */
    Mono<AgentResponse> orchestrateAsync(AgentRequest request);

    /**
     * Check agent service health.
     */
    String healthCheck();
}
