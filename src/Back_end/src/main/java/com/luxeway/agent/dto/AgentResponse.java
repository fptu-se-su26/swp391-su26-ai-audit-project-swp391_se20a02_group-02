package com.luxeway.agent.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * AgentResponse — received from the Agent Layer after orchestration.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentResponse {

    @JsonProperty("run_id")
    private String runId;

    private String status; // SUCCESS | FAILED | HUMAN_REVIEW

    @JsonProperty("action_plan")
    private FleetActionPlan actionPlan;

    @JsonProperty("agent_statuses")
    private Map<String, String> agentStatuses;

    private Map<String, String> errors;

    @JsonProperty("execution_time_ms")
    private Double executionTimeMs;
}
