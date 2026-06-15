"""
event_schemas.py — Domain Event Schemas for the Event-Driven Layer

Addresses reviewer feedback #4:
  "The architecture is predominantly request/response driven. Introducing
   an event-driven layer (Kafka or RabbitMQ) could improve scalability
   and reduce coupling for anomaly detection, pricing updates, and
   operational monitoring."

Design Decision:
  Selected Redis Pub/Sub (already in the stack) as the event bus.
  This avoids introducing Kafka complexity for the current load profile
  (1000 req/min), while providing a clean adapter interface that can be
  swapped to Kafka with a single implementation change.

  See ADR-002 for the Redis vs Kafka trade-off analysis.

Event Categories:
  ANOMALY_DETECTED    — Published by AnomalyAgent, consumed by Spring Boot
  PRICING_RECOMMENDED — Published by RevenueAgent, consumed by Spring Boot
  CHURN_ALERT         — Published by ChurnAgent, consumed by Spring Boot
  HEALTH_DEGRADED     — Published by HealthAgent, consumed by monitoring
  DEMAND_SPIKE        — Published by DemandAgent when demand > 20%
  FLEET_ACTION_PLAN   — Published by Orchestrator on completion
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional
import uuid

from pydantic import BaseModel, Field


class EventType(str, Enum):
    ANOMALY_DETECTED    = "ANOMALY_DETECTED"
    PRICING_RECOMMENDED = "PRICING_RECOMMENDED"
    CHURN_ALERT         = "CHURN_ALERT"
    HEALTH_DEGRADED     = "HEALTH_DEGRADED"
    DEMAND_SPIKE        = "DEMAND_SPIKE"
    FLEET_ACTION_PLAN   = "FLEET_ACTION_PLAN"
    AGENT_FAILED        = "AGENT_FAILED"


class EventPriority(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH     = "HIGH"
    NORMAL   = "NORMAL"
    LOW      = "LOW"


class DomainEvent(BaseModel):
    """Base class for all domain events."""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: EventType
    priority: EventPriority = EventPriority.NORMAL
    source_agent: str
    run_id: Optional[str] = None
    correlation_id: Optional[str] = None
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    payload: dict[str, Any] = Field(default_factory=dict)
    schema_version: str = "1.0"


class AnomalyDetectedEvent(DomainEvent):
    """Published when AnomalyAgent detects anomalies."""
    event_type: EventType = EventType.ANOMALY_DETECTED

    @classmethod
    def from_anomaly_output(cls, output: dict, run_id: str) -> "AnomalyDetectedEvent":
        critical = output.get("critical_count", 0)
        return cls(
            source_agent="AnomalyAgent",
            run_id=run_id,
            priority=EventPriority.CRITICAL if critical > 0 else EventPriority.HIGH,
            payload={
                "total_anomalies": output.get("total_anomalies", 0),
                "critical_count": critical,
                "warning_count": output.get("warning_count", 0),
                "anomalies": output.get("anomalies", [])[:5],  # top 5
                "reasoning": output.get("reasoning"),
            },
        )


class PricingRecommendedEvent(DomainEvent):
    """Published when RevenueAgent recommends pricing changes."""
    event_type: EventType = EventType.PRICING_RECOMMENDED

    @classmethod
    def from_revenue_output(cls, output: dict, run_id: str) -> "PricingRecommendedEvent":
        recs = output.get("pricing_recommendations", [])
        max_change = max((r.get("change_pct", 0) for r in recs), default=0)
        return cls(
            source_agent="RevenueAgent",
            run_id=run_id,
            priority=EventPriority.HIGH if max_change > 10 else EventPriority.NORMAL,
            payload={
                "recommendations": recs,
                "requires_approval": output.get("requires_approval", True),
                "tools_used": output.get("tools_used", []),
            },
        )


class ChurnAlertEvent(DomainEvent):
    """Published when ChurnAgent identifies critical at-risk customers."""
    event_type: EventType = EventType.CHURN_ALERT

    @classmethod
    def from_churn_output(cls, output: dict, run_id: str) -> "ChurnAlertEvent":
        at_risk = output.get("at_risk_customers", [])
        critical = [c for c in at_risk if c.get("risk_level") == "CRITICAL"]
        return cls(
            source_agent="ChurnAgent",
            run_id=run_id,
            priority=EventPriority.HIGH if critical else EventPriority.NORMAL,
            payload={
                "total_at_risk": output.get("total_at_risk", 0),
                "critical_customers": len(critical),
                "estimated_revenue_at_risk": output.get("estimated_revenue_at_risk", 0),
                "campaigns": output.get("campaign_recommendations", [])[:10],
            },
        )


class HealthDegradedEvent(DomainEvent):
    """Published when system health is not HEALTHY."""
    event_type: EventType = EventType.HEALTH_DEGRADED

    @classmethod
    def from_health_output(cls, output: dict, run_id: str) -> "HealthDegradedEvent":
        status = output.get("status", "UNKNOWN")
        return cls(
            source_agent="HealthAgent",
            run_id=run_id,
            priority=EventPriority.CRITICAL if status == "DOWN" else EventPriority.HIGH,
            payload=output,
        )


class DemandSpikeEvent(DomainEvent):
    """Published when DemandAgent forecasts significant demand increase."""
    event_type: EventType = EventType.DEMAND_SPIKE

    @classmethod
    def from_demand_output(cls, output: dict, run_id: str, threshold: float = 20.0) -> Optional["DemandSpikeEvent"]:
        demand_pct = output.get("demand_increase_pct", 0.0)
        if demand_pct < threshold:
            return None  # Not a spike
        return cls(
            source_agent="DemandAgent",
            run_id=run_id,
            priority=EventPriority.HIGH,
            payload={
                "demand_increase_pct": demand_pct,
                "ml_base_pct": output.get("ml_base_demand_pct", demand_pct),
                "external_adjustment_pct": output.get("external_signal_adjustment_pct", 0.0),
                "recommended_inventory": output.get("recommended_inventory", {}),
                "peak_day": output.get("peak_day"),
            },
        )


class FleetActionPlanEvent(DomainEvent):
    """Published when Orchestrator produces a complete action plan."""
    event_type: EventType = EventType.FLEET_ACTION_PLAN

    @classmethod
    def from_action_plan(cls, plan: dict, run_id: str) -> "FleetActionPlanEvent":
        return cls(
            source_agent="FleetOptimizationOrchestrator",
            run_id=run_id,
            priority=EventPriority.CRITICAL if plan.get("requires_human_review") else EventPriority.NORMAL,
            payload=plan,
        )
