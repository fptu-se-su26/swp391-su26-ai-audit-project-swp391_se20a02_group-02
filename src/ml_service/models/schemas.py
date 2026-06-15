"""
Pydantic request/response schemas for the LuxeWay ML sidecar.
All models follow strict validation rules as defined in the spec.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, field_validator


# ---------------------------------------------------------------------------
# Shared primitives
# ---------------------------------------------------------------------------

class AnalyticsDataPoint(BaseModel):
    date: str
    revenue: float
    bookings_count: int


class ForecastPoint(BaseModel):
    date: str
    predicted_revenue: Optional[float] = None
    predicted_bookings: Optional[float] = None
    lower_bound: float
    upper_bound: float


# ---------------------------------------------------------------------------
# Revenue Forecast
# ---------------------------------------------------------------------------

class RevenueForecastRequest(BaseModel):
    data: list[AnalyticsDataPoint]
    horizon: int

    @field_validator("horizon")
    @classmethod
    def validate_horizon(cls, v: int) -> int:
        if v < 1 or v > 30:
            raise ValueError("horizon must be between 1 and 30 (inclusive)")
        return v


class RevenueForecastResponse(BaseModel):
    predictions: list[ForecastPoint]
    r2_score: float
    trend_slope: float
    trend_direction: str   # "UP" | "DOWN" | "STABLE"
    warning_flag: bool


# ---------------------------------------------------------------------------
# Booking Demand Forecast
# ---------------------------------------------------------------------------

class DemandForecastRequest(BaseModel):
    data: list[AnalyticsDataPoint]
    horizon: int

    @field_validator("horizon")
    @classmethod
    def validate_horizon(cls, v: int) -> int:
        if v < 1 or v > 30:
            raise ValueError("horizon must be between 1 and 30 (inclusive)")
        return v


class DemandForecastResponse(BaseModel):
    daily_forecasts: list[ForecastPoint]
    dow_distribution: dict[str, float]   # {"MONDAY": 0.18, ...} summing to 1.0
    peak_day: str
    avg_daily_demand: float


# ---------------------------------------------------------------------------
# Vehicle Utilization Forecast
# ---------------------------------------------------------------------------

class UtilizationRequest(BaseModel):
    by_category: dict[str, list[float]]
    forecast_days: int


class UtilizationForecastPoint(BaseModel):
    date: str = ""
    predicted: float
    lower_bound: float
    upper_bound: float


class UtilizationResponse(BaseModel):
    by_category: dict[str, list[UtilizationForecastPoint]]
    current_rates: dict[str, float]
    lowest_category: str
    highest_category: str


# ---------------------------------------------------------------------------
# Churn Risk Scoring
# ---------------------------------------------------------------------------

class CustomerRecord(BaseModel):
    user_id: str
    display_name: str
    email: str
    bookings: list[dict]   # [{end_date: str, total: float, status: str}, ...]


class ChurnRequest(BaseModel):
    customers: list[CustomerRecord]
    platform_avg_frequency: float
    platform_avg_spend: float


class ChurnResponse(BaseModel):
    results: list[dict]   # ChurnRiskDTO fields


# ---------------------------------------------------------------------------
# Anomaly Detection
# ---------------------------------------------------------------------------

class AnomalyRequest(BaseModel):
    data: list[AnalyticsDataPoint]


class AnomalyResponse(BaseModel):
    anomalies: list[dict]   # AnomalyDTO fields
