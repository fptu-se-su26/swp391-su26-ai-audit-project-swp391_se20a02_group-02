"""
agent_memory.py — 3-Tier Agent Memory Architecture

Addresses reviewer feedback #3:
  "AgentMemory currently behaves more like a cache than long-term agent memory.
   Consider defining short-term, long-term, and historical learning strategies."

Resolution: Three distinct memory tiers with different retention, purpose, and
storage backends.

Tier 1 — SHORT-TERM MEMORY (in-process dict, TTL 1 hour)
  Purpose: Current session context, anomaly dedup, request idempotency
  Backend: Python dict (swap to Redis in production)
  Scope: Single orchestration session
  Examples: "is this anomaly already alerted?", "what did health check return?"

Tier 2 — LONG-TERM MEMORY (SQLite / SQL Server, persistent)
  Purpose: Cross-session facts that agents should remember permanently
  Backend: SQLite (dev), SQL Server (prod via DATABASE_URL)
  Scope: Persistent across restarts
  Examples: "this customer was targeted with VIP campaign", "SUV pricing was
            increased on 2026-06-13 — don't increase again within 30 days"

Tier 3 — HISTORICAL LEARNING MEMORY (append-only JSON log + MLflow)
  Purpose: Track model performance over time for drift detection
  Backend: JSON log file + MLflow metrics (optional)
  Scope: Long-term analytics, retraining signals
  Examples: "demand_model accuracy over last 90 days", "churn model drift score"
"""
from __future__ import annotations

import json
import logging
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Generator, Optional

logger = logging.getLogger("luxeway.memory")


# ══════════════════════════════════════════════════════════════════════════════
# TIER 1 — SHORT-TERM MEMORY
# ══════════════════════════════════════════════════════════════════════════════

class ShortTermMemory:
    """
    In-process TTL cache for current-session context.
    Thread-safe (single process, asyncio event loop).
    Production replacement: Redis with EXPIRE command.
    """

    def __init__(self, default_ttl_seconds: int = 3600) -> None:
        self._store: dict[str, dict[str, Any]] = {}
        self._default_ttl = timedelta(seconds=default_ttl_seconds)

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        expires_at = datetime.utcnow() + (
            timedelta(seconds=ttl_seconds) if ttl_seconds else self._default_ttl
        )
        self._store[key] = {"value": value, "expires_at": expires_at}

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if not entry:
            return None
        if datetime.utcnow() > entry["expires_at"]:
            del self._store[key]
            return None
        return entry["value"]

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def remember_anomaly(self, anomaly_key: str, ttl_hours: int = 24) -> bool:
        """Idempotency: returns True if anomaly already seen (prevents re-alerting)."""
        full_key = f"anomaly_seen:{anomaly_key}"
        if self.get(full_key):
            return True
        self.set(full_key, True, ttl_seconds=ttl_hours * 3600)
        return False

    def store_agent_output(self, agent_name: str, output: dict[str, Any]) -> None:
        self.set(f"agent_output:{agent_name}", output, ttl_seconds=3600)

    def get_agent_output(self, agent_name: str) -> Optional[dict[str, Any]]:
        return self.get(f"agent_output:{agent_name}")

    def clear_expired(self) -> int:
        now = datetime.utcnow()
        expired = [k for k, v in self._store.items() if now > v["expires_at"]]
        for k in expired:
            del self._store[k]
        return len(expired)

    def __len__(self) -> int:
        return sum(1 for v in self._store.values() if datetime.utcnow() <= v["expires_at"])


# ══════════════════════════════════════════════════════════════════════════════
# TIER 2 — LONG-TERM MEMORY
# ══════════════════════════════════════════════════════════════════════════════

class LongTermMemory:
    """
    Persistent fact store for cross-session agent knowledge.
    Backend: SQLite (dev) / SQL Server (prod, via DATABASE_URL).

    Stores:
    - Pricing change history (prevent excessive re-pricing)
    - Customer campaign history (prevent duplicate campaigns)
    - Agent decision log (auditable, queryable)
    - Business rules overrides
    """

    DB_PATH = os.getenv("AGENT_LONG_TERM_DB", "./agent_memory.db")

    def __init__(self) -> None:
        self._init_schema()

    @contextmanager
    def _conn(self) -> Generator[sqlite3.Connection, None, None]:
        conn = sqlite3.connect(self.DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def _init_schema(self) -> None:
        with self._conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS agent_facts (
                    fact_id      TEXT PRIMARY KEY,
                    fact_type    TEXT NOT NULL,
                    entity_id    TEXT NOT NULL,
                    fact_key     TEXT NOT NULL,
                    fact_value   TEXT NOT NULL,
                    confidence   REAL DEFAULT 1.0,
                    created_at   TEXT NOT NULL,
                    valid_until  TEXT,
                    source_agent TEXT NOT NULL,
                    run_id       TEXT
                );

                CREATE INDEX IF NOT EXISTS idx_facts_entity
                    ON agent_facts (entity_id, fact_type);

                CREATE INDEX IF NOT EXISTS idx_facts_type_key
                    ON agent_facts (fact_type, fact_key);

                CREATE TABLE IF NOT EXISTS decision_log (
                    log_id       TEXT PRIMARY KEY,
                    agent_name   TEXT NOT NULL,
                    decision     TEXT NOT NULL,
                    reasoning    TEXT,
                    input_hash   TEXT,
                    created_at   TEXT NOT NULL,
                    run_id       TEXT
                );
            """)
        logger.info(f"LongTermMemory initialised: {self.DB_PATH}")

    # ── Fact CRUD ─────────────────────────────────────────────────────────────

    def remember_fact(
        self,
        fact_type: str,
        entity_id: str,
        fact_key: str,
        fact_value: Any,
        source_agent: str,
        valid_days: Optional[int] = None,
        run_id: Optional[str] = None,
        confidence: float = 1.0,
    ) -> None:
        """
        Store a persistent fact about an entity.

        Examples:
          remember_fact("pricing_change", "SUV", "last_increase_pct", 15.0, "RevenueAgent", valid_days=30)
          remember_fact("campaign_sent", "U001", "VIP_DISCOUNT_2026_06", True, "ChurnAgent", valid_days=90)
        """
        import uuid
        valid_until = None
        if valid_days:
            valid_until = (datetime.utcnow() + timedelta(days=valid_days)).isoformat()

        with self._conn() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO agent_facts
                  (fact_id, fact_type, entity_id, fact_key, fact_value,
                   confidence, created_at, valid_until, source_agent, run_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    str(uuid.uuid4()), fact_type, entity_id, fact_key,
                    json.dumps(fact_value), confidence,
                    datetime.utcnow().isoformat(), valid_until, source_agent, run_id,
                ),
            )

    def recall_fact(
        self, fact_type: str, entity_id: str, fact_key: str
    ) -> Optional[Any]:
        """Retrieve the most recent valid fact."""
        with self._conn() as conn:
            row = conn.execute(
                """
                SELECT fact_value, valid_until FROM agent_facts
                WHERE fact_type = ? AND entity_id = ? AND fact_key = ?
                ORDER BY created_at DESC LIMIT 1
                """,
                (fact_type, entity_id, fact_key),
            ).fetchone()

        if not row:
            return None
        if row["valid_until"] and datetime.utcnow().isoformat() > row["valid_until"]:
            return None  # Fact expired
        return json.loads(row["fact_value"])

    def recall_all_facts(self, fact_type: str, entity_id: str) -> list[dict]:
        """Retrieve all valid facts for an entity."""
        now = datetime.utcnow().isoformat()
        with self._conn() as conn:
            rows = conn.execute(
                """
                SELECT * FROM agent_facts
                WHERE fact_type = ? AND entity_id = ?
                  AND (valid_until IS NULL OR valid_until > ?)
                ORDER BY created_at DESC
                """,
                (fact_type, entity_id, now),
            ).fetchall()
        return [dict(r) for r in rows]

    def was_customer_campaigned(self, customer_id: str, campaign_type: str, within_days: int = 30) -> bool:
        """Check if customer received this campaign type recently."""
        cutoff = (datetime.utcnow() - timedelta(days=within_days)).isoformat()
        with self._conn() as conn:
            row = conn.execute(
                """
                SELECT 1 FROM agent_facts
                WHERE fact_type='campaign_sent' AND entity_id=? AND fact_key=?
                  AND created_at > ?
                LIMIT 1
                """,
                (customer_id, campaign_type, cutoff),
            ).fetchone()
        return row is not None

    def was_price_recently_changed(self, vehicle_type: str, within_days: int = 30) -> bool:
        """Prevent excessive re-pricing within a cooldown window."""
        cutoff = (datetime.utcnow() - timedelta(days=within_days)).isoformat()
        with self._conn() as conn:
            row = conn.execute(
                """
                SELECT 1 FROM agent_facts
                WHERE fact_type='pricing_change' AND entity_id=? AND created_at > ?
                LIMIT 1
                """,
                (vehicle_type, cutoff),
            ).fetchone()
        return row is not None

    # ── Decision Log ──────────────────────────────────────────────────────────

    def log_decision(
        self,
        agent_name: str,
        decision: str,
        reasoning: Optional[str] = None,
        input_hash: Optional[str] = None,
        run_id: Optional[str] = None,
    ) -> None:
        import uuid, hashlib
        with self._conn() as conn:
            conn.execute(
                """
                INSERT INTO decision_log (log_id, agent_name, decision, reasoning, input_hash, created_at, run_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (str(uuid.uuid4()), agent_name, decision, reasoning, input_hash, datetime.utcnow().isoformat(), run_id),
            )

    def get_decision_history(self, agent_name: str, limit: int = 10) -> list[dict]:
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT * FROM decision_log WHERE agent_name=? ORDER BY created_at DESC LIMIT ?",
                (agent_name, limit),
            ).fetchall()
        return [dict(r) for r in rows]


# ══════════════════════════════════════════════════════════════════════════════
# TIER 3 — HISTORICAL LEARNING MEMORY
# ══════════════════════════════════════════════════════════════════════════════

class HistoricalLearningMemory:
    """
    Append-only log for tracking model performance over time.
    Used for: drift detection, retraining triggers, A/B testing baselines.

    Backend: JSON lines file (dev) + MLflow metrics (production).
    """

    LOG_PATH = Path(os.getenv("HISTORICAL_MEMORY_LOG", "./historical_learning.jsonl"))

    def record_prediction_accuracy(
        self,
        model_name: str,
        predicted_value: float,
        actual_value: float,
        metric_name: str = "mape",
        run_id: Optional[str] = None,
    ) -> float:
        """
        Record prediction vs. actual. Computes MAPE (Mean Absolute Percentage Error).
        Returns the error metric value.
        """
        if actual_value == 0:
            error = abs(predicted_value)
        else:
            error = abs(predicted_value - actual_value) / abs(actual_value) * 100

        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "model_name": model_name,
            "metric_name": metric_name,
            "predicted": predicted_value,
            "actual": actual_value,
            "error_pct": round(error, 4),
            "run_id": run_id,
        }

        self.LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(self.LOG_PATH, "a") as f:
            f.write(json.dumps(entry) + "\n")

        # Also log to MLflow if available
        self._log_to_mlflow(model_name, {metric_name: error})

        return error

    def get_rolling_accuracy(self, model_name: str, window_days: int = 30) -> dict[str, float]:
        """Compute rolling accuracy for drift detection."""
        if not self.LOG_PATH.exists():
            return {"avg_error_pct": 0.0, "max_error_pct": 0.0, "sample_count": 0}

        cutoff = (datetime.utcnow() - timedelta(days=window_days)).isoformat()
        errors: list[float] = []

        with open(self.LOG_PATH) as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    if entry.get("model_name") == model_name and entry.get("timestamp", "") >= cutoff:
                        errors.append(entry.get("error_pct", 0.0))
                except json.JSONDecodeError:
                    continue

        if not errors:
            return {"avg_error_pct": 0.0, "max_error_pct": 0.0, "sample_count": 0}

        return {
            "avg_error_pct": round(sum(errors) / len(errors), 2),
            "max_error_pct": round(max(errors), 2),
            "min_error_pct": round(min(errors), 2),
            "sample_count": len(errors),
            "drift_detected": sum(errors) / len(errors) > 15.0,  # >15% avg error → retrain
        }

    def record_agent_outcome(
        self,
        agent_name: str,
        outcome_type: str,
        outcome_value: float,
        context: Optional[dict] = None,
    ) -> None:
        """Record agent decision outcomes for learning (e.g., campaign conversion rates)."""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "agent_name": agent_name,
            "outcome_type": outcome_type,
            "outcome_value": outcome_value,
            "context": context or {},
        }
        self.LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(self.LOG_PATH, "a") as f:
            f.write(json.dumps(entry) + "\n")

    @staticmethod
    def _log_to_mlflow(model_name: str, metrics: dict[str, float]) -> None:
        try:
            import mlflow
            with mlflow.start_run(run_name=f"{model_name}-accuracy-log", nested=True):
                for k, v in metrics.items():
                    mlflow.log_metric(k, v)
        except Exception:
            pass  # MLflow is optional


# ══════════════════════════════════════════════════════════════════════════════
# UNIFIED FACADE
# ══════════════════════════════════════════════════════════════════════════════

class AgentMemory:
    """
    Unified 3-tier memory facade.

    Usage:
        memory = AgentMemory()

        # Short-term (current session)
        memory.short.remember_anomaly("rev_2026-06-10_CRITICAL")

        # Long-term (cross-session facts)
        memory.long.remember_fact("pricing_change", "SUV", "last_change_pct", 15, "RevenueAgent", valid_days=30)
        already_priced = memory.long.was_price_recently_changed("SUV", within_days=30)

        # Historical learning
        memory.history.record_prediction_accuracy("demand_model", predicted=145.0, actual=138.0)
        drift_report = memory.history.get_rolling_accuracy("demand_model", window_days=30)
    """

    def __init__(self) -> None:
        self.short = ShortTermMemory(default_ttl_seconds=3600)
        self.long = LongTermMemory()
        self.history = HistoricalLearningMemory()

    # ── Backward-compatible shim (legacy callers) ─────────────────────────────

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        self.short.set(key, value, ttl_seconds)

    def get(self, key: str) -> Optional[Any]:
        return self.short.get(key)

    def remember_anomaly(self, anomaly_key: str, ttl_hours: int = 24) -> bool:
        return self.short.remember_anomaly(anomaly_key, ttl_hours)

    def store_orchestration_result(self, run_id: str, result: dict[str, Any]) -> None:
        self.short.set("last_orchestration", {"run_id": run_id, "result": result})
        # Also persist to long-term
        self.long.log_decision("Orchestrator", f"run_id={run_id}", run_id=run_id)

    def get_last_orchestration(self) -> Optional[dict[str, Any]]:
        return self.short.get("last_orchestration")


# ── Module singleton ──────────────────────────────────────────────────────────
agent_memory = AgentMemory()
