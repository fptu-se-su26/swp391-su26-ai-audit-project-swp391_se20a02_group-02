"""
analytics_agent.py — Analytics Agent for LuxeWay
"""
from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from connectors.ml_client import MLSidecarClient
from models.agent_schemas import AgentName

class AnalyticsAgent(BaseAgent):
    """
    ANALYTICS AGENT
    Responsibility: Query KPIs, trends, and generate executive summaries.
    """

    agent_name = AgentName.ANALYTICS

    def __init__(self, ml_client: MLSidecarClient, backend_url: str) -> None:
        super().__init__()
        self._ml_client = ml_client
        self._backend_url = backend_url

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        """
        Example Input State:
            {
                "query": "Why did revenue drop this week?",
                "timeframe": "this_week",
                "focus_area": "revenue"
            }
        """
        query = state.get("query", "")
        
        # Here we would normally use tools to query the backend or database
        # For Phase 1 & 2 MVP, we simulate the analytics retrieval.
        
        summary = "Based on recent metrics, revenue dropped by 15% this week. This is primarily correlated with a 22% decline in SUV bookings in Da Nang."
        metrics = {
            "revenue_change_pct": -15.0,
            "suv_booking_change_pct": -22.0,
            "affected_region": "Da Nang"
        }
        insights = [
            "SUV demand in Da Nang has seasonal dips during this period.",
            "Consider lowering SUV prices by 10% in Da Nang next week to stimulate demand."
        ]
        
        self.logger.info("Analytics Agent processed query", extra={"query": query})
        
        return {
            "summary": summary,
            "metrics": metrics,
            "insights": insights
        }
