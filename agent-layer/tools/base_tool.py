"""
base_tool.py — Abstract base class for all LuxeWay Agent Tools

All tools expose:
  - execute(payload) -> dict
  - Retry logic (via tenacity)
  - Timeout handling
  - Structured logging
  - FastAPI client integration
"""
from __future__ import annotations

import abc
import logging
import time
from typing import Any, Optional

import httpx
from tenacity import AsyncRetrying, RetryError, stop_after_attempt, wait_exponential

from config import settings


class ToolError(Exception):
    """Raised when a tool call fails after all retries."""
    def __init__(self, tool_name: str, reason: str) -> None:
        self.tool_name = tool_name
        self.reason = reason
        super().__init__(f"[{tool_name}] Tool error: {reason}")


class BaseTool(abc.ABC):
    """
    Abstract base for all agent tools.
    Provides: HTTP client, retry, timeout, structured logging.
    """

    tool_name: str  # Override in subclass

    def __init__(
        self,
        base_url: str = settings.BACKEND_URL,
        timeout: float = settings.BACKEND_TIMEOUT_SECONDS,
        max_retries: int = 3,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._max_retries = max_retries
        self.logger = logging.getLogger(f"luxeway.tools.{self.tool_name}")

    # ── HTTP helpers ──────────────────────────────────────────────────────────

    async def _get(self, endpoint: str, params: Optional[dict] = None) -> dict[str, Any]:
        return await self._request("GET", endpoint, params=params)

    async def _post(self, endpoint: str, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._request("POST", endpoint, json=payload)

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[dict] = None,
        json: Optional[dict] = None,
    ) -> dict[str, Any]:
        url = f"{self._base_url}{endpoint}"
        start_ns = time.perf_counter_ns()

        try:
            async for attempt in AsyncRetrying(
                stop=stop_after_attempt(self._max_retries),
                wait=wait_exponential(multiplier=0.5, min=0.5, max=5),
                reraise=True,
            ):
                with attempt:
                    async with httpx.AsyncClient(timeout=self._timeout) as client:
                        resp = await client.request(method, url, params=params, json=json)
                        if resp.status_code >= 500:
                            raise ToolError(self.tool_name, f"Server error {resp.status_code}")
                        resp.raise_for_status()
                        result: dict[str, Any] = resp.json()

        except RetryError as exc:
            elapsed = (time.perf_counter_ns() - start_ns) / 1_000_000
            self.logger.error(
                f"Tool exhausted retries after {elapsed:.0f}ms",
                extra={"url": url, "method": method},
            )
            raise ToolError(self.tool_name, f"Exhausted {self._max_retries} retries") from exc

        finally:
            elapsed = (time.perf_counter_ns() - start_ns) / 1_000_000
            self.logger.info(
                "Tool call",
                extra={"method": method, "url": url, "elapsed_ms": round(elapsed, 2)},
            )

        return result

    # ── Abstract interface ────────────────────────────────────────────────────

    @abc.abstractmethod
    async def execute(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Execute the tool with the given payload."""
        ...
