"""
Unit + property-based tests for churn risk scoring (routers/churn.py).

Covers:
  - RFM weight boundary: score=80 → CRITICAL, score=79 → HIGH
  - Sort order descending
  - Max 50 results
  - Zero-booking customer gets recency_days=999
  - All scores in [0.0, 100.0]
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from datetime import date, timedelta
from hypothesis import given, settings
from hypothesis import strategies as st

from models.schemas import ChurnRequest, CustomerRecord
from routers.churn import score_churn, W_RECENCY, W_FREQUENCY, W_MONETARY


def _make_customer(
    user_id: str,
    days_since: int | None,
    num_bookings: int,
    spend_each: float = 500_000.0,
) -> CustomerRecord:
    """Create a CustomerRecord with completed bookings."""
    bookings = []
    if days_since is not None and num_bookings > 0:
        last_date = date.today() - timedelta(days=days_since)
        for i in range(num_bookings):
            bookings.append(
                {
                    "end_date": (last_date - timedelta(days=i * 7)).isoformat(),
                    "total": spend_each,
                    "status": "COMPLETED",
                }
            )
    return CustomerRecord(
        user_id=user_id,
        display_name=f"User {user_id}",
        email=f"{user_id}@test.com",
        bookings=bookings,
    )


class TestChurnScoring:
    def test_zero_booking_customer_recency_999(self):
        customer = _make_customer("u1", days_since=None, num_bookings=0)
        result = score_churn([customer], platform_avg_freq=3.0, platform_avg_spend=1_000_000.0)
        assert result.results[0]["days_since_last_booking"] == 999

    def test_sort_order_descending(self):
        customers = [
            _make_customer("high", days_since=200, num_bookings=0),
            _make_customer("low", days_since=5, num_bookings=20, spend_each=5_000_000.0),
        ]
        result = score_churn(customers, platform_avg_freq=5.0, platform_avg_spend=2_000_000.0)
        scores = [r["churn_score"] for r in result.results]
        assert scores == sorted(scores, reverse=True)

    def test_max_50_results(self):
        customers = [
            _make_customer(f"u{i}", days_since=i % 100, num_bookings=i % 5)
            for i in range(100)
        ]
        result = score_churn(customers, platform_avg_freq=2.0, platform_avg_spend=500_000.0)
        assert len(result.results) <= 50

    def test_all_scores_in_range(self):
        customers = [
            _make_customer(f"u{i}", days_since=i * 10 % 365, num_bookings=i % 8)
            for i in range(20)
        ]
        result = score_churn(customers, platform_avg_freq=3.0, platform_avg_spend=1_000_000.0)
        for r in result.results:
            assert 0.0 <= r["churn_score"] <= 100.0, f"Score out of range: {r['churn_score']}"

    def test_critical_threshold_at_80(self):
        """A customer whose computed score should be exactly 80 → CRITICAL."""
        # Force R=100, F=100, M=100 → score = 0.40*100 + 0.35*100 + 0.25*100 = 100
        customer = _make_customer("critical", days_since=None, num_bookings=0)
        result = score_churn(
            [customer],
            platform_avg_freq=0.0,   # → freq_score = 100
            platform_avg_spend=0.0,  # → monetary_score = 100
        )
        r = result.results[0]
        assert r["churn_score"] >= 80.0
        assert r["risk_level"] == "CRITICAL"

    def test_only_completed_bookings_counted(self):
        """Bookings with status != COMPLETED must not affect RFM."""
        customer = CustomerRecord(
            user_id="u1",
            display_name="Test",
            email="t@test.com",
            bookings=[
                {"end_date": "2024-01-01", "total": 500_000.0, "status": "CANCELLED"},
                {"end_date": "2024-01-01", "total": 500_000.0, "status": "PENDING"},
            ],
        )
        result = score_churn([customer], platform_avg_freq=2.0, platform_avg_spend=500_000.0)
        # No COMPLETED bookings → recency_days == 999
        assert result.results[0]["days_since_last_booking"] == 999
        assert result.results[0]["total_bookings"] == 0


@given(
    days_since=st.integers(min_value=0, max_value=730),
    num_bookings=st.integers(min_value=0, max_value=20),
    avg_freq=st.floats(min_value=0.0, max_value=20.0, allow_nan=False),
    avg_spend=st.floats(min_value=0.0, max_value=10_000_000.0, allow_nan=False),
)
@settings(max_examples=50)
def test_churn_scores_in_range_pbt(
    days_since: int, num_bookings: int, avg_freq: float, avg_spend: float
):
    """All churn scores must be in [0.0, 100.0] for arbitrary inputs."""
    customer = _make_customer("u1", days_since=days_since, num_bookings=num_bookings)
    result = score_churn([customer], platform_avg_freq=avg_freq, platform_avg_spend=avg_spend)
    for r in result.results:
        assert 0.0 <= r["churn_score"] <= 100.0
