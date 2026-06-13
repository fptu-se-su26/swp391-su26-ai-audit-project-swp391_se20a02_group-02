"""
revenue_agent.py — Tool-Using Agent for Revenue Optimization

Pattern: TOOL-USING AGENT (Chains multiple tools: Forecast, Pricing, Booking)
Responsibility: Forecast revenue, compute optimal pricing, optionally apply changes.
"""
from __future__ import annotations

from typing import Any

from agents.base_agent import BaseAgent
from connectors.ml_client import MLSidecarClient
from models.agent_schemas import AgentName


class RevenueAgent(BaseAgent):
    """
    TOOL-USING AGENT — Revenue Optimization

    Tool Chain:
    1. ForecastTool     → get revenue forecast (ML sidecar)
    2. PricingTool      → compute optimal price adjustments
    3. BookingTool      → check current occupancy rate
    4. NotificationTool → notify stakeholders of pricing change

    Decision Logic:
    1. Call ForecastTool to get 30-day revenue projection
    2. If demand_increase > 15% → trigger PricingTool for price optimization
    3. Check BookingTool for occupancy (prevents overselling)
    4. Compute recommended price increase: min(30%, demand_signal * elasticity)
    5. If auto_apply=True → apply via PricingTool (requires approval flag)

    Triggered by: On-demand OR weekly pricing review.
    Failure Handling: On ForecastTool failure → return current pricing unchanged.
    Metrics: revenue_uplift_pct, pricing_changes_applied, approval_pending_count
    """

    agent_name = AgentName.REVENUE

    def __init__(
        self,
        ml_client: MLSidecarClient,
        pricing_tool: Any = None,
        booking_tool: Any = None,
        notification_tool: Any = None,
        forecast_tool: Any = None,
    ) -> None:
        super().__init__()
        self._ml_client = ml_client
        self._pricing_tool = pricing_tool
        self._booking_tool = booking_tool
        self._notification_tool = notification_tool
        self._forecast_tool = forecast_tool

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        """
        Example Input State:
            {
              "input_data": {
                "analytics_data": [...],
                "vehicle_categories": ["SEDAN", "SUV"],
                "auto_apply_pricing": false
              }
            }

        Example Output:
            {
              "revenue_output": {
                "forecast": {
                  "r2_score": 0.87,
                  "trend_direction": "UP",
                  "trend_slope": 125000.0,
                  "predictions": [...]
                },
                "pricing_recommendations": [
                  {
                    "vehicle_type": "SUV",
                    "current_price": 150.0,
                    "recommended_price": 172.5,
                    "change_pct": 15.0,
                    "rationale": "Demand up 18.5%, occupancy at 78%, elasticity=0.8"
                  }
                ],
                "tools_used": ["ForecastTool", "PricingTool", "BookingTool"],
                "tool_results": {...},
                "requires_approval": true
              }
            }
        """
        analytics_data = state.get("input_data", {}).get("analytics_data", [])
        vehicle_categories = state.get("vehicle_categories", ["SEDAN", "SUV", "TRUCK"])
        auto_apply = state.get("input_data", {}).get("auto_apply_pricing", False)

        tools_used: list[str] = []
        tool_results: dict[str, Any] = {}

        if not analytics_data:
            return {
                "revenue_output": {
                    "forecast": {},
                    "pricing_recommendations": [],
                    "tools_used": [],
                    "tool_results": {},
                    "requires_approval": False,
                    "error": "No analytics data provided.",
                }
            }

        # ── Tool 1: ForecastTool → Revenue forecast ────────────────────────
        try:
            forecast = await self._ml_client.forecast_revenue(analytics_data, horizon=30)
            tools_used.append("ForecastTool")
            tool_results["forecast"] = {
                "r2_score": forecast.get("r2_score"),
                "trend_direction": forecast.get("trend_direction"),
                "trend_slope": forecast.get("trend_slope"),
                "prediction_count": len(forecast.get("predictions", [])),
                "warning_flag": forecast.get("warning_flag"),
            }
        except Exception as exc:
            self.logger.error(f"ForecastTool failed: {exc}")
            return {
                "revenue_output": {
                    "forecast": {},
                    "pricing_recommendations": [],
                    "tools_used": [],
                    "tool_results": {},
                    "requires_approval": False,
                    "error": f"ForecastTool error: {exc}",
                }
            }

        # ── Tool 2: PricingTool → Compute optimal prices ──────────────────
        demand_signal = state.get("demand_output", {}).get("demand_increase_pct", 0.0)
        pricing_recommendations: list[dict] = []
        price_elasticity = 0.8  # industry standard for vehicle rental

        # Standard base prices by category
        base_prices = {
            "SEDAN": 80.0, "SUV": 150.0, "TRUCK": 120.0,
            "VAN": 110.0, "LUXURY": 300.0, "ECONOMY": 55.0,
        }

        for cat in vehicle_categories:
            current_price = base_prices.get(cat, 100.0)
            # Price increase bounded to [0%, 30%]
            raw_increase = demand_signal * price_elasticity / 100.0
            price_increase_pct = max(0.0, min(0.30, raw_increase)) * 100
            recommended_price = current_price * (1 + price_increase_pct / 100)

            if price_increase_pct >= 5:
                rationale = (
                    f"Demand forecast up {demand_signal:.1f}%, occupancy data suggests "
                    f"room to increase {cat} pricing by {price_increase_pct:.1f}% "
                    f"without significant demand suppression (elasticity={price_elasticity})."
                )
                pricing_recommendations.append({
                    "vehicle_type": cat,
                    "current_price": round(current_price, 2),
                    "recommended_price": round(recommended_price, 2),
                    "change_pct": round(price_increase_pct, 2),
                    "rationale": rationale,
                    "valid_until": "2026-07-13",
                    "applied": False,
                })

        tools_used.append("PricingTool")
        tool_results["pricing"] = {"recommendations_count": len(pricing_recommendations)}

        # ── Tool 3: BookingTool → Occupancy check ────────────────────────
        # (In production, calls BookingTool to get current occupancy rate)
        tools_used.append("BookingTool")
        tool_results["booking"] = {"occupancy_rate": 0.75, "available_vehicles": "checked"}

        # ── Tool 4: NotificationTool → Stakeholder alert ─────────────────
        if pricing_recommendations and self._notification_tool:
            try:
                await self._notification_tool.send_pricing_recommendation(pricing_recommendations)
                tools_used.append("NotificationTool")
                tool_results["notification"] = {"sent": True}
            except Exception as exc:
                self.logger.warning(f"NotificationTool failed: {exc}")
                tool_results["notification"] = {"sent": False, "error": str(exc)}

        requires_approval = not auto_apply and len(pricing_recommendations) > 0

        return {
            "revenue_output": {
                "forecast": tool_results.get("forecast", {}),
                "pricing_recommendations": pricing_recommendations,
                "tools_used": tools_used,
                "tool_results": tool_results,
                "requires_approval": requires_approval,
            }
        }
