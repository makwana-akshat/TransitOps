from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import uuid

from app.enums.fleet import TripStatus

class TripBase(BaseModel):
    trip_number: str
    vehicle_id: uuid.UUID
    driver_id: uuid.UUID
    source: Optional[str] = None
    destination: Optional[str] = None
    cargo_description: Optional[str] = None
    cargo_weight: Optional[float] = None
    planned_distance: Optional[float] = None
    actual_distance: Optional[float] = None
    planned_start: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    fuel_consumed: Optional[float] = None
    trip_revenue: Optional[float] = None
    status: TripStatus = TripStatus.DRAFT
    notes: Optional[str] = None

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    vehicle_id: Optional[uuid.UUID] = None
    driver_id: Optional[uuid.UUID] = None
    source: Optional[str] = None
    destination: Optional[str] = None
    cargo_description: Optional[str] = None
    cargo_weight: Optional[float] = None
    planned_distance: Optional[float] = None
    actual_distance: Optional[float] = None
    planned_start: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    fuel_consumed: Optional[float] = None
    trip_revenue: Optional[float] = None
    status: Optional[TripStatus] = None
    notes: Optional[str] = None

class TripResponse(TripBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

class TripListResponse(BaseModel):
    items: list[TripResponse]
    total: int
