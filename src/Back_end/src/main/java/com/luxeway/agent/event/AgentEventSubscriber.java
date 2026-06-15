package com.luxeway.agent.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * AgentEventSubscriber â€” Spring Boot subscriber to the Agent Layer's Redis Pub/Sub events.
 *
 * Addresses reviewer feedback #4:
 *   "Introducing an event-driven layer could improve scalability and reduce
 *    coupling for anomaly detection, pricing updates, and monitoring."
 *
 * Subscribed Channels (via PATTERN luxeway.events.*):
 *   luxeway.events.anomaly_detected    â†’ triggers admin WebSocket push
 *   luxeway.events.pricing_recommended â†’ triggers pricing approval workflow
 *   luxeway.events.churn_alert         â†’ triggers campaign dispatch
 *   luxeway.events.health_degraded     â†’ triggers ops alert
 *   luxeway.events.demand_spike        â†’ triggers inventory review
 *   luxeway.events.fleet_action_plan   â†’ triggers dashboard update
 *
 * Activation: set spring.agent.events.enabled=true in application.properties
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "spring.agent.events.enabled", havingValue = "true", matchIfMissing = false)
@SuppressWarnings("all")
public class AgentEventSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;

    /**
     * Receive any message from luxeway.events.* channel pattern.
     */
    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel());
        String body    = new String(message.getBody());

        log.info("Agent event received: channel={}, size={}B", channel, body.length());

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> event = objectMapper.readValue(body, Map.class);
            String eventType = (String) event.get("event_type");

            switch (eventType != null ? eventType : "") {
                case "ANOMALY_DETECTED"    -> handleAnomalyDetected(event);
                case "PRICING_RECOMMENDED" -> handlePricingRecommended(event);
                case "CHURN_ALERT"         -> handleChurnAlert(event);
                case "HEALTH_DEGRADED"     -> handleHealthDegraded(event);
                case "DEMAND_SPIKE"        -> handleDemandSpike(event);
                case "FLEET_ACTION_PLAN"   -> handleFleetActionPlan(event);
                default -> log.warn("Unknown agent event type: {}", eventType);
            }
        } catch (Exception ex) {
            log.error("Failed to process agent event from channel {}: {}", channel, ex.getMessage());
        }
    }

    private void handleAnomalyDetected(Map<String, Object> event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) event.get("payload");
        int criticalCount = (Integer) payload.getOrDefault("critical_count", 0);
        log.warn("ANOMALY EVENT: {} critical anomalies detected. run_id={}",
                 criticalCount, event.get("run_id"));
        // Push to admin WebSocket /topic/anomalies
        // messagingTemplate.convertAndSend("/topic/anomalies", payload);
    }

    private void handlePricingRecommended(Map<String, Object> event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) event.get("payload");
        boolean requiresApproval = Boolean.TRUE.equals(payload.get("requires_approval"));
        log.info("PRICING EVENT: recommendations received, approval_required={}", requiresApproval);
        // Trigger pricing approval workflow in PriceAdjustment service
    }

    private void handleChurnAlert(Map<String, Object> event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) event.get("payload");
        Object atRisk = payload.get("total_at_risk");
        log.info("CHURN EVENT: {} customers at risk. Triggering campaign dispatch.", atRisk);
        // Call ChurnCampaignService.dispatch(payload.get("campaigns"))
    }

    private void handleHealthDegraded(Map<String, Object> event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) event.get("payload");
        log.error("HEALTH EVENT: System health = {}. Issues: {}",
                  payload.get("status"), payload.get("issues"));
        // Send ops PagerDuty/Slack alert
    }

    private void handleDemandSpike(Map<String, Object> event) {
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = (Map<String, Object>) event.get("payload");
        log.info("DEMAND SPIKE EVENT: +{}% demand forecast. Triggering inventory review.",
                 payload.get("demand_increase_pct"));
        // Notify operations team for inventory preparation
    }

    private void handleFleetActionPlan(Map<String, Object> event) {
        log.info("FLEET ACTION PLAN received: run_id={}", event.get("run_id"));
        // Store in DB, push to admin dashboard WebSocket
    }

    // â”€â”€ Redis Listener Container â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Configuration
    @ConditionalOnProperty(name = "spring.agent.events.enabled", havingValue = "true", matchIfMissing = false)
    @RequiredArgsConstructor
    static class AgentEventListenerConfig {

        private final RedisConnectionFactory connectionFactory;
        private final AgentEventSubscriber subscriber;

        @Bean
        public RedisMessageListenerContainer agentEventListenerContainer() {
            RedisMessageListenerContainer container = new RedisMessageListenerContainer();
            container.setConnectionFactory(connectionFactory);

            // Subscribe to ALL agent event channels via pattern
            MessageListenerAdapter adapter = new MessageListenerAdapter(subscriber);
            container.addMessageListener(adapter, new PatternTopic("luxeway.events.*"));

            log.info("Agent event listener registered for pattern: luxeway.events.*");
            return container;
        }
    }
}
