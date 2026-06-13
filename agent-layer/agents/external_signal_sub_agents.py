"""
external_signal_sub_agents.py — External Knowledge Sub-Agents for Demand Forecasting

Addresses reviewer feedback #2:
  "Demand Forecasting may be over-engineered as Multi-Agent unless independent
   external knowledge sources (weather, events, tourism trends) are incorporated."

Resolution:
  Three sub-agents pull real external signals that genuinely benefit from
  independent, parallel execution. Each adds a non-overlapping demand modifier.

Sub-Agents:
  WeatherSubAgent       → OpenMeteo API (free, no key required)
  TourismTrendSubAgent  → Configurable tourism index API
  LocalEventSubAgent    → Configurable local events API
"""
from __future__ import annotations

import logging
from datetime import date, timedelta
from typing import Any, Optional

import httpx

logger = logging.getLogger("luxeway.agents.external_signals")


class WeatherSubAgent:
    """
    Fetches weather forecasts from Open-Meteo API (free, no API key).

    Demand signal logic:
      - Sunny/clear days   → +5–10% vehicle rental demand (tourist/leisure trips)
      - Rain/storm days    → -10–15% demand (people avoid trips)
      - Extreme heat (>38°C) → -5% demand (comfort concerns)
    """

    OPENMETEO_URL = "https://api.open-meteo.com/v1/forecast"

    # Hanoi coordinates (default for LuxeWay)
    DEFAULT_LAT = 21.0285
    DEFAULT_LON = 105.8542

    async def run(
        self,
        horizon_days: int = 7,
        latitude: float = DEFAULT_LAT,
        longitude: float = DEFAULT_LON,
    ) -> dict[str, Any]:
        """
        Returns:
            {
              "source": "weather",
              "demand_modifier_pct": 8.5,   ← e.g. good weather → +8.5% demand
              "signal_strength": "MEDIUM",
              "summary": "Mostly sunny over next 7 days — outdoor travel expected to increase.",
              "raw_forecast": {...}
            }
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(
                    self.OPENMETEO_URL,
                    params={
                        "latitude": latitude,
                        "longitude": longitude,
                        "daily": "weathercode,temperature_2m_max,precipitation_sum",
                        "forecast_days": min(horizon_days, 7),
                        "timezone": "Asia/Ho_Chi_Minh",
                    },
                )
                resp.raise_for_status()
                data = resp.json()

            daily = data.get("daily", {})
            codes = daily.get("weathercode", [])
            temps = daily.get("temperature_2m_max", [])
            precips = daily.get("precipitation_sum", [])

            # WMO weather codes: 0-3 = clear/partly cloudy, 61-67 = rain, 95-99 = storm
            clear_days = sum(1 for c in codes if c in range(0, 4))
            rainy_days = sum(1 for c in codes if c in range(61, 100))
            total_days = len(codes) or 1

            # Compute modifier
            clear_ratio = clear_days / total_days
            rain_ratio = rainy_days / total_days
            avg_temp = sum(temps) / len(temps) if temps else 28.0

            demand_modifier = (clear_ratio * 8.0) - (rain_ratio * 12.0)
            if avg_temp > 38:
                demand_modifier -= 5.0

            demand_modifier = max(-20.0, min(15.0, demand_modifier))

            if demand_modifier > 5:
                signal = "POSITIVE"
                summary = f"Mostly clear weather ({clear_days}/{total_days} days) favours outdoor travel."
            elif demand_modifier < -5:
                signal = "NEGATIVE"
                summary = f"Significant rainfall expected ({rainy_days}/{total_days} days) may reduce bookings."
            else:
                signal = "NEUTRAL"
                summary = "Mixed weather — minimal demand impact expected."

            return {
                "source": "weather",
                "demand_modifier_pct": round(demand_modifier, 2),
                "signal_strength": signal,
                "summary": summary,
                "horizon_days": horizon_days,
                "raw": {"clear_days": clear_days, "rainy_days": rainy_days, "avg_temp": round(avg_temp, 1)},
            }

        except Exception as exc:
            logger.warning(f"WeatherSubAgent failed: {exc}")
            return {
                "source": "weather",
                "demand_modifier_pct": 0.0,
                "signal_strength": "UNAVAILABLE",
                "summary": f"Weather data unavailable: {exc}",
                "error": str(exc),
            }


class TourismTrendSubAgent:
    """
    Fetches tourism trend index from a configurable endpoint.

    In production: integrate with Vietnam Tourism Authority API or Google Trends API.
    Fallback: uses seasonal heuristics (Vietnamese holidays, peak seasons).

    Demand signal: tourism index → demand multiplier for vehicle rentals.
    """

    TOURISM_API_URL: Optional[str] = None  # Set via TOURISM_API_URL env var

    VIETNAM_PEAK_MONTHS = {1, 2, 4, 6, 7, 8, 12}   # Tết, summer, school holidays
    VIETNAM_LOW_MONTHS  = {3, 9, 10, 11}

    async def run(self, horizon_days: int = 30) -> dict[str, Any]:
        """
        Returns demand_modifier_pct based on tourism season.
        When tourism API is configured, uses real data; otherwise uses seasonal calendar.
        """
        import os
        api_url = os.getenv("TOURISM_API_URL", self.TOURISM_API_URL)

        if api_url:
            return await self._fetch_from_api(api_url, horizon_days)
        else:
            return self._seasonal_heuristic(horizon_days)

    async def _fetch_from_api(self, url: str, horizon_days: int) -> dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params={"horizon": horizon_days})
                resp.raise_for_status()
                data = resp.json()
                modifier = float(data.get("demand_modifier_pct", 0.0))
                return {
                    "source": "tourism_api",
                    "demand_modifier_pct": modifier,
                    "signal_strength": "HIGH" if abs(modifier) > 10 else "MEDIUM",
                    "summary": data.get("summary", "Tourism API data received."),
                }
        except Exception as exc:
            logger.warning(f"Tourism API failed, falling back to heuristic: {exc}")
            return self._seasonal_heuristic(horizon_days)

    def _seasonal_heuristic(self, horizon_days: int) -> dict[str, Any]:
        current_month = date.today().month
        future_month = (date.today() + timedelta(days=horizon_days // 2)).month

        if future_month in self.VIETNAM_PEAK_MONTHS:
            modifier = 12.0
            summary = f"Month {future_month} is a Vietnamese peak travel season — tourism demand elevated."
            strength = "HIGH"
        elif future_month in self.VIETNAM_LOW_MONTHS:
            modifier = -8.0
            summary = f"Month {future_month} is a low tourism season in Vietnam."
            strength = "LOW"
        else:
            modifier = 3.0
            summary = f"Month {future_month} is a moderate tourism season."
            strength = "MEDIUM"

        return {
            "source": "tourism_seasonal_heuristic",
            "demand_modifier_pct": modifier,
            "signal_strength": strength,
            "summary": summary,
            "note": "Set TOURISM_API_URL env var to use live tourism data.",
        }


class LocalEventSubAgent:
    """
    Fetches local event schedule (concerts, conferences, sports, holidays)
    to identify demand spikes from events.

    In production: integrate with Ticketmaster API, Google Events, or internal CRM.
    Fallback: uses a static event calendar from config.
    """

    async def run(self, horizon_days: int = 14) -> dict[str, Any]:
        """
        Returns demand spike signal based on upcoming events.
        """
        import os
        events_api = os.getenv("LOCAL_EVENTS_API_URL")

        if events_api:
            return await self._fetch_events(events_api, horizon_days)
        return self._static_event_check(horizon_days)

    async def _fetch_events(self, url: str, horizon_days: int) -> dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params={"days": horizon_days})
                resp.raise_for_status()
                events = resp.json().get("events", [])
                major_events = [e for e in events if e.get("category") in ("CONFERENCE", "CONCERT", "SPORTS")]
                modifier = min(25.0, len(major_events) * 5.0)
                return {
                    "source": "local_events_api",
                    "demand_modifier_pct": modifier,
                    "signal_strength": "HIGH" if major_events else "NEUTRAL",
                    "events_count": len(major_events),
                    "summary": f"{len(major_events)} major events in next {horizon_days} days.",
                }
        except Exception as exc:
            logger.warning(f"Events API failed: {exc}")
            return self._static_event_check(horizon_days)

    def _static_event_check(self, horizon_days: int) -> dict[str, Any]:
        """Check Vietnam national holidays in the horizon window."""
        today = date.today()
        vietnam_holidays = [
            date(today.year, 1, 1),   # New Year
            date(today.year, 4, 30),  # Reunification Day
            date(today.year, 5, 1),   # Labour Day
            date(today.year, 9, 2),   # National Day
        ]
        upcoming = [
            h for h in vietnam_holidays
            if today <= h <= today + timedelta(days=horizon_days)
        ]
        modifier = len(upcoming) * 8.0  # Each national holiday = +8% demand
        return {
            "source": "vietnam_holiday_calendar",
            "demand_modifier_pct": min(25.0, modifier),
            "signal_strength": "HIGH" if upcoming else "NEUTRAL",
            "upcoming_holidays": [str(h) for h in upcoming],
            "summary": (
                f"{len(upcoming)} Vietnam national holiday(s) in next {horizon_days} days."
                if upcoming else "No major holidays in forecast window."
            ),
            "note": "Set LOCAL_EVENTS_API_URL env var for live event data.",
        }
