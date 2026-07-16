"""
Unit + property-based tests for revenue forecast (routers/revenue.py).

Covers:
  - horizon coverage: len(predictions) == horizon
  - non-negativity: all predicted_revenue >= 0.0
  - CI ordering: lower_bound <= predicted_revenue <= upper_bound
  - R² bounds: r2_score in [0.0, 1.0]
  - OLS exception triggers SMA fallback with warning_flag=True
  - < 14 records returns empty predictions
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from models.schemas import AnalyticsDataPoint, RevenueForecastRequest
from routers.revenue import forecast_revenue, _sma_revenue_fallback
import pandas as pd


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_data(n: int) -> list[AnalyticsDataPoint]:
    """Generate n days of deterministic analytics data."""
    from datetime import date, timedelta
    base = date(2024, 1, 1)
    return [
        AnalyticsDataPoint(
            date=(base + timedelta(days=i)).isoformat(),
            revenue=float(100_000 + i * 5_000 + (i % 7) * 10_000),
            bookings_count=10 + i % 5,
        )
        for i in range(n)
    ]


# ---------------------------------------------------------------------------
# Unit tests
# ---------------------------------------------------------------------------

class TestRevenueForecast:
    def test_horizon_coverage(self):
        data = make_data(30)
        for horizon in [1, 7, 14, 30]:
            result = forecast_revenue(data, horizon)
            assert len(result.predictions) == horizon, (
                f"Expected {horizon} predictions, got {len(result.predictions)}"
            )

    def test_non_negativity(self):
        data = make_data(30)
        result = forecast_revenue(data, 14)
        for p in result.predictions:
            assert p.predicted_revenue >= 0.0

    def test_ci_ordering(self):
        data = make_data(30)
        result = forecast_revenue(data, 14)
        for p in result.predictions:
            assert p.lower_bound <= p.predicted_revenue <= p.upper_bound, (
                f"CI violated: [{p.lower_bound}, {p.predicted_revenue}, {p.upper_bound}]"
            )

    def test_r2_bounds(self):
        data = make_data(60)
        result = forecast_revenue(data, 7)
        assert 0.0 <= result.r2_score <= 1.0

    def test_ols_exception_triggers_fallback(self):
        """All-identical revenue values → singular matrix → SMA fallback."""
        from datetime import date, timedelta
        base = date(2024, 1, 1)
        data = [
            AnalyticsDataPoint(
                date=(base + timedelta(days=i)).isoformat(),
                revenue=50_000.0,   # constant → singular OLS matrix
                bookings_count=5,
            )
            for i in range(20)
        ]
        result = forecast_revenue(data, 7)
        assert result.warning_flag is True

    def test_fewer_than_14_returns_empty_via_endpoint(self):
        from routers.revenue import revenue_forecast
        request = RevenueForecastRequest(data=make_data(10), horizon=7)
        result = revenue_forecast(request)
        assert result.predictions == []
        assert result.r2_score == 0.0

    def test_sma_fallback_warning_flag(self):
        df = pd.DataFrame(
            [{"date": f"2024-01-{i+1:02d}", "revenue": 50_000.0, "bookings_count": 5}
             for i in range(20)]
        )
        df["date"] = pd.to_datetime(df["date"])
        result = _sma_revenue_fallback(df, 7)
        assert result.warning_flag is True
        assert len(result.predictions) == 7


# ---------------------------------------------------------------------------
# Property-based tests
# ---------------------------------------------------------------------------

@given(horizon=st.integers(min_value=1, max_value=30))
@settings(max_examples=30)
def test_revenue_horizon_coverage_pbt(horizon: int):
    """For any valid horizon, predictions length equals horizon."""
    data = make_data(30)
    result = forecast_revenue(data, horizon)
    assert len(result.predictions) == horizon


@given(horizon=st.integers(min_value=1, max_value=30))
@settings(max_examples=20)
def test_revenue_non_negativity_pbt(horizon: int):
    """All predicted_revenue values are >= 0.0 for any valid horizon."""
    data = make_data(30)
    result = forecast_revenue(data, horizon)
    for p in result.predictions:
        assert p.predicted_revenue >= 0.0
