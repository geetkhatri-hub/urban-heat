"""
Turns (a) live weather from Open-Meteo and (b) each ward's stored, fixed
"heat island offset" into the numbers the frontend actually renders.

Formula for a ward's live temperature:

    ward_temp = live_city_temp
                + ward.heatIslandOffset
                - (ward.treeCoverage - ward.seedTreeCoverage) * 0.12

`heatIslandOffset` is fixed at seed time (original_ward_temp - REFERENCE_CITY_TEMP)
and represents how much hotter/cooler that neighbourhood runs vs. the city
average, due to concrete density, shade, etc. The last term is the same
"more trees -> cooler" relationship your original mock (`client.ts`) used for
the /simulate-ward endpoint, now applied live on top of real weather instead
of a static number.

If Open-Meteo is unreachable, every function here falls back to the original
seeded historical/forecast data so the API still works offline.
"""

from datetime import datetime
from typing import List, Optional

from .config import REFERENCE_CITY_TEMP


def risk_level_from_temp(temp: float) -> str:
    if temp > 42:
        return "Extreme"
    if temp > 39:
        return "High"
    if temp > 36:
        return "Medium"
    return "Low"


def get_live_city_temperature(payload: Optional[dict]) -> float:
    """Current temperature for the whole city, or the reference fallback."""
    if not payload:
        return REFERENCE_CITY_TEMP
    current = payload.get("current") or {}
    temp = current.get("temperature_2m")
    if temp is not None:
        return float(temp)
    daily = payload.get("daily") or {}
    tmax = daily.get("temperature_2m_max") or []
    if tmax:
        return float(tmax[-1])
    return REFERENCE_CITY_TEMP


def compute_ward_temperature(live_city_temp: float, ward) -> float:
    tree_delta_cooling = (ward.treeCoverage - ward.seedTreeCoverage) * 0.12
    temp = live_city_temp + ward.heatIslandOffset - tree_delta_cooling
    return round(max(30.0, temp), 1)


def compute_ward_grid_load(ward) -> float:
    tree_delta_relief = (ward.treeCoverage - ward.seedTreeCoverage) * 0.6
    load = ward.seedGridLoad - tree_delta_relief
    return round(max(30.0, min(100.0, load)), 1)


def build_historical(payload: Optional[dict], fallback: List[dict]) -> List[dict]:
    """Past 5 days of daily max temperature, from Open-Meteo's `past_days`."""
    if not payload:
        return fallback

    daily = payload.get("daily") or {}
    dates = daily.get("time") or []
    tmax = daily.get("temperature_2m_max") or []

    out = []
    n_past = min(len(dates), 5)
    for i in range(n_past):
        temp = tmax[i] if i < len(tmax) else None
        if temp is None:
            continue
        try:
            label = datetime.fromisoformat(dates[i]).strftime("%m-%d")
        except ValueError:
            label = dates[i]
        heat_risk_index = round(min(100.0, max(0.0, (temp - 25) * 4)), 1)
        grid_load = round(min(100.0, max(0.0, 50 + (temp - 35) * 3)), 1)
        out.append(
            {
                "date": label,
                "temperature": round(float(temp), 1),
                "heatRiskIndex": heat_risk_index,
                "gridLoad": grid_load,
            }
        )
    return out or fallback


def build_forecast(payload: Optional[dict], fallback: List[dict]) -> List[dict]:
    """Next days of daily max temperature, from Open-Meteo's `forecast_days`."""
    if not payload:
        return fallback

    daily = payload.get("daily") or {}
    dates = daily.get("time") or []
    tmax = daily.get("temperature_2m_max") or []

    total = len(dates)
    start = max(0, total - 6)  # skip the past_days block, keep the forecast tail

    out = []
    for i in range(start, total):
        temp = tmax[i] if i < len(tmax) else None
        if temp is None:
            continue
        try:
            label = datetime.fromisoformat(dates[i]).strftime("%a")
        except ValueError:
            label = dates[i]
        grid_load = round(min(100.0, max(0.0, 50 + (temp - 35) * 3)), 1)
        out.append(
            {
                "day": label,
                "temperature": round(float(temp), 1),
                "risk": risk_level_from_temp(float(temp)),
                "load": grid_load,
            }
        )
    return out or fallback
