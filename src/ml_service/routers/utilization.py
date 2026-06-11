"""
Vehicle utilization forecast router — POST /ml/vehicles/utilization

Algorithm: Holt-Winters Simple Exponential Smoothing (statsmodels)
           with smoothing_level=0.3.

Postconditions (see spec):
  - all predicted values in [0.0, 1.0]
  - flat CI band ±0.05 clamped to [0.0, 1.0]
  - categories with < 2 data points use flat forecast (last known value)
  - lowest_category / highest_category set from current_rates
"""
from __future__ import annotations

from fastapi import APIRouter
from statsmodels.tsa.holtwinters import SimpleExpSmoothing

from models.schemas import (
    UtilizationForecastPoint,
    UtilizationRequest,
    UtilizationResponse,
)

router = APIRouter()

CI_BAND = 0.05  # flat ±0.05 confidence interval


def forecast_utilization(
    by_category: dict[str, list[float]], forecast_days: int
) -> UtilizationResponse:
    """
    PRECONDITIONS : forecast_days in [1, 30]; each category list has >= 1 point
    POSTCONDITIONS:
      - all predicted values in [0.0, 1.0]
      - len(by_category[cat]) == forecast_days for each category
      - lowest_category and highest_category come from current_rates
    """
    result_by_cat: dict[str, list[UtilizationForecastPoint]] = {}
    current_rates: dict[str, float] = {}

    for cat, raw_rates in by_category.items():
        # Clamp all input values to [0.0, 1.0]
        rates = [max(0.0, min(1.0, float(v))) for v in raw_rates]
        current_rates[cat] = rates[-1] if rates else 0.0

        if len(rates) < 2:
            # Not enough data — use flat forecast at last known value
            val = rates[0] if rates else 0.0
            forecasts = [
                UtilizationForecastPoint(
                    predicted=val,
                    lower_bound=max(0.0, val - CI_BAND),
                    upper_bound=min(1.0, val + CI_BAND),
                )
                for _ in range(forecast_days)
            ]
        else:
            model = SimpleExpSmoothing(
                rates, initialization_method="estimated"
            ).fit(smoothing_level=0.3, optimized=False)
            raw_forecast = model.forecast(forecast_days)

            forecasts = []
            # LOOP INVARIANT: all emitted predicted values in [0.0, 1.0]
            for raw_val in raw_forecast:
                val = max(0.0, min(1.0, float(raw_val)))
                forecasts.append(
                    UtilizationForecastPoint(
                        predicted=val,
                        lower_bound=max(0.0, val - CI_BAND),
                        upper_bound=min(1.0, val + CI_BAND),
                    )
                )

        result_by_cat[cat] = forecasts

    lowest = (
        min(current_rates, key=current_rates.get) if current_rates else ""
    )
    highest = (
        max(current_rates, key=current_rates.get) if current_rates else ""
    )

    return UtilizationResponse(
        by_category=result_by_cat,
        current_rates=current_rates,
        lowest_category=lowest,
        highest_category=highest,
    )


@router.post("/ml/vehicles/utilization", response_model=UtilizationResponse)
def vehicle_utilization(request: UtilizationRequest) -> UtilizationResponse:
    """
    POST /ml/vehicles/utilization

    Returns per-category SES utilization forecasts for forecast_days days.
    """
    return forecast_utilization(request.by_category, request.forecast_days)
