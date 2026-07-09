from typing import Generic, TypeVar, List, Tuple, Optional
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: T
    message: str


# ---------- Wards / Heat ----------

class WardRecommendations(BaseModel):
    priority: str
    reason: str
    coolingExpected: float
    roi: str
    cost: float
    policy: str


class WardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    riskLevel: str
    temperature: float
    treeCoverage: float
    population: int
    gridLoad: float
    budgetAllocated: float
    budgetRequired: float
    coordinates: List[Tuple[float, float]]
    center: Tuple[float, float]
    recommendations: WardRecommendations


class SimulateWardRequest(BaseModel):
    wardId: str
    treeCoverage: float
    budgetAllocated: float


class HistoricalDataPoint(BaseModel):
    date: str
    temperature: float
    heatRiskIndex: float
    gridLoad: float


class ForecastDataPoint(BaseModel):
    day: str
    temperature: float
    risk: str
    load: float


class BudgetItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    value: float
    color: str


class CitySummary(BaseModel):
    cityHealthScore: float
    maxTemperature: float
    averageTemperature: float
    populationAtRisk: int
    totalBudget: float
    budgetSpent: float
    treeCoveragePercent: float
    averageGridLoad: float
    heatwaveLevel: str
    historical: List[HistoricalDataPoint]
    forecast: List[ForecastDataPoint]
    budgetAllocation: List[BudgetItemOut]


# ---------- Emergency (hospitals / cooling / water) ----------

class HospitalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    coordinates: Tuple[float, float]
    capacity: int
    occupiedBeds: int
    heatstrokeBedsTotal: int
    heatstrokeBedsOccupied: int
    ambulanceDispatched: int
    ambulanceTotal: int
    status: str
    waterTankerStatus: str


class CoolingCenterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    coordinates: Tuple[float, float]
    capacity: int
    currentOccupancy: int
    waterAvailableLiters: int
    acStatus: str
    isEmergencyBackup: bool


class WaterStationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    coordinates: Tuple[float, float]
    status: str
    flowRate: str
    dailyUsageLiters: int


class WaterStationsPayload(BaseModel):
    coolingCenters: List[CoolingCenterOut]
    waterStations: List[WaterStationOut]


# ---------- Citizen reports ----------

class CitizenReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    userName: str
    category: str
    description: str
    severity: str
    coordinates: Tuple[float, float]
    wardId: str
    timestamp: str
    status: str
    imageUrl: Optional[str] = None


class CitizenReportIn(BaseModel):
    userName: Optional[str] = "Anonymous Citizen"
    category: Optional[str] = "General Heat Issue"
    description: Optional[str] = ""
    severity: Optional[str] = "Medium"
    coordinates: Optional[Tuple[float, float]] = (12.9716, 77.5946)
    wardId: Optional[str] = "ward-1"
    imageUrl: Optional[str] = None
