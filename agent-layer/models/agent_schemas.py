"""
agent_schemas.py — Pydantic v2 schemas for the LuxeWay Agent Layer
"""
from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ── Enumerations ──────────────────────────────────────────────────────────────

class AgentName(str, Enum):
    HEALTH = "HealthAgent"
    ANOMALY = "AnomalyAgent"
    CHURN = "ChurnAgent"
    DEMAND = "DemandAgent"
    REVENUE = "RevenueAgent"
    UTILIZATION = "UtilizationAgent"
    ORCHESTRATOR = "FleetOptimizationOrchestrator"


class AgentStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    HUMAN_REVIEW = "HUMAN_REVIEW"


class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class VehicleType(str, Enum):
    SEDAN = "SEDAN"
    SUV = "SUV"
    TRUCK = "TRUCK"
    VAN = "VAN"
    LUXURY = "LUXURY"
    ECONOMY = "ECONOMY"


# ── Agent Message ─────────────────────────────────────────────────────────────

class AgentMessage(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_agent: AgentName
    target_agent: Optional[AgentName] = None
    content: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))


# ── LangGraph State ───────────────────────────────────────────────────────────

class FleetOrchestrationState(BaseModel):
    """
    Shared state flowing through the LangGraph execution DAG.
    Each agent reads from this and writes its output slice back.
    """
    # Execution metadata
    run_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    initiated_at: datetime = Field(default_factory=datetime.utcnow)
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # Input context (populated by trigger)
    input_data: dict[str, Any] = Field(default_factory=dict)
    vehicle_categories: list[str] = Field(default_factory=list)
    analysis_horizon_days: int = 30

    # Per-agent outputs
    health_output: Optional[dict[str, Any]] = None
    anomaly_output: Optional[dict[str, Any]] = None
    churn_output: Optional[dict[str, Any]] = None
    demand_output: Optional[dict[str, Any]] = None
    revenue_output: Optional[dict[str, Any]] = None
    utilization_output: Optional[dict[str, Any]] = None

    # Agent statuses
    agent_statuses: dict[str, AgentStatus] = Field(default_factory=dict)
    agent_errors: dict[str, str] = Field(default_factory=dict)

    # Orchestrator synthesis
    action_plan: Optional["FleetActionPlan"] = None
    synthesis_reasoning: Optional[str] = None

    # Control flags
    requires_human_review: bool = False
    human_review_reason: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3


# ── Individual Agent Request/Response ─────────────────────────────────────────

class AnalyticsDataPoint(BaseModel):
    date: str
    revenue: float
    bookings_count: int


class HealthAgentRequest(BaseModel):
    check_ml_endpoints: bool = True
    check_database: bool = True
    check_backend: bool = True


class HealthAgentResponse(BaseModel):
    status: str  # "HEALTHY" | "DEGRADED" | "DOWN"
    ml_service_ok: bool
    backend_ok: bool
    latency_ms: float
    issues: list[str] = Field(default_factory=list)


class AnomalyAgentRequest(BaseModel):
    data: list[AnalyticsDataPoint]
    auto_alert: bool = True
    notify_threshold: SeverityLevel = SeverityLevel.HIGH


class AnomalyAgentResponse(BaseModel):
    anomalies: list[dict[str, Any]]
    total_anomalies: int
    critical_count: int
    warning_count: int
    alerts_sent: list[str] = Field(default_factory=list)
    reasoning: Optional[str] = None


class ChurnAgentRequest(BaseModel):
    customers: list[dict[str, Any]]
    platform_avg_frequency: float
    platform_avg_spend: float
    generate_campaigns: bool = True


class ChurnAgentResponse(BaseModel):
    at_risk_customers: list[dict[str, Any]]
    campaign_recommendations: list[dict[str, Any]]
    reasoning_chain: list[str] = Field(default_factory=list)
    total_at_risk: int
    estimated_revenue_at_risk: float


class DemandAgentRequest(BaseModel):
    data: list[AnalyticsDataPoint]
    horizon: int = 30
    include_external_signals: bool = True


class DemandAgentResponse(BaseModel):
    daily_forecasts: list[dict[str, Any]]
    peak_day: str
    avg_daily_demand: float
    demand_increase_pct: float
    recommended_inventory: dict[str, int] = Field(default_factory=dict)
    sub_agent_outputs: list[dict[str, Any]] = Field(default_factory=list)


class RevenueAgentRequest(BaseModel):
    data: list[AnalyticsDataPoint]
    horizon: int = 30
    vehicle_categories: list[str] = Field(default_factory=list)
    auto_apply_pricing: bool = False


class RevenueAgentResponse(BaseModel):
    forecast: dict[str, Any]
    pricing_recommendations: list[dict[str, Any]]
    tools_used: list[str] = Field(default_factory=list)
    tool_results: dict[str, Any] = Field(default_factory=dict)
    requires_approval: bool = True


class UtilizationAgentRequest(BaseModel):
    by_category: dict[str, list[float]]
    forecast_days: int = 30
    trigger_rebalancing: bool = True


class UtilizationAgentResponse(BaseModel):
    by_category: dict[str, list[dict[str, Any]]]
    current_rates: dict[str, float]
    lowest_category: str
    highest_category: str
    rebalancing_recommendations: list[dict[str, Any]]
    reasoning_chain: list[str] = Field(default_factory=list)


# ── Fleet Action Plan (Orchestrator Output) ───────────────────────────────────

class VehicleRelocation(BaseModel):
    vehicle_type: VehicleType
    from_location: str
    to_location: str
    count: int
    reason: str


class PricingAction(BaseModel):
    vehicle_type: VehicleType
    current_price: float
    recommended_price: float
    change_pct: float
    valid_until: str
    rationale: str


class ChurnCampaignAction(BaseModel):
    customer_ids: list[str]
    campaign_type: str  # "VIP_DISCOUNT" | "LOYALTY_POINTS" | "PERSONAL_OUTREACH"
    discount_pct: float
    estimated_retention_rate: float


class FleetActionPlan(BaseModel):
    """
    The final output of FleetOptimizationOrchestrator.
    Consumed by Spring Boot and surfaced to the admin dashboard.
    """
    plan_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    valid_until: Optional[str] = None

    # High-level KPIs
    vehicle_type: VehicleType = VehicleType.SUV
    expected_demand_increase: float = 0.0       # percentage
    recommended_price_increase: float = 0.0     # percentage
    vehicles_to_relocate: int = 0
    vip_discount: bool = False

    # Detailed sub-plans
    relocations: list[VehicleRelocation] = Field(default_factory=list)
    pricing_actions: list[PricingAction] = Field(default_factory=list)
    churn_campaigns: list[ChurnCampaignAction] = Field(default_factory=list)

    # Health & anomaly alerts
    system_health: str = "HEALTHY"
    active_anomalies: int = 0

    # Metadata
    confidence_score: float = 0.0  # 0.0–1.0
    requires_human_review: bool = False
    review_reason: Optional[str] = None
    synthesis_reasoning: str = ""

    class Config:
        json_schema_extra = {
            "example": {
                "vehicleType": "SUV",
                "expectedDemandIncrease": 25,
                "recommendedPriceIncrease": 15,
                "vehiclesToRelocate": 12,
                "vipDiscount": True,
            }
        }


# ── API Request/Response Wrappers ─────────────────────────────────────────────

class OrchestrateRequest(BaseModel):
    analytics_data: list[AnalyticsDataPoint]
    customers: list[dict[str, Any]] = Field(default_factory=list)
    vehicle_utilization: dict[str, list[float]] = Field(default_factory=dict)
    vehicle_categories: list[str] = Field(default_factory=list)
    horizon_days: int = 30
    correlation_id: Optional[str] = None


class OrchestrateResponse(BaseModel):
    run_id: str
    status: AgentStatus
    action_plan: Optional[FleetActionPlan] = None
    agent_statuses: dict[str, str] = Field(default_factory=dict)
    errors: dict[str, str] = Field(default_factory=dict)
    execution_time_ms: float = 0.0


class AgentExecutionLog(BaseModel):
    log_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_id: str
    agent_name: AgentName
    status: AgentStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_ms: Optional[float] = None
    input_tokens: int = 0
    output_tokens: int = 0
    error_message: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)
