"""
Anomaly detection router — POST /ml/anomalies/detect

Algorithm: Z-score on 14-day rolling window for both revenue and bookings_count.

Rules (see spec):
  - Skip window positions where std == 0.0 (avoid division by zero)
  - Flag anomaly only when abs(z_score) > 2.0
  - CRITICAL if abs(z_score) > 3.0, else WARNING
  - Results sorted descending by date
  - Return empty list when fewer than 14 data points

Postconditions:
  - all |z_score| > 2.0
  - severity in {WARNING, CRITICAL}
  - sorted descending by date
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from fastapi import APIRouter

from models.schemas import AnomalyRequest, AnomalyResponse

router = APIRouter()

WINDOW = 14
Z_THRESHOLD = 2.0
CRITICAL_Z = 3.0


def detect_anomalies(data: list) -> AnomalyResponse:
    """
    PRECONDITIONS : len(data) >= 14
    POSTCONDITIONS:
      - all |z_score| > 2.0
      - severity == "CRITICAL" iff |z_score| > 3.0, else "WARNING"
      - result sorted descending by date string
    """
    df = pd.DataFrame([d.model_dump() for d in data])
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)
    n = len(df)

    anomalies: list[dict] = []

    for metric, col_name in [("REVENUE", "revenue"), ("BOOKINGS", "bookings_count")]:
        series = df[col_name].values.astype(float)

        # LOOP INVARIANT: at step i, window_slice has exactly WINDOW elements
        #                 from indices [i-WINDOW, i-1]
        for i in range(WINDOW, n):
            window_slice = series[i - WINDOW: i]
            mean = float(np.mean(window_slice))
            std = float(np.std(window_slice))

            if std == 0.0:
                continue  # skip to avoid division-by-zero

            z = (series[i] - mean) / std

            if abs(z) > Z_THRESHOLD:
                severity = "CRITICAL" if abs(z) > CRITICAL_Z else "WARNING"
                anomalies.append(
                    {
                        "date": df["date"].iloc[i].strftime("%Y-%m-%d"),
                        "metric_type": metric,
                        "actual_value": float(series[i]),
                        "expected_value": mean,
                        "z_score": z,
                        "severity": severity,
                    }
                )

    anomalies.sort(key=lambda x: x["date"], reverse=True)
    return AnomalyResponse(anomalies=anomalies)


@router.post("/ml/anomalies/detect", response_model=AnomalyResponse)
def anomalies_detect(request: AnomalyRequest) -> AnomalyResponse:
    """
    POST /ml/anomalies/detect

    Returns Z-score anomalies for revenue and bookings_count metrics.
    Returns empty list when fewer than 14 data points are provided.
    """
    if len(request.data) < 14:
        return AnomalyResponse(anomalies=[])

    return detect_anomalies(request.data)
