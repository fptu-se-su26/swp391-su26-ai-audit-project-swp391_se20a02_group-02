"""
Revenue forecast router — POST /ml/revenue/forecast

Algorithm: OLS linear regression with day-of-week one-hot encoding
           (statsmodels), falling back to 7-day SMA on any exception.

Postconditions (see spec):
  - len(predictions) == horizon
  - all predicted_revenue >= 0.0
  - all lower_bound <= predicted_revenue <= upper_bound
  - r2_score in [0.0, 1.0]
  - warning_flag=True when SMA fallback was used
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from fastapi import APIRouter
from statsmodels.regression.linear_model import OLS

from models.schemas import (
    ForecastPoint,
    RevenueForecastRequest,
    RevenueForecastResponse,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Fallback: 7-day Simple Moving Average
# ---------------------------------------------------------------------------

def _sma_revenue_fallback(df: pd.DataFrame, horizon: int) -> RevenueForecastResponse:
    """Return a simplified 7-day SMA forecast with warning_flag=True."""
    series = df["revenue"].values.astype(float)
    last_date = df["date"].iloc[-1]
    window = series[-7:] if len(series) >= 7 else series
    sma = float(np.mean(window))
    std = float(np.std(window)) if len(window) > 1 else 0.0
    ci = 1.96 * std

    predictions: list[ForecastPoint] = []
    for h in range(horizon):
        future_date = last_date + pd.Timedelta(days=h + 1)
        lower = max(0.0, sma - ci)
        upper = sma + ci
        predictions.append(
            ForecastPoint(
                date=future_date.strftime("%Y-%m-%d"),
                predicted_revenue=max(0.0, sma),
                lower_bound=lower,
                upper_bound=upper,
            )
        )

    return RevenueForecastResponse(
        predictions=predictions,
        r2_score=0.0,
        trend_slope=0.0,
        trend_direction="STABLE",
        warning_flag=True,
    )


# ---------------------------------------------------------------------------
# Main algorithm: OLS with seasonal day-of-week features
# ---------------------------------------------------------------------------

def forecast_revenue(data: list[dict], horizon: int) -> RevenueForecastResponse:
    """
    PRECONDITIONS : len(data) >= 14, horizon in [1, 30]
    POSTCONDITIONS:
      - len(predictions) == horizon
      - all predicted_revenue >= 0.0
      - all lower_bound <= predicted_revenue <= upper_bound
      - r2_score in [0.0, 1.0]
    """
    df = pd.DataFrame([d.model_dump() for d in data])
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)
    n = len(df)

    # Feature matrix: [day_index, Mon..Sat one-hot (Sun=baseline), intercept]
    X = np.zeros((n, 8))
    X[:, 0] = np.arange(n)                     # linear trend
    for i, row in df.iterrows():
        dow = row["date"].weekday()             # 0=Mon … 6=Sun
        if dow < 6:
            X[i, dow + 1] = 1.0
    X[:, 7] = 1.0                              # intercept column

    y = df["revenue"].values.astype(float)

    try:
        model = OLS(y, X).fit()
        params = model.params
        r2 = max(0.0, min(1.0, float(model.rsquared)))
        ci_95 = 1.96 * float(np.std(model.resid))
        warning_flag = False
    except Exception:
        # Any OLS failure → 7-day SMA fallback
        return _sma_revenue_fallback(df, horizon)

    last_date = df["date"].iloc[-1]
    predictions: list[ForecastPoint] = []

    # LOOP INVARIANT: after iteration h, predictions[0..h-1] all have
    #                 predicted_revenue >= 0.0 and CI ordering satisfied
    for h in range(horizon):
        future_date = last_date + pd.Timedelta(days=h + 1)
        x_row = np.zeros(8)
        x_row[0] = n + h
        dow = future_date.weekday()
        if dow < 6:
            x_row[dow + 1] = 1.0
        x_row[7] = 1.0

        raw_pred = float(params @ x_row)
        predicted = max(0.0, raw_pred)
        lower = max(0.0, predicted - ci_95)
        upper = predicted + ci_95

        predictions.append(
            ForecastPoint(
                date=future_date.strftime("%Y-%m-%d"),
                predicted_revenue=predicted,
                lower_bound=lower,
                upper_bound=upper,
            )
        )

    slope = float(params[0])
    if slope > 50000:
        trend = "UP"
    elif slope < -50000:
        trend = "DOWN"
    else:
        trend = "STABLE"

    return RevenueForecastResponse(
        predictions=predictions,
        r2_score=r2,
        trend_slope=slope,
        trend_direction=trend,
        warning_flag=warning_flag,
    )


# ---------------------------------------------------------------------------
# FastAPI endpoint
# ---------------------------------------------------------------------------

@router.post("/ml/revenue/forecast", response_model=RevenueForecastResponse)
def revenue_forecast(request: RevenueForecastRequest) -> RevenueForecastResponse:
    """
    POST /ml/revenue/forecast

    Returns an OLS-based revenue forecast for the requested horizon.
    Falls back to 7-day SMA (warning_flag=True) if OLS fails.
    Returns empty predictions list when fewer than 14 data points are provided.
    """
    if len(request.data) < 14:
        return RevenueForecastResponse(
            predictions=[],
            r2_score=0.0,
            trend_slope=0.0,
            trend_direction="STABLE",
            warning_flag=False,
        )

    return forecast_revenue(request.data, request.horizon)
