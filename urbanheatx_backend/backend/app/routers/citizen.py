import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["citizen-reports"])


@router.get("/api/citizen-reports", response_model=schemas.ApiResponse[List[schemas.CitizenReportOut]])
def get_citizen_reports(db: Session = Depends(get_db)):
    reports = (
        db.query(models.CitizenReport)
        .order_by(models.CitizenReport.timestamp.desc())
        .all()
    )
    data = [schemas.CitizenReportOut.model_validate(r) for r in reports]
    return schemas.ApiResponse(success=True, data=data, message="OK")


@router.post(
    "/api/citizen-reports",
    response_model=schemas.ApiResponse[schemas.CitizenReportOut],
    status_code=201,
)
def create_citizen_report(payload: schemas.CitizenReportIn, db: Session = Depends(get_db)):
    report = models.CitizenReport(
        id=f"rep-{uuid.uuid4().hex[:10]}",
        userName=payload.userName or "Anonymous Citizen",
        category=payload.category or "General Heat Issue",
        description=payload.description or "",
        severity=payload.severity or "Medium",
        coordinates=list(payload.coordinates) if payload.coordinates else [12.9716, 77.5946],
        wardId=payload.wardId or "ward-1",
        timestamp=datetime.now(timezone.utc).isoformat(),
        status="Pending",
        imageUrl=payload.imageUrl,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return schemas.ApiResponse(
        success=True,
        data=schemas.CitizenReportOut.model_validate(report),
        message="Report logged",
    )
