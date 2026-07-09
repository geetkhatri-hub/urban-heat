from sqlalchemy import Column, String, Float, Integer, JSON, Boolean

from .database import Base


class Ward(Base):
    __tablename__ = "wards"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    population = Column(Integer, nullable=False)
    budgetAllocated = Column(Float, nullable=False)
    budgetRequired = Column(Float, nullable=False)
    coordinates = Column(JSON, nullable=False)  # list of [lat, lng] polygon points
    center = Column(JSON, nullable=False)  # [lat, lng]
    recommendations = Column(JSON, nullable=False)

    # Mutable, user-adjustable via /simulate-ward
    treeCoverage = Column(Float, nullable=False)

    # Fixed at seed time, used as the baseline to measure simulate-ward deltas against
    seedTreeCoverage = Column(Float, nullable=False)
    seedGridLoad = Column(Float, nullable=False)

    # Fixed at seed time: how much hotter/cooler this ward runs vs. the city average,
    # in the original synthetic dataset. Re-applied on top of the live weather temperature.
    heatIslandOffset = Column(Float, nullable=False)


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    coordinates = Column(JSON, nullable=False)  # [lat, lng]
    capacity = Column(Integer, nullable=False)
    occupiedBeds = Column(Integer, nullable=False)
    heatstrokeBedsTotal = Column(Integer, nullable=False)
    heatstrokeBedsOccupied = Column(Integer, nullable=False)
    ambulanceDispatched = Column(Integer, nullable=False)
    ambulanceTotal = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    waterTankerStatus = Column(String, nullable=False)


class CoolingCenter(Base):
    __tablename__ = "cooling_centers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    coordinates = Column(JSON, nullable=False)
    capacity = Column(Integer, nullable=False)
    currentOccupancy = Column(Integer, nullable=False)
    waterAvailableLiters = Column(Integer, nullable=False)
    acStatus = Column(String, nullable=False)
    isEmergencyBackup = Column(Boolean, nullable=False, default=False)


class WaterStation(Base):
    __tablename__ = "water_stations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    coordinates = Column(JSON, nullable=False)
    status = Column(String, nullable=False)
    flowRate = Column(String, nullable=False)
    dailyUsageLiters = Column(Integer, nullable=False)


class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(String, primary_key=True, index=True)
    userName = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    coordinates = Column(JSON, nullable=False)
    wardId = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Pending")
    imageUrl = Column(String, nullable=True)


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    color = Column(String, nullable=False)
