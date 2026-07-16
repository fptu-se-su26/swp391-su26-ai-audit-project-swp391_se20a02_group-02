"""
base_agent.py — Abstract base class for all LuxeWay agents.
All agents MUST inherit from this and implement `run()`.
"""
from __future__ import annotations

import abc
import logging
import time
from datetime import datetime
from typing import Any, Optional

from models.agent_schemas import AgentName, AgentStatus, AgentExecutionLog


class BaseAgent(abc.ABC):
    """
    Contract:
    - Every agent owns a single `run(state) -> dict` method.
    - Execution metadata (timing, status, errors) is automatically tracked.
    - Concrete agents must set `agent_name` as a class attribute.
    """

    agent_name: AgentName  # Override in subclass

    def __init__(self) -> None:
        self.logger = logging.getLogger(f"luxeway.agents.{self.agent_name.value}")
        self._last_execution_log: Optional[AgentExecutionLog] = None

    # ── Public API ────────────────────────────────────────────────────────────

    async def execute(
        self, state: dict[str, Any], run_id: str
    ) -> tuple[dict[str, Any], AgentExecutionLog]:
        """
        Wraps `run()` with timing, error handling, and execution logging.
        Returns (output_dict, execution_log).
        """
        started_at = datetime.utcnow()
        start_ns = time.perf_counter_ns()
        log = AgentExecutionLog(
            run_id=run_id,
            agent_name=self.agent_name,
            status=AgentStatus.RUNNING,
            started_at=started_at,
        )

        try:
            self.logger.info("Agent started", extra={"run_id": run_id})
            output = await self.run(state)
            log.status = AgentStatus.SUCCESS
            self.logger.info("Agent completed", extra={"run_id": run_id, "output_keys": list(output.keys())})
            return output, self._finalize_log(log, start_ns)

        except Exception as exc:
            log.status = AgentStatus.FAILED
            log.error_message = str(exc)
            self.logger.exception(
                "Agent failed", extra={"run_id": run_id, "error": str(exc)}
            )
            return {"error": str(exc), "agent": self.agent_name.value}, self._finalize_log(log, start_ns)

    @abc.abstractmethod
    async def run(self, state: dict[str, Any]) -> dict[str, Any]:
        """
        Core agent logic.

        Args:
            state: The current FleetOrchestrationState dict.

        Returns:
            A dict with agent-specific output keys.
        """
        ...

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _finalize_log(log: AgentExecutionLog, start_ns: int) -> AgentExecutionLog:
        log.completed_at = datetime.utcnow()
        log.duration_ms = (time.perf_counter_ns() - start_ns) / 1_000_000
        return log

    def description(self) -> str:
        return f"{self.agent_name.value} ({self.__class__.__name__})"
