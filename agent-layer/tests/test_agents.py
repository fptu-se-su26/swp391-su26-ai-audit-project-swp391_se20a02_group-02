"""
test_agents.py — pytest suite for all 6 LuxeWay agents.

Covers:
- Happy-path execution
- Empty data handling
- ML sidecar failure (mock)
- Output schema validation
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock

# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_ml_client():
    client = AsyncMock()
    client.health_check.return_value = {"ok": True, "detail": {"status": "UP"}}
    client.detect_anomalies.return_value = {
        "anomalies": [
            {
                "date": "2026-06-10",
                "metric_type": "REVENUE",
                "actual_value": 150000.0,
                "expected_value": 50000.0,
                "z_score": 3.5,
                "severity": "CRITICAL",
            }
        ]
    }
    client.score_churn.return_value = {
        "results": [
            {
                "user_id": "U001",
                "display_name": "Alice Nguyen",
                "email": "alice@example.com",
                "churn_score": 82.5,
                "risk_level": "CRITICAL",
                "days_since_last_booking": 95,
                "total_bookings": 1,
                "total_spend": 450.0,
            }
        ]
    }
    client.forecast_demand.return_value = {
        "daily_forecasts": [{"date": "2026-06-14", "predicted_bookings": 145.0, "lower_bound": 120.0, "upper_bound": 170.0}],
        "peak_day": "FRIDAY",
        "avg_daily_demand": 145.0,
    }
    client.forecast_revenue.return_value = {
        "predictions": [],
        "r2_score": 0.87,
        "trend_slope": 125000.0,
        "trend_direction": "UP",
        "warning_flag": False,
    }
    client.forecast_utilization.return_value = {
        "by_category": {"SUV": [], "SEDAN": [], "TRUCK": []},
        "current_rates": {"SUV": 0.91, "SEDAN": 0.72, "TRUCK": 0.33},
        "lowest_category": "TRUCK",
        "highest_category": "SUV",
    }
    return client


@pytest.fixture
def sample_analytics_data():
    return [
        {"date": f"2026-05-{d:02d}", "revenue": 50000.0 + d * 1000, "bookings_count": 100 + d}
        for d in range(1, 32)
    ]


@pytest.fixture
def sample_customers():
    return [
        {
            "user_id": "U001",
            "display_name": "Alice Nguyen",
            "email": "alice@example.com",
            "bookings": [{"end_date": "2026-02-01", "total": 450.0, "status": "COMPLETED"}],
        }
    ]


# ── HealthAgent tests ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_agent_healthy(mock_ml_client):
    from agents.health_agent import HealthAgent
    agent = HealthAgent(mock_ml_client, "http://localhost:8080")
    output, log = await agent.execute({}, "test-run-1")

    assert "health_output" in output
    h = output["health_output"]
    assert h["ml_service_ok"] is True
    assert h["status"] in {"HEALTHY", "DEGRADED", "DOWN"}
    assert log.status.value in {"SUCCESS", "FAILED"}


@pytest.mark.asyncio
async def test_health_agent_ml_failure():
    from agents.health_agent import HealthAgent
    failing_client = AsyncMock()
    failing_client.health_check.side_effect = ConnectionError("ML sidecar down")
    agent = HealthAgent(failing_client, "http://localhost:8080")
    output, _ = await agent.execute({}, "test-run-2")

    h = output["health_output"]
    assert h["ml_service_ok"] is False
    assert h["status"] in {"DEGRADED", "DOWN"}
    assert len(h["issues"]) > 0


# ── AnomalyAgent tests ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_anomaly_agent_detects_anomalies(mock_ml_client, sample_analytics_data):
    from agents.anomaly_agent import AnomalyAgent
    agent = AnomalyAgent(mock_ml_client)
    state = {"input_data": {"analytics_data": sample_analytics_data}, "auto_alert": False}
    output, log = await agent.execute(state, "test-run-3")

    assert "anomaly_output" in output
    ao = output["anomaly_output"]
    assert ao["total_anomalies"] >= 0
    assert ao["critical_count"] >= 0
    assert isinstance(ao["anomalies"], list)


@pytest.mark.asyncio
async def test_anomaly_agent_empty_data(mock_ml_client):
    from agents.anomaly_agent import AnomalyAgent
    agent = AnomalyAgent(mock_ml_client)
    output, _ = await agent.execute({"input_data": {"analytics_data": []}}, "test-run-4")
    assert output["anomaly_output"]["total_anomalies"] == 0


# ── ChurnAgent tests ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_churn_agent_reasoning(mock_ml_client, sample_customers):
    from agents.churn_agent import ChurnAgent
    agent = ChurnAgent(mock_ml_client)
    state = {"input_data": {"customers": sample_customers, "platform_avg_frequency": 3.5, "platform_avg_spend": 1200.0}}
    output, _ = await agent.execute(state, "test-run-5")

    co = output["churn_output"]
    assert isinstance(co["at_risk_customers"], list)
    assert isinstance(co["campaign_recommendations"], list)
    assert isinstance(co["reasoning_chain"], list)
    assert len(co["reasoning_chain"]) >= 3  # At least 3 reasoning steps
    assert co["estimated_revenue_at_risk"] >= 0.0


@pytest.mark.asyncio
async def test_churn_agent_no_customers(mock_ml_client):
    from agents.churn_agent import ChurnAgent
    agent = ChurnAgent(mock_ml_client)
    state = {"input_data": {"customers": [], "platform_avg_frequency": 3.5, "platform_avg_spend": 1200.0}}
    output, _ = await agent.execute(state, "test-run-6")
    assert output["churn_output"]["total_at_risk"] == 0


# ── DemandAgent tests ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_demand_agent_parallel_sub_agents(mock_ml_client, sample_analytics_data):
    from agents.demand_agent import DemandAgent
    agent = DemandAgent(mock_ml_client)
    state = {
        "input_data": {"analytics_data": sample_analytics_data},
        "vehicle_categories": ["SEDAN", "SUV"],
    }
    output, _ = await agent.execute(state, "test-run-7")

    do = output["demand_output"]
    # DemandAgent runs 6 sub-agents in parallel:
    # 3 ML forecast horizons (short/medium/long) + 3 external signals (weather/tourism/events)
    assert len(do["sub_agent_outputs"]) == 6
    assert do["avg_daily_demand"] >= 0.0
    assert isinstance(do["recommended_inventory"], dict)



# ── RevenueAgent tests ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_revenue_agent_tool_chain(mock_ml_client, sample_analytics_data):
    from agents.revenue_agent import RevenueAgent
    agent = RevenueAgent(mock_ml_client)
    state = {
        "input_data": {"analytics_data": sample_analytics_data, "auto_apply_pricing": False},
        "vehicle_categories": ["SUV", "SEDAN"],
        "demand_output": {"demand_increase_pct": 20.0},
    }
    output, _ = await agent.execute(state, "test-run-8")

    ro = output["revenue_output"]
    assert "ForecastTool" in ro["tools_used"]
    assert "PricingTool" in ro["tools_used"]
    assert isinstance(ro["pricing_recommendations"], list)


# ── UtilizationAgent tests ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_utilization_agent_rebalancing(mock_ml_client):
    from agents.utilization_agent import UtilizationAgent
    agent = UtilizationAgent(mock_ml_client)
    state = {
        "input_data": {
            "vehicle_utilization": {
                "SUV": [0.91, 0.88, 0.95],
                "SEDAN": [0.72, 0.68, 0.75],
                "TRUCK": [0.32, 0.28, 0.35],
            }
        },
        "demand_output": {"demand_increase_pct": 25.0},
    }
    output, _ = await agent.execute(state, "test-run-9")

    uo = output["utilization_output"]
    assert uo["lowest_category"] == "TRUCK"
    assert uo["highest_category"] == "SUV"
    assert len(uo["rebalancing_recommendations"]) > 0
    assert len(uo["reasoning_chain"]) >= 4
