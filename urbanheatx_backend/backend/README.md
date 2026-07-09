# UrbanHeatX AI — Backend

A FastAPI backend built to match your existing frontend's API contract exactly
(`src/config/endpoints.ts`, `src/types/*.ts`, `src/api/client.ts`'s mock shapes).
Swap the mock fallback off and this is a drop-in replacement.

## What it does

- **Real live weather** for your city via [Open-Meteo](https://open-meteo.com/)
  (free, no API key). Pulls current temperature + 5 days past + 5 days forecast
  in one call, cached for 30 minutes.
- **Ward-level modeling**: each ward keeps a fixed "heat island offset" (how
  much hotter/cooler it runs vs. the city average) computed from your original
  seed data. Live weather + that offset + any tree-coverage changes you
  simulate = the ward's current temperature. This is a genuine limitation to
  be upfront about: **true hyperlocal, ward-by-ward real temperature data
  isn't available from any free public API** — that requires satellite
  land-surface-temperature products (NASA MODIS/Landsat via Google Earth
  Engine, or a paid provider). This model gives you real city-level accuracy
  with realistic, consistent spatial variation, which is the standard
  approach for a project at this stage.
- **SQLite** storage (upgradeable to Postgres by changing one env var) seeded
  automatically from your existing `src/data/*.json` files on first run.
- All 6 endpoints your frontend already calls, returning the exact
  `{ success, data, message }` shape it expects.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` if your city isn't Bengaluru — just change `CITY_NAME`, `CITY_LAT`,
`CITY_LON`. (If you change city, also consider re-authoring `data/wards.json`
coordinates/offsets, since they were written for Bengaluru's geography.)

Run it:

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive Swagger docs — great for
testing each endpoint by hand before wiring the frontend.

## Connect your frontend

1. In your frontend's `.env`, make sure you have:
   ```
   VITE_API_URL=http://localhost:8000
   ```
2. In `src/api/client.ts`, change:
   ```ts
   const USE_MOCK_FALLBACK = true;
   ```
   to:
   ```ts
   const USE_MOCK_FALLBACK = false;
   ```
   (Leaving it `true` is actually a nice safety net during development — if
   the backend crashes or isn't running, the UI keeps working on mock data
   instead of breaking. You can flip it to `false` once you trust the backend
   is stable, or leave it `true` permanently as a resilience layer.)
3. Start both servers and click through all three portals.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/wards` | Live-computed ward temps/risk/gridLoad |
| GET | `/api/heat-summary` | City summary + historical + forecast + budget breakdown |
| GET | `/api/hospitals` | Static seeded hospital capacity data |
| GET | `/api/water-stations` | Cooling centers + water stations |
| GET | `/api/citizen-reports` | All citizen reports, newest first |
| POST | `/api/citizen-reports` | Create a report (persists to DB) |
| POST | `/api/simulate-ward` | Update a ward's tree coverage/budget, recompute temp |

## Project layout

```
backend/
  app/
    main.py            # FastAPI app, CORS, startup (seed DB + warm weather cache)
    config.py           # env-driven settings
    database.py         # SQLAlchemy engine/session
    models.py            # ORM tables
    schemas.py            # Pydantic response/request shapes (mirrors src/types/*.ts)
    weather_service.py     # Open-Meteo client + cache
    heat_engine.py           # temp/risk/gridLoad math, historical/forecast builders
    seed.py                   # one-time DB seed from data/*.json
    routers/
      wards.py, heat.py, hospitals.py, water.py, citizen.py
  data/                # your original JSON fixtures, used only for seeding
  requirements.txt
  .env.example
```

## Upgrading to Postgres later

Just change `DATABASE_URL` in `.env`, e.g.:
```
DATABASE_URL=postgresql://user:password@localhost:5432/urbanheat
```
and add `psycopg2-binary` to `requirements.txt`. No code changes needed.

## Known limitations (be upfront about these if this is for a hackathon/demo)

- Ward-level heat variation is a **model**, not measured satellite data — it's
  seeded from plausible values and stays internally consistent as you adjust
  tree coverage, but it isn't literal ground truth.
- Hospitals / cooling centers / water stations are static seed data — no live
  integration exists for hospital bed occupancy, since that would require a
  hospital information system API you likely don't have access to.
- Citizen reports don't auto-assign `wardId` from coordinates — the frontend
  currently passes whatever ward the user selected. A nice follow-up would be
  point-in-polygon lookup against each ward's `coordinates` to auto-detect it.
