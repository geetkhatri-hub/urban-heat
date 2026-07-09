import json
import os

from sqlalchemy.orm import Session

from . import models
from .config import DATA_DIR, REFERENCE_CITY_TEMP


def _load(filename: str):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


def seed_if_empty(db: Session) -> None:
    if db.query(models.Ward).count() == 0:
        _seed_wards(db)

    if db.query(models.Hospital).count() == 0:
        _seed_hospitals(db)

    if db.query(models.CoolingCenter).count() == 0 or db.query(models.WaterStation).count() == 0:
        _seed_water(db)

    if db.query(models.CitizenReport).count() == 0:
        _seed_citizen_reports(db)

    if db.query(models.BudgetItem).count() == 0:
        _seed_budget(db)

    db.commit()


def _seed_wards(db: Session) -> None:
    for w in _load("wards.json"):
        heat_island_offset = round(w["temperature"] - REFERENCE_CITY_TEMP, 2)
        db.add(
            models.Ward(
                id=w["id"],
                name=w["name"],
                population=w["population"],
                budgetAllocated=w["budgetAllocated"],
                budgetRequired=w["budgetRequired"],
                coordinates=w["coordinates"],
                center=w["center"],
                recommendations=w["recommendations"],
                treeCoverage=w["treeCoverage"],
                seedTreeCoverage=w["treeCoverage"],
                seedGridLoad=w["gridLoad"],
                heatIslandOffset=heat_island_offset,
            )
        )


def _seed_hospitals(db: Session) -> None:
    for h in _load("hospitals.json"):
        db.add(
            models.Hospital(
                id=h["id"],
                name=h["name"],
                coordinates=h["coordinates"],
                capacity=h["capacity"],
                occupiedBeds=h["occupiedBeds"],
                heatstrokeBedsTotal=h["heatstrokeBedsTotal"],
                heatstrokeBedsOccupied=h["heatstrokeBedsOccupied"],
                ambulanceDispatched=h["ambulanceDispatched"],
                ambulanceTotal=h["ambulanceTotal"],
                status=h["status"],
                waterTankerStatus=h["waterTankerStatus"],
            )
        )


def _seed_water(db: Session) -> None:
    payload = _load("waterStations.json")
    for c in payload.get("coolingCenters", []):
        db.add(
            models.CoolingCenter(
                id=c["id"],
                name=c["name"],
                coordinates=c["coordinates"],
                capacity=c["capacity"],
                currentOccupancy=c["currentOccupancy"],
                waterAvailableLiters=c["waterAvailableLiters"],
                acStatus=c["acStatus"],
                isEmergencyBackup=bool(c.get("isEmergencyBackup", False)),
            )
        )
    for s in payload.get("waterStations", []):
        db.add(
            models.WaterStation(
                id=s["id"],
                name=s["name"],
                type=s["type"],
                coordinates=s["coordinates"],
                status=s["status"],
                flowRate=s["flowRate"],
                dailyUsageLiters=s["dailyUsageLiters"],
            )
        )


def _seed_citizen_reports(db: Session) -> None:
    for r in _load("citizenReports.json"):
        db.add(
            models.CitizenReport(
                id=r["id"],
                userName=r["userName"],
                category=r["category"],
                description=r["description"],
                severity=r["severity"],
                coordinates=r["coordinates"],
                wardId=r["wardId"],
                timestamp=r["timestamp"],
                status=r.get("status", "Pending"),
                imageUrl=r.get("imageUrl"),
            )
        )


def _seed_budget(db: Session) -> None:
    heat_data = _load("heatData.json")
    for b in heat_data.get("budgetAllocation", []):
        db.add(models.BudgetItem(name=b["name"], value=b["value"], color=b["color"]))
