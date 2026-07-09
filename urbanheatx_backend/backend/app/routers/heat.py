from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import heat_engine, models, schemas
from ..database import get_db
from ..seed import _load  # reuse the fixture loader for fallback data
from ..weather_service import get_weather_data

router = APIRouter(tags=["heat-summary"])


@router.get("/api/heat-summary", response_model=schemas.ApiResponse[schemas.CitySummary])
async def get_heat_summary(db: Session = Depends(get_db)):
    weather = await get_weather_data()
    live_temp = heat_engine.get_live_city_temperature(weather)

    wards = db.query(models.Ward).all()

    computed = [
        (
            heat_engine.compute_ward_temperature(live_temp, w),
            heat_engine.compute_ward_grid_load(w),
            w,
        )
        for w in wards
    ]

    if computed:
        temps = [c[0] for c in computed]
        loads = [c[1] for c in computed]
        max_temperature = max(temps)
        average_temperature = round(sum(temps) / len(temps), 1)
        average_grid_load = round(sum(loads) / len(loads), 1)

        total_population = sum(w.population for _, _, w in computed) or 1
        population_at_risk = sum(
            w.population
            for temp, _, w in computed
            if heat_engine.risk_level_from_temp(temp) in ("High", "Extreme")
        )
        tree_coverage_percent = round(
            sum(w.treeCoverage * w.population for _, _, w in computed) / total_population, 1
        )
        total_budget = sum(w.budgetRequired for _, _, w in computed)
        budget_spent = sum(w.budgetAllocated for _, _, w in computed)
    else:
        max_temperature = live_temp
        average_temperature = live_temp
        average_grid_load = 50.0
        population_at_risk = 0
        tree_coverage_percent = 0.0
        total_budget = 0.0
        budget_spent = 0.0

    if average_temperature > 42:
        heatwave_level = "Level-4 Red Alert"
    elif average_temperature > 39:
        heatwave_level = "Level-3 Orange Alert"
    elif average_temperature > 36:
        heatwave_level = "Level-2 Yellow Alert"
    else:
        heatwave_level = "Level-1 Watch"

    city_health_score = round(
        max(0.0, min(100.0, 100 - (average_temperature - 30) * 3 - max(0, average_grid_load - 50) * 0.4)),
        0,
    )

    heat_data_fallback = _load("heatData.json")
    historical = heat_engine.build_historical(weather, heat_data_fallback["historical"])
    forecast = heat_engine.build_forecast(weather, heat_data_fallback["forecast"])

    budget_items = db.query(models.BudgetItem).all()
    budget_allocation = [
        schemas.BudgetItemOut(name=b.name, value=b.value, color=b.color) for b in budget_items
    ]

    summary = schemas.CitySummary(
        cityHealthScore=city_health_score,
        maxTemperature=max_temperature,
        averageTemperature=average_temperature,
        populationAtRisk=population_at_risk,
        totalBudget=total_budget,
        budgetSpent=budget_spent,
        treeCoveragePercent=tree_coverage_percent,
        averageGridLoad=average_grid_load,
        heatwaveLevel=heatwave_level,
        historical=historical,
        forecast=forecast,
        budgetAllocation=budget_allocation,
    )

    return schemas.ApiResponse(success=True, data=summary, message="OK")
