from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["water"])


@router.get("/api/water-stations", response_model=schemas.ApiResponse[schemas.WaterStationsPayload])
def get_water_stations(db: Session = Depends(get_db)):
    cooling_centers = db.query(models.CoolingCenter).all()
    water_stations = db.query(models.WaterStation).all()

    payload = schemas.WaterStationsPayload(
        coolingCenters=[schemas.CoolingCenterOut.model_validate(c) for c in cooling_centers],
        waterStations=[schemas.WaterStationOut.model_validate(s) for s in water_stations],
    )
    return schemas.ApiResponse(success=True, data=payload, message="OK")
