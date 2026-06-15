"""
Booking demand forecast router — POST /ml/bookings/demand

Algorithm: 7-day Simple Moving Average with day-of-week adjustment factor.

Postconditions (see spec):
  - len(daily_forecasts) == horizon  (or 0 when < 14 records)
  - all predicted_bookings >= 0.0
  - dow_distribution sums to 1.0 ± 0.001
  - peak_day in {MONDAY..SUNDAY}
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from fastapi import APIRouter

from models.schemas import (
    DemandForecastRequest,
    DemandForecastResponse,
    ForecastPoint,
)

router = APIRouter()

DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
]
WINDOW = 7


def forecast_demand(data: list, horizon: int) -> DemandForecastResponse:
    """
    PRECONDITIONS : len(data) >= 14, horizon in [1, 30]
    POSTCONDITIONS:
      - len(daily_forecasts) == horizon
      - all predicted_bookings >= 0.0
      - dow_distribution values sum to 1.0 ± 0.001
      - peak_day in DAYS
    """
    df = pd.DataFrame([d.model_dump() for d in data])
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    # Build day-of-week averages
    dow_sums = {d: 0.0 for d in DAYS}
    dow_counts = {d: 0 for d in DAYS}
    for _, row in df.iterrows():
        day_name = DAYS[row["date"].weekday()]
        dow_sums[day_name] += float(row["bookings_count"])
        dow_counts[day_name] += 1

    dow_avg = {
        d: (dow_sums[d] / dow_counts[d] if dow_counts[d] > 0 else 0.0)
        for d in DAYS
    }
    overall_mean = sum(dow_avg.values()) / 7
    peak_day = max(dow_avg, key=dow_avg.get)

    # Normalised distribution (sums to 1.0)
    total_dow = sum(dow_avg.values())
    dow_distribution = {
        d: (dow_avg[d] / total_dow if total_dow > 0 else 1.0 / 7) for d in DAYS
    }

    series = list(df["bookings_count"].values.astype(float))
    last_date = df["date"].iloc[-1]
    forecasts: list[ForecastPoint] = []

    # LOOP INVARIANT: after iteration h, len(series) == n + h + 1;
    #                 all appended predicted_bookings >= 0.0
    for h in range(horizon):
        window_slice = series[-WINDOW:]
        sma = float(np.mean(window_slice))
        std = float(np.std(window_slice))
        ci = 1.96 * std

        future_date = last_date + pd.Timedelta(days=h + 1)
        day_name = DAYS[future_date.weekday()]

        # Day-of-week multiplicative adjustment
        dow_factor = (dow_avg[day_name] / overall_mean) if overall_mean > 0 else 1.0
        adjusted = max(0.0, sma * dow_factor)

        forecasts.append(
            ForecastPoint(
                date=future_date.strftime("%Y-%m-%d"),
                predicted_bookings=adjusted,
                lower_bound=max(0.0, adjusted - ci),
                upper_bound=adjusted + ci,
            )
        )
        # Extend series for the next window
        series.append(adjusted)

    avg_daily = float(np.mean(df["bookings_count"]))

    return DemandForecastResponse(
        daily_forecasts=forecasts,
        dow_distribution=dow_distribution,
        peak_day=peak_day,
        avg_daily_demand=avg_daily,
    )


@router.post("/ml/bookings/demand", response_model=DemandForecastResponse)
def bookings_demand(request: DemandForecastRequest) -> DemandForecastResponse:
    """
    POST /ml/bookings/demand

    Returns a 7-day SMA + DoW-adjusted demand forecast.
    Returns empty daily_forecasts when fewer than 14 data points are supplied.
    """
    if len(request.data) < 14:
        return DemandForecastResponse(
            daily_forecasts=[],
            dow_distribution={d: 1.0 / 7 for d in DAYS},
            peak_day="MONDAY",
            avg_daily_demand=0.0,
        )

    return forecast_demand(request.data, request.horizon)
