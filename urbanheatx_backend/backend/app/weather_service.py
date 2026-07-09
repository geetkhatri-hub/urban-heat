"""
Real weather integration via Open-Meteo (https://open-meteo.com/) — free, no API key required.

We pull the current temperature plus 5 days of past + 5 days of forecast daily
max/min temperatures in a single call. Ward-level "urban heat island" variation
(some wards run hotter than others due to tree cover, concrete density, grid
load) isn't something a free public API exposes at neighbourhood resolution —
true hyperlocal data like that comes from satellite land-surface-temperature
products (e.g. NASA MODIS/Landsat via Google Earth Engine), which needs its own
account/setup. Until you wire one of those in, heat_engine.py re-applies each
ward's fixed relative offset on top of this live citywide number, so the
dashboard always reflects real current conditions while preserving realistic
ward-to-ward spread.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

from .config import CITY_LAT, CITY_LON, WEATHER_CACHE_MINUTES

logger = logging.getLogger(__name__)

_cache: dict = {"data": None, "fetched_at": None}

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


async def get_weather_data() -> Optional[dict]:
    """Returns the raw Open-Meteo payload, using an in-memory cache. Returns
    None if the request fails (e.g. no internet access) so callers can fall
    back to seeded data instead of crashing."""

    now = datetime.now(timezone.utc)
    if (
        _cache["data"] is not None
        and _cache["fetched_at"] is not None
        and (now - _cache["fetched_at"]) < timedelta(minutes=WEATHER_CACHE_MINUTES)
    ):
        return _cache["data"]

    params = {
        "latitude": CITY_LAT,
        "longitude": CITY_LON,
        "current": "temperature_2m,relative_humidity_2m",
        "daily": "temperature_2m_max,temperature_2m_min",
        "past_days": 5,
        "forecast_days": 6,
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(OPEN_METEO_URL, params=params)
            resp.raise_for_status()
            payload = resp.json()
    except Exception as exc:  # network down, DNS blocked, timeout, etc.
        logger.warning("Open-Meteo fetch failed, will use seeded fallback: %s", exc)
        return None

    _cache["data"] = payload
    _cache["fetched_at"] = now
    return payload


async def refresh_weather_cache() -> None:
    """Force a refresh, ignoring the cache TTL. Call on app startup."""
    _cache["data"] = None
    _cache["fetched_at"] = None
    await get_weather_data()
