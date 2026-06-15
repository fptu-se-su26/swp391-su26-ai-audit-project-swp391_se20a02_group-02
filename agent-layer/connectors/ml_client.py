"""
ml_client.py — Async HTTP client for the LuxeWay ML Sidecar.
Implements retry logic, timeout handling, and structured logging.
"""
from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Optional

import httpx
from tenacity import (
    AsyncRetrying,
    RetryError,
    stop_after_attempt,
    wait_exponential,
)

from config import settings

logger = logging.getLogger("luxeway.connectors.ml_client")


class MLServiceError(Exception):
    """Raised when the ML sidecar returns an error."""
    def __init__(self, endpoint: str, status_code: int, detail: str) -> None:
        self.endpoint = endpoint
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"ML service error [{status_code}] at {endpoint}: {detail}")


class MLSidecarClient:
    """
    Async HTTP client for the FastAPI ML sidecar.

    Features:
    - Connection pooling via httpx.AsyncClient
    - Exponential-backoff retries (tenacity)
    - Per-request timeout
    - Structured JSON logging
    - Prometheus-compatible latency tracking
    """

    def __init__(
        self,
        base_url: str = settings.ML_SERVICE_URL,
        timeout: float = settings.ML_TIMEOUT_SECONDS,
        max_retries: int = settings.ML_MAX_RETRIES,
        backoff: float = settings.ML_RETRY_BACKOFF,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = httpx.Timeout(timeout)
        self._max_retries = max_retries
        self._backoff = backoff
        self._client: Optional[httpx.AsyncClient] = None

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    async def __aenter__(self) -> MLSidecarClient:
        self._client = httpx.AsyncClient(
            base_url=self._base_url,
            timeout=self._timeout,
            headers={"Content-Type": "application/json"},
        )
        return self

    async def __aexit__(self, *_: Any) -> None:
        if self._client:
            await self._client.aclose()

    # ── Core request helper ───────────────────────────────────────────────────

    async def _post(self, endpoint: str, payload: dict[str, Any]) -> dict[str, Any]:
        """POST with exponential-backoff retry and latency logging."""
        assert self._client is not None, "Client not started — use async with"

        start_ns = time.perf_counter_ns()
        try:
            async for attempt in AsyncRetrying(
                stop=stop_after_attempt(self._max_retries),
                wait=wait_exponential(multiplier=self._backoff, min=0.5, max=5),
                reraise=True,
            ):
                with attempt:
                    response = await self._client.post(endpoint, json=payload)
                    if response.status_code >= 500:
                        raise MLServiceError(endpoint, response.status_code, response.text)
                    if response.status_code >= 400:
                        raise MLServiceError(endpoint, response.status_code, response.text)
                    result: dict[str, Any] = response.json()
        except RetryError as exc:
            logger.error(
                "ML service exhausted retries",
                extra={"endpoint": endpoint, "retries": self._max_retries},
            )
            raise exc
        finally:
            elapsed_ms = (time.perf_counter_ns() - start_ns) / 1_000_000
            logger.info(
                "ML sidecar call",
                extra={"endpoint": endpoint, "elapsed_ms": round(elapsed_ms, 2)},
            )

        return result

    # ── Domain methods ────────────────────────────────────────────────────────

    async def detect_anomalies(self, data: list[dict]) -> dict[str, Any]:
        return await self._post("/ml/anomalies/detect", {"data": data})

    async def score_churn(
        self,
        customers: list[dict],
        platform_avg_frequency: float,
        platform_avg_spend: float,
    ) -> dict[str, Any]:
        return await self._post(
            "/ml/churn/score",
            {
                "customers": customers,
                "platform_avg_frequency": platform_avg_frequency,
                "platform_avg_spend": platform_avg_spend,
            },
        )

    async def forecast_demand(self, data: list[dict], horizon: int) -> dict[str, Any]:
        return await self._post("/ml/demand/forecast", {"data": data, "horizon": horizon})

    async def forecast_revenue(self, data: list[dict], horizon: int) -> dict[str, Any]:
        return await self._post("/ml/revenue/forecast", {"data": data, "horizon": horizon})

    async def forecast_utilization(
        self, by_category: dict[str, list[float]], forecast_days: int
    ) -> dict[str, Any]:
        return await self._post(
            "/ml/utilization/forecast",
            {"by_category": by_category, "forecast_days": forecast_days},
        )

    async def health_check(self) -> dict[str, Any]:
        assert self._client is not None
        try:
            resp = await self._client.get("/health")
            return {"ok": resp.status_code == 200, "detail": resp.json()}
        except Exception as exc:
            return {"ok": False, "detail": str(exc)}


# ── Module-level singleton ────────────────────────────────────────────────────

_shared_client: Optional[MLSidecarClient] = None


async def get_ml_client() -> MLSidecarClient:
    """FastAPI dependency — returns the shared async client."""
    global _shared_client
    if _shared_client is None:
        _shared_client = MLSidecarClient()
        _shared_client._client = httpx.AsyncClient(
            base_url=settings.ML_SERVICE_URL,
            timeout=httpx.Timeout(settings.ML_TIMEOUT_SECONDS),
            headers={"Content-Type": "application/json"},
        )
    return _shared_client


async def close_ml_client() -> None:
    global _shared_client
    if _shared_client and _shared_client._client:
        await _shared_client._client.aclose()
        _shared_client = None
