from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date
import uuid

from app.enums.fleet import VehicleStatus

class VehicleBase(BaseModel):
    registration_number: str
    vehicle_name: Optional[str] = None
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    vehicle_type: Optional[str] = None
    status: VehicleStatus = VehicleStatus.AVAILABLE
    capacity_kg: Optional[float] = None
    current_odometer: float = 0.0
    acquisition_cost: Optional[float] = None
    purchase_date: Optional[date] = None
    region: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    engine_number: Optional[str] = None
    chassis_number: Optional[str] = None
    notes: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    vehicle_name: Optional[str] = None
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    vehicle_type: Optional[str] = None
    status: Optional[VehicleStatus] = None
    capacity_kg: Optional[float] = None
    current_odometer: Optional[float] = None
    acquisition_cost: Optional[float] = None
    purchase_date: Optional[date] = None
    region: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    engine_number: Optional[str] = None
    chassis_number: Optional[str] = None
    notes: Optional[str] = None

class VehicleResponse(VehicleBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

class VehicleListResponse(BaseModel):
    items: list[VehicleResponse]
    total: int
