from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import heat_engine, models, schemas
from ..database import get_db
from ..weather_service import get_weather_data

router = APIRouter(tags=["wards"])


def _ward_to_out(ward: models.Ward, live_city_temp: float) -> schemas.WardOut:
    temperature = heat_engine.compute_ward_temperature(live_city_temp, ward)
    grid_load = heat_engine.compute_ward_grid_load(ward)
    return schemas.WardOut(
        id=ward.id,
        name=ward.name,
        riskLevel=heat_engine.risk_level_from_temp(temperature),
        temperature=temperature,
        treeCoverage=ward.treeCoverage,
        population=ward.population,
        gridLoad=grid_load,
        budgetAllocated=ward.budgetAllocated,
        budgetRequired=ward.budgetRequired,
        coordinates=ward.coordinates,
        center=ward.center,
        recommendations=schemas.WardRecommendations(**ward.recommendations),
    )


@router.get("/api/wards", response_model=schemas.ApiResponse[List[schemas.WardOut]])
async def get_wards(db: Session = Depends(get_db)):
    weather = await get_weather_data()
    live_temp = heat_engine.get_live_city_temperature(weather)

    wards = db.query(models.Ward).all()
    data = [_ward_to_out(w, live_temp) for w in wards]

    return schemas.ApiResponse(success=True, data=data, message="OK")


@router.post("/api/simulate-ward", response_model=schemas.ApiResponse[List[schemas.WardOut]])
async def simulate_ward(payload: schemas.SimulateWardRequest, db: Session = Depends(get_db)):
    ward = db.query(models.Ward).filter(models.Ward.id == payload.wardId).first()
    if not ward:
        raise HTTPException(status_code=404, detail=f"Ward '{payload.wardId}' not found")

    ward.treeCoverage = payload.treeCoverage
    ward.budgetAllocated = payload.budgetAllocated
    db.commit()

    weather = await get_weather_data()
    live_temp = heat_engine.get_live_city_temperature(weather)

    wards = db.query(models.Ward).all()
    data = [_ward_to_out(w, live_temp) for w in wards]

    return schemas.ApiResponse(success=True, data=data, message="Simulation updated successfully")
