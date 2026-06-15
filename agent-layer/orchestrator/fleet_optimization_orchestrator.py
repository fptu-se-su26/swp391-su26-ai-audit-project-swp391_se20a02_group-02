"""
fleet_optimization_orchestrator.py — Hub-and-Spoke FleetOptimizationOrchestrator

Implements the central hub using LangGraph StateGraph.
Collects outputs from all 6 agents and synthesises a FleetActionPlan.
"""
from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Any, Literal, Optional

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from agents.health_agent import HealthAgent
from agents.anomaly_agent import AnomalyAgent
from agents.churn_agent import ChurnAgent
from agents.demand_agent import DemandAgent
from agents.revenue_agent import RevenueAgent
from agents.utilization_agent import UtilizationAgent
from connectors.ml_client import MLSidecarClient
from models.agent_schemas import (
    AgentName,
    AgentStatus,
    FleetActionPlan,
    FleetOrchestrationState,
    VehicleType,
    VehicleRelocation,
    PricingAction,
    ChurnCampaignAction,
    OrchestrateRequest,
    OrchestrateResponse,
)
from config import settings

logger = logging.getLogger("luxeway.orchestrator")


# ── LangGraph State ──────────────────────────────────────────────────────────
# LangGraph requires a TypedDict-compatible state; we use a plain dict here
# to stay Python 3.11 compatible without TypedDict import complexity.


class FleetOptimizationOrchestrator:
    """
    Central Hub — FleetOptimizationOrchestrator

    Hub-and-Spoke Pattern:
        - Hub: This orchestrator manages the execution graph
        - Spokes: 6 specialized agents (Health, Anomaly, Churn, Demand, Revenue, Utilization)

    LangGraph Nodes:
        initialize → [parallel: health, anomaly, demand] → [sequential: revenue, utilization, churn] → synthesise → [END | human_review]

    Checkpointing: MemorySaver (swap to RedisCheckpointer in production)
    Human-in-the-Loop: Activated when requires_human_review=True in state
    Error Recovery: Retry up to max_retries on recoverable failures
    """

    def __init__(self, ml_client: MLSidecarClient, backend_url: str) -> None:
        self._ml_client = ml_client
        self._backend_url = backend_url

        # Instantiate agents
        self._health_agent = HealthAgent(ml_client, backend_url)
        self._anomaly_agent = AnomalyAgent(ml_client)
        self._churn_agent = ChurnAgent(ml_client)
        self._demand_agent = DemandAgent(ml_client)
        self._revenue_agent = RevenueAgent(ml_client)
        self._utilization_agent = UtilizationAgent(ml_client)

        # LangGraph graph
        self._graph = self._build_graph()
        self._checkpointer = MemorySaver()

    # ── Graph Construction ────────────────────────────────────────────────────

    def _build_graph(self) -> Any:
        """
        Build the LangGraph StateGraph.

        Execution order:
        1. initialize    — validate inputs, set defaults
        2. health_check  — reactive health snapshot (parallel tier 1)
        3. anomaly_scan  — autonomous anomaly detection (parallel tier 1)
        4. demand_forecast — multi-agent demand (parallel tier 1)
        5. revenue_opt   — tool-using revenue optimization (sequential tier 2)
        6. util_predict  — reasoning utilization (sequential tier 2)
        7. churn_predict — reasoning churn (sequential tier 2)
        8. synthesise    — combine all outputs into FleetActionPlan
        9. human_review  — interrupt for approval (conditional)
        10. END
        """
        workflow = StateGraph(dict)  # state is a plain dict

        # Nodes
        workflow.add_node("initialize", self._node_initialize)
        workflow.add_node("health_check", self._node_health)
        workflow.add_node("anomaly_scan", self._node_anomaly)
        workflow.add_node("demand_forecast", self._node_demand)
        workflow.add_node("revenue_optimization", self._node_revenue)
        workflow.add_node("utilization_prediction", self._node_utilization)
        workflow.add_node("churn_prediction", self._node_churn)
        workflow.add_node("synthesise", self._node_synthesise)
        workflow.add_node("human_review", self._node_human_review)

        # Entry
        workflow.set_entry_point("initialize")

        # Edges: initialize → parallel tier 1
        workflow.add_edge("initialize", "health_check")
        workflow.add_edge("initialize", "anomaly_scan")
        workflow.add_edge("initialize", "demand_forecast")

        # Tier 1 → sequential tier 2
        workflow.add_edge("health_check", "revenue_optimization")
        workflow.add_edge("anomaly_scan", "revenue_optimization")
        workflow.add_edge("demand_forecast", "revenue_optimization")

        workflow.add_edge("revenue_optimization", "utilization_prediction")
        workflow.add_edge("utilization_prediction", "churn_prediction")
        workflow.add_edge("churn_prediction", "synthesise")

        # Conditional: synthesise → human_review OR END
        workflow.add_conditional_edges(
            "synthesise",
            self._route_after_synthesis,
            {
                "human_review": "human_review",
                "end": END,
            },
        )
        workflow.add_edge("human_review", END)

        return workflow.compile()

    # ── Routing Logic ─────────────────────────────────────────────────────────

    @staticmethod
    def _route_after_synthesis(state: dict[str, Any]) -> Literal["human_review", "end"]:
        """Route to human review if action plan requires approval."""
        if state.get("requires_human_review", False) and settings.ENABLE_HUMAN_IN_LOOP:
            return "human_review"
        return "end"

    # ── Node Implementations ──────────────────────────────────────────────────

    async def _node_initialize(self, state: dict[str, Any]) -> dict[str, Any]:
        """Validate inputs and set execution defaults."""
        logger.info("Orchestrator: initializing", extra={"run_id": state.get("run_id")})
        state["agent_statuses"] = {}
        state["agent_errors"] = {}
        state["initiated_at"] = datetime.utcnow().isoformat()
        return state

    async def _node_health(self, state: dict[str, Any]) -> dict[str, Any]:
        run_id = state.get("run_id", "unknown")
        output, log = await self._health_agent.execute(state, run_id)
        state.update(output)
        state["agent_statuses"][AgentName.HEALTH.value] = log.status.value
        if log.error_message:
            state["agent_errors"][AgentName.HEALTH.value] = log.error_message
        return state

    async def _node_anomaly(self, state: dict[str, Any]) -> dict[str, Any]:
        run_id = state.get("run_id", "unknown")
        output, log = await self._anomaly_agent.execute(state, run_id)
        state.update(output)
        state["agent_statuses"][AgentName.ANOMALY.value] = log.status.value
        if log.error_message:
            state["agent_errors"][AgentName.ANOMALY.value] = log.error_message
        return state

    async def _node_demand(self, state: dict[str, Any]) -> dict[str, Any]:
        run_id = state.get("run_id", "unknown")
        output, log = await self._demand_agent.execute(state, run_id)
        state.update(output)
        state["agent_statuses"][AgentName.DEMAND.value] = log.status.value
        if log.error_message:
            state["agent_errors"][AgentName.DEMAND.value] = log.error_message
        return state

    async def _node_revenue(self, state: dict[str, Any]) -> dict[str, Any]:
        run_id = state.get("run_id", "unknown")
        output, log = await self._revenue_agent.execute(state, run_id)
        state.update(output)
        state["agent_statuses"][AgentName.REVENUE.value] = log.status.value
        if log.error_message:
            state["agent_errors"][AgentName.REVENUE.value] = log.error_message
        return state

    async def _node_utilization(self, state: dict[str, Any]) -> dict[str, Any]:
        run_id = state.get("run_id", "unknown")
        output, log = await self._utilization_agent.execute(state, run_id)
        state.update(output)
        state["agent_statuses"][AgentName.UTILIZATION.value] = log.status.value
        if log.error_message:
            state["agent_errors"][AgentName.UTILIZATION.value] = log.error_message
        return state

    async def _node_churn(self, state: dict[str, Any]) -> dict[str, Any]:
        run_id = state.get("run_id", "unknown")
        output, log = await self._churn_agent.execute(state, run_id)
        state.update(output)
        state["agent_statuses"][AgentName.CHURN.value] = log.status.value
        if log.error_message:
            state["agent_errors"][AgentName.CHURN.value] = log.error_message
        return state

    async def _node_synthesise(self, state: dict[str, Any]) -> dict[str, Any]:
        """
        Synthesise all agent outputs into a FleetActionPlan.

        Synthesis Logic:
        1. Extract demand_increase_pct from DemandAgent
        2. Extract pricing_recommendations from RevenueAgent
        3. Extract rebalancing_recommendations from UtilizationAgent
        4. Extract campaign_recommendations from ChurnAgent
        5. Determine system health from HealthAgent
        6. Compute confidence score
        7. Build FleetActionPlan
        """
        logger.info("Orchestrator: synthesising action plan")

        demand_out = state.get("demand_output", {})
        revenue_out = state.get("revenue_output", {})
        util_out = state.get("utilization_output", {})
        churn_out = state.get("churn_output", {})
        health_out = state.get("health_output", {"status": "UNKNOWN"})
        anomaly_out = state.get("anomaly_output", {})

        # KPIs
        demand_increase = demand_out.get("demand_increase_pct", 0.0)
        pricing_recs = revenue_out.get("pricing_recommendations", [])
        price_increase = max((r.get("change_pct", 0) for r in pricing_recs), default=0.0)
        relocations_raw = util_out.get("rebalancing_recommendations", [])
        vehicles_to_relocate = sum(r.get("vehicles_to_move", 0) for r in relocations_raw)
        campaigns = churn_out.get("campaign_recommendations", [])
        vip_discount = any(c.get("campaign_type") == "VIP_DISCOUNT" for c in campaigns)

        # Primary vehicle type (highest demand recommendation)
        primary_vehicle = VehicleType.SUV  # default
        if pricing_recs:
            top_rec = max(pricing_recs, key=lambda r: r.get("change_pct", 0))
            try:
                primary_vehicle = VehicleType(top_rec.get("vehicle_type", "SUV"))
            except ValueError:
                primary_vehicle = VehicleType.SUV

        # Detailed actions
        relocations = [
            VehicleRelocation(
                vehicle_type=VehicleType.SEDAN,
                from_location=r.get("from_category", "UNKNOWN"),
                to_location=r.get("to_category", "UNKNOWN"),
                count=r.get("vehicles_to_move", 1),
                reason=r.get("reason", ""),
            )
            for r in relocations_raw
        ]

        pricing_actions = [
            PricingAction(
                vehicle_type=VehicleType(r.get("vehicle_type", "SEDAN")),
                current_price=r.get("current_price", 0.0),
                recommended_price=r.get("recommended_price", 0.0),
                change_pct=r.get("change_pct", 0.0),
                valid_until=r.get("valid_until", ""),
                rationale=r.get("rationale", ""),
            )
            for r in pricing_recs
            if r.get("vehicle_type") in {vt.value for vt in VehicleType}
        ]

        churn_campaigns = []
        for c in campaigns:
            churn_campaigns.append(
                ChurnCampaignAction(
                    customer_ids=[c.get("customer_id", "")],
                    campaign_type=c.get("campaign_type", "WINBACK_EMAIL"),
                    discount_pct=c.get("discount_pct", 0.0),
                    estimated_retention_rate=0.65,  # domain average
                )
            )

        # Confidence score: fraction of agents that succeeded
        total_agents = 6
        succeeded = sum(
            1 for s in state.get("agent_statuses", {}).values()
            if s == AgentStatus.SUCCESS.value
        )
        confidence = succeeded / total_agents

        # Human review trigger conditions
        requires_review = (
            price_increase > 20.0
            or anomaly_out.get("critical_count", 0) > 0
            or health_out.get("status") in {"DEGRADED", "DOWN"}
        )
        review_reason = None
        if requires_review:
            reasons = []
            if price_increase > 20.0:
                reasons.append(f"Price increase {price_increase:.1f}% exceeds 20% threshold")
            if anomaly_out.get("critical_count", 0) > 0:
                reasons.append(f"{anomaly_out['critical_count']} CRITICAL anomalies detected")
            if health_out.get("status") not in {"HEALTHY"}:
                reasons.append(f"System health: {health_out.get('status')}")
            review_reason = "; ".join(reasons)

        # Build synthesis reasoning
        synthesis = (
            f"Synthesised outputs from {succeeded}/{total_agents} agents. "
            f"Demand up {demand_increase:.1f}%. "
            f"Pricing: {len(pricing_actions)} recommendations (max +{price_increase:.1f}%). "
            f"Relocations: {vehicles_to_relocate} vehicles. "
            f"Churn: {len(campaigns)} campaigns. "
            f"System: {health_out.get('status', 'UNKNOWN')}. "
            f"Anomalies: {anomaly_out.get('total_anomalies', 0)} total, "
            f"{anomaly_out.get('critical_count', 0)} critical. "
            f"Confidence: {confidence:.0%}."
        )

        action_plan = FleetActionPlan(
            vehicle_type=primary_vehicle,
            expected_demand_increase=round(demand_increase, 2),
            recommended_price_increase=round(price_increase, 2),
            vehicles_to_relocate=vehicles_to_relocate,
            vip_discount=vip_discount,
            relocations=relocations,
            pricing_actions=pricing_actions,
            churn_campaigns=churn_campaigns,
            system_health=health_out.get("status", "UNKNOWN"),
            active_anomalies=anomaly_out.get("total_anomalies", 0),
            confidence_score=round(confidence, 2),
            requires_human_review=requires_review,
            review_reason=review_reason,
            synthesis_reasoning=synthesis,
            valid_until=(datetime.utcnow() + timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        )

        state["action_plan"] = action_plan.model_dump()
        state["synthesis_reasoning"] = synthesis
        state["requires_human_review"] = requires_review
        state["confidence_score"] = confidence

        logger.info("Orchestrator: synthesis complete", extra={"plan_id": action_plan.plan_id})
        return state

    async def _node_human_review(self, state: dict[str, Any]) -> dict[str, Any]:
        """Human-in-the-loop hook. In production, this persists state and waits for webhook."""
        logger.warning(
            "HUMAN REVIEW REQUIRED",
            extra={
                "reason": state.get("requires_human_review"),
                "run_id": state.get("run_id"),
            },
        )
        # In production: publish to review queue, block until approved
        state["agent_statuses"][AgentName.ORCHESTRATOR.value] = AgentStatus.HUMAN_REVIEW.value
        return state

    # ── Public API ────────────────────────────────────────────────────────────

    async def orchestrate(self, request: OrchestrateRequest) -> OrchestrateResponse:
        """
        Main entry point. Builds initial state and runs the LangGraph.

        Returns:
            OrchestrateResponse with FleetActionPlan and agent statuses.
        """
        import uuid
        run_id = str(uuid.uuid4())
        start_ns = time.perf_counter_ns()

        # Build initial state
        initial_state: dict[str, Any] = {
            "run_id": run_id,
            "correlation_id": request.correlation_id or run_id,
            "input_data": {
                "analytics_data": [d.model_dump() for d in request.analytics_data],
                "customers": request.customers,
                "vehicle_utilization": request.vehicle_utilization,
            },
            "vehicle_categories": request.vehicle_categories or ["SEDAN", "SUV", "TRUCK"],
            "analysis_horizon_days": request.horizon_days,
            "agent_statuses": {},
            "agent_errors": {},
        }

        try:
            config = {"configurable": {"thread_id": run_id}, "recursion_limit": settings.LANGGRAPH_RECURSION_LIMIT}
            final_state = await self._graph.ainvoke(initial_state, config=config)

            action_plan_dict = final_state.get("action_plan")
            action_plan = FleetActionPlan(**action_plan_dict) if action_plan_dict else None

            elapsed_ms = (time.perf_counter_ns() - start_ns) / 1_000_000

            return OrchestrateResponse(
                run_id=run_id,
                status=AgentStatus.SUCCESS,
                action_plan=action_plan,
                agent_statuses=final_state.get("agent_statuses", {}),
                errors=final_state.get("agent_errors", {}),
                execution_time_ms=round(elapsed_ms, 2),
            )

        except Exception as exc:
            logger.exception("Orchestration failed", extra={"run_id": run_id})
            elapsed_ms = (time.perf_counter_ns() - start_ns) / 1_000_000
            return OrchestrateResponse(
                run_id=run_id,
                status=AgentStatus.FAILED,
                action_plan=None,
                agent_statuses={},
                errors={"orchestrator": str(exc)},
                execution_time_ms=round(elapsed_ms, 2),
            )
