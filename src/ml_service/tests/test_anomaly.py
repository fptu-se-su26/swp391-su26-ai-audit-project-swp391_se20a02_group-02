"""
Unit + property-based tests for anomaly detection (routers/anomaly.py).

Covers:
  - Z-score threshold: |z| <= 2.0 entries are NOT flagged
  - std=0 window is skipped (no division by zero)
  - CRITICAL vs WARNING severity assignment
  - Empty input (< 14 records) returns empty list
  - All returned anomalies satisfy |z_score| > 2.0
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from datetime import date, timedelta
from hypothesis import given, settings
from hypothesis import strategies as st

from models.schemas import AnalyticsDataPoint, AnomalyRequest
from routers.anomaly import detect_anomalies, WINDOW, Z_THRESHOLD


def make_data(n: int, spike_index: int | None = None, spike_value: float = 0.0) -> list[AnalyticsDataPoint]:
    base = date(2024, 1, 1)
    rows = []
    for i in range(n):
        revenue = 100_000.0
        if spike_index is not None and i == spike_index:
            revenue = spike_value
        rows.append(
            AnalyticsDataPoint(
                date=(base + timedelta(days=i)).isoformat(),
                revenue=revenue,
                bookings_count=10,
            )
        )
    return rows


class TestAnomalyDetection:
    def test_fewer_than_14_returns_empty(self):
        from routers.anomaly import anomalies_detect
        request = AnomalyRequest(data=make_data(10))
        result = anomalies_detect(request)
        assert result.anomalies == []

    def test_no_anomaly_in_flat_series(self):
        """Constant revenue and bookings → std=0 → all windows skipped → no anomalies."""
        data = make_data(30)  # all revenue=100_000, bookings=10
        result = detect_anomalies(data)
        # std=0 in constant series → all positions skipped
        assert result.anomalies == []

    def test_large_spike_detected(self):
        """Insert a massive revenue spike that should clearly exceed z>2."""
        n = 30
        spike_idx = 25
        data = make_data(n, spike_index=spike_idx, spike_value=10_000_000_000.0)
        result = detect_anomalies(data)
        assert len(result.anomalies) > 0

    def test_all_anomalies_exceed_z_threshold(self):
        """Every returned anomaly must have |z_score| > 2.0."""
        data = make_data(30, spike_index=25, spike_value=50_000_000.0)
        result = detect_anomalies(data)
        for a in result.anomalies:
            assert abs(a["z_score"]) > Z_THRESHOLD

    def test_critical_severity_for_z_above_3(self):
        """A spike with |z| > 3 → CRITICAL."""
        data = make_data(30, spike_index=25, spike_value=1_000_000_000.0)
        result = detect_anomalies(data)
        critical = [a for a in result.anomalies if a["severity"] == "CRITICAL"]
        assert len(critical) > 0, "Expected at least one CRITICAL anomaly"

    def test_sorted_descending_by_date(self):
        data = make_data(40, spike_index=30, spike_value=1_000_000_000.0)
        # Add a second spike earlier
        data[20] = AnalyticsDataPoint(
            date=data[20].date,
            revenue=999_999_999.0,
            bookings_count=10,
        )
        result = detect_anomalies(data)
        if len(result.anomalies) > 1:
            dates = [a["date"] for a in result.anomalies]
            assert dates == sorted(dates, reverse=True)

    def test_std_zero_skipped(self):
        """Window with std=0 should not produce any anomaly entries."""
        # All revenue same for first 20, single spike later — std=0 window skipped
        data = make_data(20)
        result = detect_anomalies(data)
        # No anomalies since std=0 every window
        assert result.anomalies == []


@given(
    n=st.integers(min_value=14, max_value=90),
    spike_val=st.floats(min_value=1e9, max_value=1e12, allow_nan=False),
)
@settings(max_examples=30)
def test_anomaly_z_scores_exceed_threshold_pbt(n: int, spike_val: float):
    """All returned anomalies must have |z_score| > 2.0."""
    data = make_data(n, spike_index=n - 1, spike_value=spike_val)
    result = detect_anomalies(data)
    for a in result.anomalies:
        assert abs(a["z_score"]) > Z_THRESHOLD
