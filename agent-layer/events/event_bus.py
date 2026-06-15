"""
event_bus.py — Lightweight Event Bus using Redis Pub/Sub

Addresses reviewer feedback #4:
  "Introducing an event-driven layer could improve scalability and reduce
   coupling for anomaly detection, pricing updates, and monitoring."

Design:
  - Redis Pub/Sub for <1s event delivery (already in stack)
  - Channel per event type: luxeway.events.{EVENT_TYPE}
  - Adapter interface allows swapping to Kafka without changing agent code
  - Spring Boot subscribes via AgentEventSubscriber (WebSocket or Feign polling)

  Kafka migration path:
    1. Replace RedisEventBus with KafkaEventBus (same interface)
    2. No changes to agents or consumers required

Channel naming convention:
  luxeway.events.anomaly_detected
  luxeway.events.pricing_recommended
  luxeway.events.churn_alert
  luxeway.events.health_degraded
  luxeway.events.demand_spike
  luxeway.events.fleet_action_plan
"""
from __future__ import annotations

import abc
import json
import logging
from typing import Any, Callable, Optional

from events.event_schemas import DomainEvent, EventType

logger = logging.getLogger("luxeway.events.event_bus")

CHANNEL_PREFIX = "luxeway.events."


def _channel_for(event_type: EventType) -> str:
    return f"{CHANNEL_PREFIX}{event_type.value.lower()}"


# ── Abstract interface (enables Kafka swap) ────────────────────────────────────

class EventBus(abc.ABC):
    """Abstract event bus. Swap implementation for Kafka without touching agents."""

    @abc.abstractmethod
    async def publish(self, event: DomainEvent) -> None:
        ...

    @abc.abstractmethod
    async def subscribe(
        self,
        event_type: EventType,
        handler: Callable[[DomainEvent], Any],
    ) -> None:
        ...


# ── Redis Pub/Sub Implementation ──────────────────────────────────────────────

class RedisEventBus(EventBus):
    """
    Redis Pub/Sub event bus.

    Publish: agent publishes JSON event → Redis channel
    Subscribe: consumer subscribes to channel → handler invoked on message

    Guarantees: at-most-once delivery (Redis Pub/Sub).
    For at-least-once: use Redis Streams (XADD/XREAD). See ADR-002.
    """

    def __init__(self, redis_url: str = "redis://localhost:6379/1") -> None:
        self._redis_url = redis_url
        self._redis: Optional[Any] = None
        self._available = False
        self._try_connect()

    def _try_connect(self) -> None:
        try:
            import redis.asyncio as aioredis  # type: ignore
            self._redis = aioredis.from_url(self._redis_url, decode_responses=True)
            self._available = True
            logger.info(f"RedisEventBus connected: {self._redis_url}")
        except ImportError:
            logger.warning("redis package not installed — EventBus in no-op mode")
            self._available = False
        except Exception as exc:
            logger.warning(f"Redis connection failed: {exc} — EventBus in no-op mode")
            self._available = False

    async def publish(self, event: DomainEvent) -> None:
        """
        Publish a domain event to its Redis channel.

        Channel: luxeway.events.{event_type}
        Message: JSON-serialised DomainEvent
        """
        if not self._available or self._redis is None:
            logger.debug(f"EventBus no-op: would publish {event.event_type} event_id={event.event_id}")
            return

        channel = _channel_for(event.event_type)
        payload = event.model_dump_json()

        try:
            subscribers = await self._redis.publish(channel, payload)
            logger.info(
                f"Event published",
                extra={
                    "event_type": event.event_type,
                    "event_id": event.event_id,
                    "channel": channel,
                    "subscribers": subscribers,
                    "priority": event.priority,
                },
            )
        except Exception as exc:
            logger.error(f"Failed to publish event {event.event_id}: {exc}")

    async def subscribe(
        self,
        event_type: EventType,
        handler: Callable[[DomainEvent], Any],
    ) -> None:
        """Subscribe to a channel and invoke handler on each message."""
        if not self._available or self._redis is None:
            logger.warning(f"EventBus unavailable — subscription to {event_type} skipped")
            return

        channel = _channel_for(event_type)
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(channel)

        logger.info(f"Subscribed to channel: {channel}")
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    event_data = json.loads(message["data"])
                    event = DomainEvent(**event_data)
                    await handler(event)
                except Exception as exc:
                    logger.error(f"Handler error for {event_type}: {exc}")

    async def close(self) -> None:
        if self._redis:
            await self._redis.aclose()


# ── In-Memory Fallback (for tests / no-Redis mode) ───────────────────────────

class InMemoryEventBus(EventBus):
    """
    In-memory event bus for unit testing and environments without Redis.
    Synchronous, no persistence — events are lost on process restart.
    """

    def __init__(self) -> None:
        self._published: list[DomainEvent] = []
        self._handlers: dict[EventType, list[Callable]] = {}

    async def publish(self, event: DomainEvent) -> None:
        self._published.append(event)
        logger.debug(f"InMemoryEventBus: published {event.event_type} (id={event.event_id})")
        for handler in self._handlers.get(event.event_type, []):
            try:
                await handler(event)
            except Exception as exc:
                logger.error(f"Handler error: {exc}")

    async def subscribe(
        self,
        event_type: EventType,
        handler: Callable[[DomainEvent], Any],
    ) -> None:
        self._handlers.setdefault(event_type, []).append(handler)

    def get_published(self, event_type: Optional[EventType] = None) -> list[DomainEvent]:
        if event_type:
            return [e for e in self._published if e.event_type == event_type]
        return list(self._published)

    def clear(self) -> None:
        self._published.clear()


# ── Module singleton ──────────────────────────────────────────────────────────

def create_event_bus() -> EventBus:
    """Factory: returns Redis bus in production, in-memory for tests."""
    import os
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/1")
    environment = os.getenv("ENVIRONMENT", "development")

    if environment == "test":
        return InMemoryEventBus()
    return RedisEventBus(redis_url)


event_bus: EventBus = create_event_bus()
