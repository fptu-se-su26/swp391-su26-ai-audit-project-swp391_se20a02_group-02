# ADR-002: Event Bus — Redis Pub/Sub vs Apache Kafka

**Status:** Accepted  
**Date:** 2026-06-13  

---

## Addresses Reviewer Feedback

> "Introducing an event-driven layer (Kafka or RabbitMQ) could improve
> scalability and reduce coupling for anomaly detection, pricing updates,
> and operational monitoring."

---

## Context

Agents produce domain events (anomalies, pricing recommendations, churn alerts)
that Spring Boot must react to. Two message broker options were evaluated.

---

## Options Considered

| Criterion | Redis Pub/Sub | Apache Kafka |
|-----------|--------------|-------------|
| Infrastructure | Already in stack | New service required |
| Throughput | ~100K msg/s | ~1M msg/s |
| Persistence | No (at-most-once) | Yes (configurable retention) |
| Consumer Groups | No | Yes |
| Message Replay | No | Yes |
| Operational Complexity | Low | High |
| Setup Time | 0 days | 2–3 days |
| Target Load | 1000 req/min | 1000 req/min |

---

## Decision

**Phase 1 (Now): Redis Pub/Sub**  
**Phase 2 (>10K events/min): Migrate to Kafka via adapter swap**

### Justification

At 1000 req/min (17 req/s), Redis Pub/Sub handles the load comfortably.
Kafka is overkill until message volume requires replay, fan-out to 3+
consumers, or cross-datacenter replication.

The `EventBus` abstract interface in `event_bus.py` ensures the Kafka migration
is a single class swap with zero changes to agent or consumer code.

### Kafka Migration Path

```python
# Current (Redis):
event_bus = RedisEventBus(redis_url)

# Future (Kafka) — 1-line swap:
event_bus = KafkaEventBus(bootstrap_servers="kafka:9092")
```

### At-Least-Once Delivery (when needed)

Replace Redis Pub/Sub with **Redis Streams** (`XADD`/`XREAD`/`XACK`) for
at-least-once delivery guarantees without adding Kafka:

```python
# Upgrade path within Redis:
await redis.xadd("luxeway.events.anomaly_detected", {"data": payload})
```

---

## Consequences

**Positive:** Zero new infrastructure, 0-day setup, event-driven decoupling achieved.  
**Negative:** No message replay if consumer is offline during event publish.  
**Mitigation:** High-priority events (CRITICAL anomalies) are also written to
`FraudDetection` / `AgentExecutionLog` SQL tables as durable fallback.
