from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import FRONTEND_ORIGIN
from .database import Base, engine, SessionLocal
from .routers import citizen, heat, hospitals, water, wards
from .seed import seed_if_empty
from .weather_service import refresh_weather_cache


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables + seed the DB from the fixture JSON on first run
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()

    # Warm the weather cache so the first request isn't slow
    await refresh_weather_cache()

    yield


app = FastAPI(title="UrbanHeatX AI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wards.router)
app.include_router(heat.router)
app.include_router(hospitals.router)
app.include_router(water.router)
app.include_router(citizen.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "UrbanHeatX AI API"}
