"""
main.py — FastAPI Agent Service Entry Point

Exposes:
  /health           — health routes
  /api/v1/agent     — per-agent routes
  /api/v1/orchestrate — orchestrator routes
  /metrics          — Prometheus metrics

Includes:
  - JWT authentication middleware
  - Request/response logging middleware
  - Prometheus metrics
  - CORS
  - Lifespan management (startup/shutdown)
"""
from __future__ import annotations

import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import jose.jwt as jwt

from config import settings
from connectors.ml_client import get_ml_client, close_ml_client
from models.agent_schemas import (
    AgentStatus,
    OrchestrateRequest,
    OrchestrateResponse,
    HealthAgentRequest,
    AnomalyAgentRequest,
    ChurnAgentRequest,
    DemandAgentRequest,
    RevenueAgentRequest,
    UtilizationAgentRequest,
)

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
)
logger = logging.getLogger("luxeway.agent_service")

# ── Prometheus (optional) ─────────────────────────────────────────────────────
try:
    from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
    REQUEST_COUNT = Counter("agent_requests_total", "Total agent requests", ["endpoint", "status"])
    REQUEST_LATENCY = Histogram("agent_request_duration_seconds", "Agent request latency", ["endpoint"])
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    logger.warning("prometheus_client not installed — metrics endpoint disabled")


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Startup: initialise shared ML client and orchestrator. Shutdown: clean up."""
    logger.info("Agent service starting up...")
    # Pre-warm ML client
    await get_ml_client()
    yield
    logger.info("Agent service shutting down...")
    await close_ml_client()


# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="LuxeWay Agent Service",
    description="Agentic AI layer for LuxeWay vehicle rental platform",
    version=settings.SERVICE_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Authentication Middleware ──────────────────────────────────────────────────

async def verify_token(request: Request) -> dict:
    """
    JWT verification. Accepts:
    - Authorization: Bearer <jwt>  (for frontend/backend calls)
    - X-Agent-API-Key: <key>       (for internal agent-to-agent calls)
    """
    # API Key shortcut for internal calls
    api_key = request.headers.get("X-Agent-API-Key")
    if api_key and api_key == settings.AGENT_API_KEY:
        return {"sub": "internal", "role": "AGENT"}

    # JWT verification
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {exc}")


# ── Logging Middleware ─────────────────────────────────────────────────────────

@app.middleware("http")
async def logging_middleware(request: Request, call_next) -> Response:
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start = time.perf_counter_ns()

    logger.info(
        "Incoming request",
        extra={"request_id": request_id, "method": request.method, "path": request.url.path},
    )

    response = await call_next(request)

    elapsed_ms = (time.perf_counter_ns() - start) / 1_000_000
    logger.info(
        "Request complete",
        extra={
            "request_id": request_id,
            "status_code": response.status_code,
            "elapsed_ms": round(elapsed_ms, 2),
        },
    )

    if PROMETHEUS_AVAILABLE:
        REQUEST_COUNT.labels(endpoint=request.url.path, status=response.status_code).inc()
        REQUEST_LATENCY.labels(endpoint=request.url.path).observe(elapsed_ms / 1000)

    response.headers["X-Request-ID"] = request_id
    return response


# ── Health Routes ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health() -> dict:
    """Basic liveness probe."""
    return {"status": "UP", "service": settings.SERVICE_NAME, "version": settings.SERVICE_VERSION}


@app.get("/health/ready", tags=["Health"])
async def readiness() -> dict:
    """Readiness probe — checks ML sidecar connectivity."""
    ml_client = await get_ml_client()
    ml_health = await ml_client.health_check()
    ready = ml_health.get("ok", False)
    return {"ready": ready, "ml_sidecar": ml_health}


# ── Prometheus Metrics ─────────────────────────────────────────────────────────

if PROMETHEUS_AVAILABLE:
    @app.get("/metrics", tags=["Observability"])
    async def metrics() -> Response:
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


# ── Orchestrator Routes ────────────────────────────────────────────────────────

@app.post(
    "/api/v1/orchestrate",
    response_model=OrchestrateResponse,
    tags=["Orchestrator"],
    summary="Run full FleetOptimizationOrchestrator",
)
async def orchestrate(
    request: OrchestrateRequest,
    token_data: dict = Depends(verify_token),
) -> OrchestrateResponse:
    """
    Trigger the full hub-and-spoke orchestration:
    Health → Anomaly → Demand → Revenue → Utilization → Churn → Synthesis
    Returns a FleetActionPlan.
    """
    from orchestrator.fleet_optimization_orchestrator import FleetOptimizationOrchestrator
    ml_client = await get_ml_client()
    orchestrator = FleetOptimizationOrchestrator(ml_client, settings.BACKEND_URL)
    return await orchestrator.orchestrate(request)


# ── Individual Agent Routes ────────────────────────────────────────────────────

@app.post("/api/v1/agent/health", tags=["Agents"])
async def run_health_agent(
    request: HealthAgentRequest,
    token_data: dict = Depends(verify_token),
) -> dict:
    from agents.health_agent import HealthAgent
    ml_client = await get_ml_client()
    agent = HealthAgent(ml_client, settings.BACKEND_URL)
    output, _ = await agent.execute(request.model_dump(), "standalone")
    return output


@app.post("/api/v1/agent/anomaly", tags=["Agents"])
async def run_anomaly_agent(
    request: AnomalyAgentRequest,
    token_data: dict = Depends(verify_token),
) -> dict:
    from agents.anomaly_agent import AnomalyAgent
    ml_client = await get_ml_client()
    agent = AnomalyAgent(ml_client)
    output, _ = await agent.execute({"input_data": {"analytics_data": [d.model_dump() for d in request.data]}}, "standalone")
    return output


@app.post("/api/v1/agent/churn", tags=["Agents"])
async def run_churn_agent(
    request: ChurnAgentRequest,
    token_data: dict = Depends(verify_token),
) -> dict:
    from agents.churn_agent import ChurnAgent
    ml_client = await get_ml_client()
    agent = ChurnAgent(ml_client)
    state = {
        "input_data": {
            "customers": request.customers,
            "platform_avg_frequency": request.platform_avg_frequency,
            "platform_avg_spend": request.platform_avg_spend,
        }
    }
    output, _ = await agent.execute(state, "standalone")
    return output


@app.post("/api/v1/agent/demand", tags=["Agents"])
async def run_demand_agent(
    request: DemandAgentRequest,
    token_data: dict = Depends(verify_token),
) -> dict:
    from agents.demand_agent import DemandAgent
    ml_client = await get_ml_client()
    agent = DemandAgent(ml_client)
    state = {"input_data": {"analytics_data": [d.model_dump() for d in request.data]}}
    output, _ = await agent.execute(state, "standalone")
    return output


@app.post("/api/v1/agent/revenue", tags=["Agents"])
async def run_revenue_agent(
    request: RevenueAgentRequest,
    token_data: dict = Depends(verify_token),
) -> dict:
    from agents.revenue_agent import RevenueAgent
    ml_client = await get_ml_client()
    agent = RevenueAgent(ml_client)
    state = {
        "input_data": {
            "analytics_data": [d.model_dump() for d in request.data],
            "auto_apply_pricing": request.auto_apply_pricing,
        },
        "vehicle_categories": request.vehicle_categories,
    }
    output, _ = await agent.execute(state, "standalone")
    return output


@app.post("/api/v1/agent/utilization", tags=["Agents"])
async def run_utilization_agent(
    request: UtilizationAgentRequest,
    token_data: dict = Depends(verify_token),
) -> dict:
    from agents.utilization_agent import UtilizationAgent
    ml_client = await get_ml_client()
    agent = UtilizationAgent(ml_client)
    state = {
        "input_data": {
            "vehicle_utilization": request.by_category,
        }
    }
    output, _ = await agent.execute(state, "standalone")
    return output


# ── Exception Handlers ─────────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception", extra={"path": request.url.path})
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": type(exc).__name__},
    )


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        workers=settings.WORKERS,
        log_level="info",
    )
