"""
pricing_tool.py — PricingTool: Read/apply pricing via Spring Boot backend
"""
from __future__ import annotations
from typing import Any
from tools.base_tool import BaseTool


class PricingTool(BaseTool):
    """
    Tool: PricingTool
    Interface: GET /api/v1/vehicles/pricing | POST /api/v1/vehicles/pricing/apply
    Retry: 3 attempts with exponential backoff
    Timeout: 5 seconds
    Logging: structured JSON
    """
    tool_name = "PricingTool"

    async def execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        action = payload.get("action", "get")
        if action == "apply":
            return await self._post("/api/v1/vehicles/pricing/apply", payload)
        return await self._get("/api/v1/vehicles/pricing", params=payload)

    async def get_current_pricing(self, vehicle_type: str) -> dict[str, Any]:
        return await self._get("/api/v1/vehicles/pricing", params={"vehicleType": vehicle_type})

    async def apply_pricing_recommendation(self, recommendations: list[dict]) -> dict[str, Any]:
        return await self._post("/api/v1/vehicles/pricing/apply", {"recommendations": recommendations})

    async def send_pricing_recommendation(self, recommendations: list[dict]) -> dict[str, Any]:
        """Notify stakeholders of pricing changes (non-apply)."""
        return await self._post("/api/v1/notifications/pricing", {"recommendations": recommendations})


class BookingTool(BaseTool):
    """
    Tool: BookingTool
    Interface: GET /api/v1/bookings/occupancy | GET /api/v1/bookings/availability
    """
    tool_name = "BookingTool"

    async def execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._get("/api/v1/bookings/occupancy", params=payload)

    async def get_occupancy_rate(self, vehicle_type: str) -> dict[str, Any]:
        return await self._get("/api/v1/bookings/occupancy", params={"vehicleType": vehicle_type})

    async def check_availability(self, vehicle_type: str, date: str) -> dict[str, Any]:
        return await self._get("/api/v1/bookings/availability", params={"vehicleType": vehicle_type, "date": date})


class NotificationTool(BaseTool):
    """
    Tool: NotificationTool
    Interface: POST /api/v1/notifications/send
    """
    tool_name = "NotificationTool"

    async def execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._post("/api/v1/notifications/send", payload)

    async def send_anomaly_alert(self, anomaly: dict) -> dict[str, Any]:
        return await self._post("/api/v1/notifications/send", {
            "type": "ANOMALY_ALERT",
            "severity": anomaly.get("severity"),
            "metric": anomaly.get("metric_type"),
            "date": anomaly.get("date"),
            "z_score": anomaly.get("z_score"),
            "recipients": ["admin@luxeway.com", "ops@luxeway.com"],
        })

    async def send_pricing_recommendation(self, recommendations: list[dict]) -> dict[str, Any]:
        return await self._post("/api/v1/notifications/send", {
            "type": "PRICING_RECOMMENDATION",
            "recommendations": recommendations,
            "recipients": ["pricing@luxeway.com", "admin@luxeway.com"],
        })

    async def send_churn_campaign(self, campaign: dict) -> dict[str, Any]:
        return await self._post("/api/v1/notifications/send", {
            "type": "CHURN_CAMPAIGN",
            "campaign": campaign,
            "recipients": ["marketing@luxeway.com"],
        })


class VehicleTool(BaseTool):
    """
    Tool: VehicleTool
    Interface: GET /api/v1/vehicles | POST /api/v1/vehicles/relocate
    """
    tool_name = "VehicleTool"

    async def execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._get("/api/v1/vehicles", params=payload)

    async def get_fleet_summary(self) -> dict[str, Any]:
        return await self._get("/api/v1/vehicles/summary")

    async def relocate_vehicles(self, relocations: list[dict]) -> dict[str, Any]:
        return await self._post("/api/v1/vehicles/relocate", {"relocations": relocations})


class CustomerTool(BaseTool):
    """
    Tool: CustomerTool
    Interface: GET /api/v1/customers | POST /api/v1/customers/campaign
    """
    tool_name = "CustomerTool"

    async def execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._get("/api/v1/customers", params=payload)

    async def get_at_risk_customers(self, risk_level: str = "HIGH") -> dict[str, Any]:
        return await self._get("/api/v1/customers/at-risk", params={"riskLevel": risk_level})

    async def create_campaign(self, campaign: dict) -> dict[str, Any]:
        return await self._post("/api/v1/customers/campaign", campaign)


class ForecastTool(BaseTool):
    """
    Tool: ForecastTool
    Interface: Delegates to ML sidecar via agent connector
    """
    tool_name = "ForecastTool"

    async def execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._post("/ml/demand/forecast", payload)

    async def get_demand_forecast(self, data: list[dict], horizon: int) -> dict[str, Any]:
        return await self._post("/ml/demand/forecast", {"data": data, "horizon": horizon})

    async def get_revenue_forecast(self, data: list[dict], horizon: int) -> dict[str, Any]:
        return await self._post("/ml/revenue/forecast", {"data": data, "horizon": horizon})


class FraudTool(BaseTool):
    """
    Tool: FraudTool
    Interface: POST /api/v1/fraud/detect | GET /api/v1/fraud/flagged
    Integrates with Isolation Forest via ML sidecar anomaly endpoint.
    """
    tool_name = "FraudTool"

    async def execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._post("/api/v1/fraud/detect", payload)

    async def detect_fraud(self, transaction: dict) -> dict[str, Any]:
        return await self._post("/api/v1/fraud/detect", transaction)

    async def get_flagged_transactions(self) -> dict[str, Any]:
        return await self._get("/api/v1/fraud/flagged")
