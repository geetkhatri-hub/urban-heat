# UrbanHeatX AI — Smart City Urban Heat Intelligence

UrbanHeatX AI is a web-based smart-city platform for exploring urban heat conditions and coordinating heat-response activities. It provides separate interfaces for municipal decision-makers, emergency-response teams, and citizens.

**Live application:** https://urban-heat-theta.vercel.app/

---

## Table of Contents

- [Project Overview](#project-overview)
- [Portals and Features](#portals-and-features)
- [Supported Cities](#supported-cities)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Optional FastAPI Backend](#optional-fastapi-backend)
- [API Endpoints](#api-endpoints)
- [Data and Implementation Notes](#data-and-implementation-notes)
- [Available Scripts](#available-scripts)
- [Limitations](#limitations)

## Project Overview

UrbanHeatX AI is designed to make urban heat information easier to understand and act on. It combines ward-level heat and risk information, visual analytics, resource information, and citizen-submitted reports in one application.

The application has three role-based portals:

1. **Municipal Commissioner** — city-level heat monitoring, ward analytics, AI-oriented recommendations, budget information, and reports.
2. **Emergency Response** — emergency operations information, hospital capacity, ambulance deployment, cooling-centre capacity, and water-station information.
3. **Citizen Portal** — local heat-risk information, a resource map, safety guidance, emergency contacts, and a form for reporting heat-related issues.

The frontend is a React single-page application. It can run with its included local mock-data fallback. An optional FastAPI backend is also included in the repository.

## Portals and Features

### 1. Municipal Commissioner Portal

The commissioner dashboard includes the following sections:

- **Dashboard:** city heat overview, key metrics, ward information, and summary visualizations.
- **Heat Map:** ward-level heat information with risk-level filtering.
- **Analytics:** ward comparisons, historical temperature trends, forecast charts, and heat-risk trends.
- **AI Insights:** ward-level recommendations, including expected cooling and estimated costs.
- **Budget:** budget allocation and utilization information, including ward-level breakdowns.
- **Reports:** available heat and budget reports, plus a city summary.
- **Settings:** application settings interface.

### 2. Emergency Response Portal

The emergency dashboard provides:

- Hospital status and heatstroke-bed occupancy information.
- Ambulance deployment summaries.
- Cooling-centre capacity and occupancy information.
- Water-station information.
- Emergency alerts and an incident timeline.
- Hospital and response-resource visualizations.

### 3. Citizen Portal

The citizen-facing portal provides:

- Urban heat map and map overlays.
- Nearby cooling centres, water stations, and hospitals.
- Heat-safety guidance and alerts.
- Emergency contact information.
- A form to submit heat-related issues.
- A recent citizen-reports section.

### 4. Interactive and Visual Components

The application uses charts, metric cards, risk cards, maps, loading states, and error handling to present information. Map rendering is implemented with Leaflet and React Leaflet; charts use Recharts.

## Supported Cities

The city selector contains these seven cities:

| City | State / Region |
|---|---|
| Bengaluru | Karnataka |
| Delhi | Delhi NCT |
| Mumbai | Maharashtra |
| Chennai | Tamil Nadu |
| Hyderabad | Telangana |
| Pune | Maharashtra |
| Kolkata | West Bengal |

Bengaluru is the default city. The frontend switches its generated ward, hospital, and water-resource mock data when another city is selected.

## Technology Stack

### Frontend

- **React 18** — user interface.
- **TypeScript** — application types and type checking.
- **Vite 5** — development server and production build.
- **Tailwind CSS 3** — styling.
- **React Router 6** — client-side navigation and portal routes.
- **TanStack React Query 5** — data fetching and query-state management.
- **Axios** — HTTP client.
- **Zustand** — shared application state.
- **Recharts** — charts and data visualizations.
- **Leaflet / React Leaflet** — interactive maps.
- **Framer Motion** — interface animations.
- **Lucide React** — icons.

### Optional Backend

- **Python**
- **FastAPI**
- **Uvicorn**
- **SQLAlchemy**
- **Pydantic**
- **SQLite** by default
- **Open-Meteo API** for city-level weather data

## Project Structure

```text
urban-heat-main/
├── public/
│   └── smart_city_hero.jpg
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── components/
│   │   ├── widgets/
│   │   ├── GlobalErrorBoundary.tsx
│   │   └── ProtectedRoute.tsx
│   ├── config/
│   │   └── endpoints.ts
│   ├── data/
│   │   ├── cities/
│   │   ├── citizenReports.json
│   │   ├── heatData.json
│   │   ├── hospitals.json
│   │   ├── wards.json
│   │   ├── waterStations.json
│   │   └── mockDataGenerator.ts
│   ├── pages/
│   │   ├── CitizenPortal.tsx
│   │   ├── CommissionerDashboard.tsx
│   │   ├── EmergencyDashboard.tsx
│   │   └── PortalSelection.tsx
│   ├── services/
│   ├── store/
│   ├── test/
│   ├── types/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── urbanheatx_backend/
│   └── backend/
│       ├── app/
│       │   ├── routers/
│       │   ├── config.py
│       │   ├── database.py
│       │   ├── heat_engine.py
│       │   ├── main.py
│       │   ├── models.py
│       │   ├── schemas.py
│       │   ├── seed.py
│       │   └── weather_service.py
│       ├── .env.example
│       └── requirements.txt
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Getting Started

### Prerequisites

Install the following:

- Node.js (LTS recommended)
- npm (included with Node.js)

### 1. Download or clone the project

```bash
git clone YOUR_REPOSITORY_URL
cd urban-heat-main
```

If you downloaded the ZIP file, extract it and open a terminal in the folder containing `package.json`.

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser. It is usually:

```text
http://localhost:5173
```

### 4. Create a production build

```bash
npm run build
```

The production files are generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Optional FastAPI Backend

The repository also contains a FastAPI backend in `urbanheatx_backend/backend`. The frontend currently has `USE_MOCK_FALLBACK = true` in `src/api/client.ts`, so its API client serves local in-memory mock data for the supported requests. The backend is therefore optional for running the frontend in its default configuration.

### 1. Set up Python

From the project root:

```bash
cd urbanheatx_backend/backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

### 2. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy `.env.example` to `.env`.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

The example configuration uses Bengaluru and SQLite by default. Review the values in `.env` before running the backend.

### 4. Run the backend

From `urbanheatx_backend/backend`:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend base URL:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

### 5. Connect the frontend to the backend

Create a `.env` file in the frontend project root and set:

```env
VITE_API_URL=http://localhost:8000
```

Then, in `src/api/client.ts`, change:

```ts
const USE_MOCK_FALLBACK = true;
```

to:

```ts
const USE_MOCK_FALLBACK = false;
```

Restart the Vite development server after changing environment variables or this setting. Run the frontend and backend at the same time.

The backend CORS setting is controlled by `FRONTEND_ORIGIN` in its `.env` file. Its default is `http://localhost:5173`.

## API Endpoints

The included FastAPI backend exposes these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend health check |
| GET | `/api/wards` | Retrieve ward heat and risk data |
| GET | `/api/heat-summary` | Retrieve city summary, historical/forecast data, and budget allocation |
| GET | `/api/hospitals` | Retrieve hospital information |
| GET | `/api/water-stations` | Retrieve cooling-centre and water-station information |
| GET | `/api/citizen-reports` | Retrieve citizen reports |
| POST | `/api/citizen-reports` | Submit a citizen report |
| POST | `/api/simulate-ward` | Simulate a ward update using tree coverage and budget values |

API responses use a common success/data/message structure where applicable. See the backend source and `/docs` for the exact request and response schemas.

## Data and Implementation Notes

- The repository includes JSON datasets for wards, heat summaries, hospitals, water stations, and citizen reports.
- The frontend mock-data client keeps changes such as submitted reports and ward simulations in memory for the current browser session. These mock changes are not permanent database storage.
- The city selector includes seven cities. For non-default cities, the frontend generates mock ward, hospital, and water-resource data using the city registry and mock-data generator.
- The optional backend seeds its database from the project fixture data when the database is empty.
- The backend retrieves city-level weather information from Open-Meteo and caches the response according to `WEATHER_CACHE_MINUTES`.
- The backend derives ward temperatures using the live city temperature and fixed ward-level heat-island offsets from the seed data.

## Available Scripts

Run these commands from the frontend project root:

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run TypeScript build checks and create the production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest test suite |

## Limitations

- Ward-level temperature variation in the included backend is modelled from city-level weather and seeded ward offsets. It is not direct, measured temperature data for every ward.
- The included hospital, cooling-centre, and water-station records are seeded/static project data; the repository does not include a live hospital-management-system integration.
- In the default frontend configuration, API responses are supplied by the mock fallback. Citizen reports and simulated ward changes are held in memory for the current session.
- The project does not demonstrate a production-grade authentication system. The role-based routes control navigation within the application; do not treat them as secure user authentication or authorization.
- AI-oriented recommendations shown in the interface should be understood in the context of the project's implemented recommendation logic and data, not as independently validated professional or emergency advice.

## Deployment

The frontend is deployed at:

**https://urban-heat-theta.vercel.app/**

For another deployment, build the frontend with `npm run build` and deploy the generated `dist/` directory to a static hosting provider that supports single-page application routing. Configure the hosting provider to rewrite application routes to `index.html`.

---

**Project:** UrbanHeatX AI    
**Purpose:** Smart-city urban heat intelligence project
