from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["hospitals"])


@router.get("/api/hospitals", response_model=schemas.ApiResponse[List[schemas.HospitalOut]])
def get_hospitals(db: Session = Depends(get_db)):
    hospitals = db.query(models.Hospital).all()
    data = [schemas.HospitalOut.model_validate(h) for h in hospitals]
    return schemas.ApiResponse(success=True, data=data, message="OK")
