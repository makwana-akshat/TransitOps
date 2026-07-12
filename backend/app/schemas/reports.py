from pydantic import BaseModel
from typing import List, Optional, Any
import uuid

class FleetUtilizationItem(BaseModel):
    vehicle_id: uuid.UUID
    registration_number: str
    total_trips: int
    distance_travelled: float
    idle_time_hours: float
    utilization_percentage: float

class VehiclePerformanceItem(BaseModel):
    vehicle_id: uuid.UUID
    registration_number: str
    trips_completed: int
    distance: float
    fuel_cost: float
    maintenance_cost: float
    expense_cost: float
    operational_cost: float
    cost_per_km: float

class DriverPerformanceItem(BaseModel):
    driver_id: uuid.UUID
    name: str
    trips_completed: int
    distance_driven: float
    safety_score: float
    fuel_consumption: float
    avg_trip_distance: float

class FuelEfficiencyItem(BaseModel):
    vehicle_id: uuid.UUID
    registration_number: str
    distance: float
    fuel_consumed: float
    km_per_liter: float

class OperationalCostItem(BaseModel):
    vehicle_id: uuid.UUID
    registration_number: str
    fuel_cost: float
    maintenance_cost: float
    other_expenses: float
    total_operational_cost: float

class VehicleROIItem(BaseModel):
    vehicle_id: uuid.UUID
    registration_number: str
    acquisition_cost: float
    revenue: float
    maintenance_cost: float
    fuel_cost: float
    other_expenses: float
    roi_percentage: float

class RevenueAnalysisItem(BaseModel):
    period: str
    revenue: float
    expenses: float
    profit: float

class MaintenanceReportItem(BaseModel):
    vehicle_id: uuid.UUID
    registration_number: str
    total_maintenance_cost: float
    frequency: int
    downtime_hours: float

class TripSummaryItem(BaseModel):
    period: str
    completed_trips: int
    cancelled_trips: int
    avg_distance: float
    avg_revenue: float
    avg_fuel_cost: float

class ReportResponse(BaseModel):
    success: bool = True
    message: str = "Report generated successfully."
    data: List[Any]
