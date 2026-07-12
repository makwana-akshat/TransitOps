from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

class DashboardOverviewResponse(BaseModel):
    activeVehicles: int
    availableVehicles: int
    vehiclesInMaintenance: int
    retiredVehicles: int
    
    activeTrips: int
    completedTripsToday: int
    pendingTrips: int
    
    driversOnDuty: int
    availableDrivers: int
    suspendedDrivers: int
    
    fleetUtilization: float
    
    totalFuelCost: float
    totalMaintenanceCost: float
    totalOperationalCost: float

class RecentActivityItem(BaseModel):
    id: uuid.UUID
    activity_type: str
    description: str
    created_at: datetime
    
class StatusChartItem(BaseModel):
    status: str
    count: int

class MonthlyTripItem(BaseModel):
    month: str
    trip_count: int

class MonthlyCostItem(BaseModel):
    month: str
    cost: float
    
class TopVehicleItem(BaseModel):
    vehicle_id: uuid.UUID
    registration: str
    distance: float
    fuel_cost: float
    trips_completed: int

class TopDriverItem(BaseModel):
    driver_id: uuid.UUID
    name: str
    safety_score: float
    distance: float
    trips_completed: int
    
class AlertItem(BaseModel):
    alert_type: str
    description: str
    severity: str
    related_id: uuid.UUID
    
class SearchSummaryItem(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    subtitle: str
    
class GlobalSearchResponse(BaseModel):
    matchingVehicles: List[SearchSummaryItem]
    matchingDrivers: List[SearchSummaryItem]
    matchingTrips: List[SearchSummaryItem]
