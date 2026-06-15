"""
health_agent.py — Reactive Agent for Health Monitoring

Pattern: REACTIVE AGENT (Input → Process → Output, stateless)
Responsibility: Ping ML sidecar, backend, and database; return a system health snapshot.
"""
from __future__ import annotations

import asyncio
import time
from typing import Any

from agents.base_agent import BaseAgent
from connectors.ml_client import MLSidecarClient
from models.agent_schemas import AgentName


class HealthAgent(BaseAgent):
    """
    REACTIVE AGENT — Health Monitoring

    Decision Logic:
    1. Ping ML sidecar /health
    2. Ping Spring Boot backend /actuator/health
    3. Determine overall system status
    4. Return structured health report

    Triggered by: Cron every 60 seconds or on-demand API call.
    Failure Handling: Returns DEGRADED status on partial failure; DOWN on total failure.
    """

    agent_name = AgentName.HEALTH

    def __init__(self, ml_client: MLSidecarClient, backend_url: str) -> None:
        super().__init__()
        self._ml_client = ml_client
        self._backend_url = backend_url

    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        """
        Example Input State:
            {
              "check_ml_endpoints": true,
              "check_backend": true
            }

        Example Output:
            {
              "health_output": {
                "status": "HEALTHY",
                "ml_service_ok": true,
                "backend_ok": true,
                "latency_ms": 42.3,
                "issues": []
              }
            }
        """
        issues: list[str] = []
        latencies: list[float] = []

        # 1. Check ML sidecar
        ml_ok = False
        try:
            start = time.perf_counter_ns()
            health_resp = await self._ml_client.health_check()
            latencies.append((time.perf_counter_ns() - start) / 1_000_000)
            ml_ok = health_resp.get("ok", False)
            if not ml_ok:
                issues.append(f"ML sidecar unhealthy: {health_resp.get('detail')}")
        except Exception as exc:
            issues.append(f"ML sidecar unreachable: {exc}")

        # 2. Check Spring Boot backend
        backend_ok = False
        try:
            import httpx
            start = time.perf_counter_ns()
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self._backend_url}/actuator/health")
                latencies.append((time.perf_counter_ns() - start) / 1_000_000)
                backend_ok = resp.status_code == 200
                if not backend_ok:
                    issues.append(f"Backend returned {resp.status_code}")
        except Exception as exc:
            issues.append(f"Backend unreachable: {exc}")

        # 3. Determine overall status
        avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
        if ml_ok and backend_ok:
            status = "HEALTHY"
        elif ml_ok or backend_ok:
            status = "DEGRADED"
        else:
            status = "DOWN"

        output = {
            "status": status,
            "ml_service_ok": ml_ok,
            "backend_ok": backend_ok,
            "latency_ms": round(avg_latency, 2),
            "issues": issues,
        }
        self.logger.info("Health check complete", extra=output)
        return {"health_output": output}
