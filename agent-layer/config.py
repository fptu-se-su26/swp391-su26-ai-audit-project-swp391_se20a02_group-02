"""
config.py — Agent Layer Central Configuration
LuxeWay Agentic AI Architecture
"""
from __future__ import annotations

import os
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Service Identity ────────────────────────────────────────────────────
    SERVICE_NAME: str = "luxeway-agent-layer"
    SERVICE_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # ── Network ─────────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    WORKERS: int = 4

    # ── ML Sidecar ──────────────────────────────────────────────────────────
    ML_SERVICE_URL: str = os.getenv("ML_SERVICE_URL", "http://localhost:8000")
    ML_TIMEOUT_SECONDS: float = 10.0
    ML_MAX_RETRIES: int = 3
    ML_RETRY_BACKOFF: float = 0.5

    # ── Spring Boot Backend ──────────────────────────────────────────────────
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8080")
    BACKEND_TIMEOUT_SECONDS: float = 5.0

    # ── JWT Security ─────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    AGENT_API_KEY: str = os.getenv("AGENT_API_KEY", "agent-internal-key-change-me")

    # ── Database (for audit logging) ──────────────────────────────────────────
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./agent_audit.db",  # Override in prod with SQL Server
    )

    # ── Redis (memory / checkpointing) ───────────────────────────────────────
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_TTL_SECONDS: int = 3600

    # ── MLflow ───────────────────────────────────────────────────────────────
    MLFLOW_TRACKING_URI: str = os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000")
    MLFLOW_EXPERIMENT_NAME: str = "luxeway-agents"

    # ── Prometheus ───────────────────────────────────────────────────────────
    METRICS_ENABLED: bool = True
    METRICS_PATH: str = "/metrics"

    # ── Orchestrator ─────────────────────────────────────────────────────────
    ORCHESTRATOR_TIMEOUT_SECONDS: float = 30.0
    MAX_CONCURRENT_AGENTS: int = 6

    # ── Rate Limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_REQUESTS: int = 1000
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # ── LangGraph & LLMs ──────────────────────────────────────────────────────
    LANGGRAPH_RECURSION_LIMIT: int = 50
    ENABLE_HUMAN_IN_LOOP: bool = False  # set True in prod for revenue changes
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
