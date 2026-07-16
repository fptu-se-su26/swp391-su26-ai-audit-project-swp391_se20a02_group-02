"""
anomaly_agent.py — Autonomous Agent for Anomaly Detection

Pattern: AUTONOMOUS AGENT (Self-executing, scheduled, automatic alerting)
Responsibility: Detect anomalies, classify severity, send alerts autonomously.
"""
from __future__ import annotations

import logging
from typing import Any

from agents.base_agent import BaseAgent
from connectors.ml_client import MLSidecarClient
from events.event_bus import event_bus
from events.event_schemas import AnomalyDetectedEvent
from models.agent_schemas import AgentName, SeverityLevel

logger = logging.getLogger("luxeway.agents.anomaly")


class AnomalyAgent(BaseAgent):
    """
    AUTONOMOUS AGENT — Anomaly Detection

    Decision Logic:
    1. Call ML sidecar /ml/anomalies/detect
    2. Classify each anomaly by severity (CRITICAL | WARNING)
    3. Autonomously send notifications for CRITICAL anomalies (no user input needed)
    4. Store anomalies in audit log
    5. Return structured anomaly report

    Triggered by: Scheduled task every 15 minutes OR WebSocket event from backend.
    Failure Handling: On ML sidecar failure, return empty anomalies with error flag.
    Metrics: anomaly_count, critical_count, alert_sent_count
    """

    agent_name = AgentName.ANOMALY

    def __init__(
        self,
        ml_client: MLSidecarClient,
        notification_tool: Any = None,
        alert_threshold: SeverityLevel = SeverityLevel.HIGH,
    ) -> None:
        super().__init__()
        self._ml_client = ml_client
        self._notification_tool = notification_tool
        self._alert_threshold = alert_threshold

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        """
        Example Input State:
            {
              "input_data": {
                "analytics_data": [
                  {"date": "2026-06-01", "revenue": 50000, "bookings_count": 120},
                  ...
                ]
              },
              "auto_alert": true,
              "notify_threshold": "HIGH"
            }

        Example Output:
            {
              "anomaly_output": {
                "anomalies": [...],
                "total_anomalies": 3,
                "critical_count": 1,
                "warning_count": 2,
                "alerts_sent": ["admin@luxeway.com"],
                "reasoning": "Detected 3 anomalies: 1 CRITICAL revenue spike on 2026-06-10..."
              }
            }

        Example Execution Flow:
            1. Extract analytics data from state["input_data"]
            2. POST to /ml/anomalies/detect
            3. Classify anomalies by severity
            4. For CRITICAL/HIGH: call NotificationTool.send_alert()
            5. Build reasoning summary
            6. Return structured output
        """
        analytics_data = state.get("input_data", {}).get("analytics_data", [])

        if not analytics_data:
            return {
                "anomaly_output": {
                    "anomalies": [],
                    "total_anomalies": 0,
                    "critical_count": 0,
                    "warning_count": 0,
                    "alerts_sent": [],
                    "reasoning": "No analytics data provided.",
                }
            }

        # Step 1: Call ML sidecar
        try:
            ml_result = await self._ml_client.detect_anomalies(analytics_data)
            anomalies: list[dict] = ml_result.get("anomalies", [])
        except Exception as exc:
            self.logger.error(f"ML sidecar error: {exc}")
            return {
                "anomaly_output": {
                    "anomalies": [],
                    "total_anomalies": 0,
                    "critical_count": 0,
                    "warning_count": 0,
                    "alerts_sent": [],
                    "error": str(exc),
                    "reasoning": f"Failed to reach ML sidecar: {exc}",
                }
            }

        # Step 2: Classify
        critical = [a for a in anomalies if a.get("severity") == "CRITICAL"]
        warnings = [a for a in anomalies if a.get("severity") == "WARNING"]

        # Step 3: Autonomous alerting
        alerts_sent: list[str] = []
        auto_alert = state.get("auto_alert", True)
        if auto_alert and (critical or warnings) and self._notification_tool:
            try:
                for anomaly in critical + warnings:
                    if anomaly.get("severity") in {"CRITICAL", "HIGH"}:
                        await self._notification_tool.send_anomaly_alert(anomaly)
                        alerts_sent.append("admin@luxeway.com")
            except Exception as exc:
                self.logger.warning(f"Notification failed: {exc}")

        # Step 4: Build reasoning
        reasoning_parts = [
            f"Detected {len(anomalies)} anomalies in analytics data.",
            f"Critical: {len(critical)}, Warning: {len(warnings)}.",
        ]
        if critical:
            top = critical[0]
            reasoning_parts.append(
                f"Most severe: {top.get('metric_type')} on {top.get('date')} "
                f"(z-score={top.get('z_score', 0):.2f}, actual={top.get('actual_value')})."
            )
        reasoning = " ".join(reasoning_parts)

        output = {
            "anomalies": anomalies,
            "total_anomalies": len(anomalies),
            "critical_count": len(critical),
            "warning_count": len(warnings),
            "alerts_sent": alerts_sent,
            "reasoning": reasoning,
        }

        # ── Step 5: Publish domain event (event-driven decoupling) ────────────
        # Spring Boot subscribes to luxeway.events.anomaly_detected channel
        # and handles alerts without polling the agent service.
        if len(anomalies) > 0:
            try:
                run_id = state.get("run_id", "standalone")
                evt = AnomalyDetectedEvent.from_anomaly_output(output, run_id)
                import asyncio
                asyncio.create_task(event_bus.publish(evt))
            except Exception as exc:
                self.logger.warning(f"Event publish failed (non-critical): {exc}")

        return {"anomaly_output": output}
