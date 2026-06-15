"""
Churn risk scoring router — POST /ml/churn/score

Algorithm: RFM (Recency-Frequency-Monetary) weighted composite scoring.

Weights  : R=0.40, F=0.35, M=0.25
Thresholds: CRITICAL >= 80, HIGH >= 60, MEDIUM >= 40, LOW < 40

Postconditions (see spec):
  - all churn_score in [0.0, 100.0]
  - results sorted descending by churn_score
  - len(results) <= 50
  - customers with no completed bookings get recency_days=999
"""
from __future__ import annotations

from datetime import date

import pandas as pd
from fastapi import APIRouter

from models.schemas import ChurnRequest, ChurnResponse

router = APIRouter()

MAX_RESULTS = 50

# RFM weights
W_RECENCY = 0.40
W_FREQUENCY = 0.35
W_MONETARY = 0.25


def score_churn(
    customers: list,
    platform_avg_freq: float,
    platform_avg_spend: float,
) -> ChurnResponse:
    """
    PRECONDITIONS : platform_avg_freq >= 0, platform_avg_spend >= 0
    POSTCONDITIONS:
      - all churn_score in [0.0, 100.0]
      - results sorted descending by churn_score
      - len(results) <= 50
    """
    today = date.today()
    results: list[dict] = []

    for customer in customers:
        # Only count COMPLETED bookings for RFM
        completed = [
            b for b in customer.bookings if b.get("status") == "COMPLETED"
        ]

        # --- Recency ---
        if not completed:
            recency_days = 999
        else:
            last_date = max(
                pd.to_datetime(b["end_date"]).date() for b in completed
            )
            recency_days = (today - last_date).days

        recency_score = min(100.0, recency_days / 90.0 * 100.0)

        # --- Frequency ---
        freq = len(completed)
        if platform_avg_freq > 0:
            freq_score = max(
                0.0,
                min(100.0, (1.0 - freq / (platform_avg_freq * 2.0)) * 100.0),
            )
        else:
            freq_score = 100.0

        # --- Monetary ---
        spend = sum(float(b.get("total", 0)) for b in completed)
        if platform_avg_spend > 0:
            monetary_score = max(
                0.0,
                min(
                    100.0,
                    (1.0 - spend / (platform_avg_spend * 2.0)) * 100.0,
                ),
            )
        else:
            monetary_score = 100.0

        # Weighted composite — LOOP INVARIANT: churn_score in [0.0, 100.0]
        churn_score = (
            W_RECENCY * recency_score
            + W_FREQUENCY * freq_score
            + W_MONETARY * monetary_score
        )
        # Scores are already bounded [0,100] individually, so composite is too

        if churn_score >= 80:
            risk_level = "CRITICAL"
        elif churn_score >= 60:
            risk_level = "HIGH"
        elif churn_score >= 40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        results.append(
            {
                "user_id": customer.user_id,
                "display_name": customer.display_name,
                "email": customer.email,
                "churn_score": churn_score,
                "risk_level": risk_level,
                "days_since_last_booking": recency_days,
                "total_bookings": freq,
                "total_spend": spend,
            }
        )

    results.sort(key=lambda x: x["churn_score"], reverse=True)
    return ChurnResponse(results=results[:MAX_RESULTS])


@router.post("/ml/churn/score", response_model=ChurnResponse)
def churn_score(request: ChurnRequest) -> ChurnResponse:
    """
    POST /ml/churn/score

    Returns RFM-scored churn risk list, sorted descending, capped at 50.
    """
    return score_churn(
        request.customers,
        request.platform_avg_frequency,
        request.platform_avg_spend,
    )
