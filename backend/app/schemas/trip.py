from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime, timezone
import uuid

from app.enums.fleet import TripStatus
from app.schemas.vehicle import VehicleResponse
from app.schemas.driver import DriverResponse

class TripBase(BaseModel):
    trip_number: Optional[str] = None
    vehicle_id: uuid.UUID
    driver_id: uuid.UUID
    source: str = Field(...)
    destination: str = Field(...)
    cargo_description: str = Field(...)
    cargo_weight: float = Field(..., ge=0)
    planned_distance: float = Field(..., ge=0)
    actual_distance: Optional[float] = None
    planned_start: datetime
    actual_start: Optional[datetime] = None
    planned_end: datetime
    actual_end: Optional[datetime] = None
    fuel_consumed: Optional[float] = None
    trip_revenue: Optional[float] = None
    status: TripStatus = TripStatus.DRAFT
    notes: Optional[str] = None

class TripCreate(BaseModel):
    vehicle_id: uuid.UUID
    driver_id: uuid.UUID
    source: str = Field(...)
    destination: str = Field(...)
    cargo_description: str = Field(...)
    cargo_weight: float = Field(..., ge=0)
    planned_distance: float = Field(..., ge=0)
    planned_start: datetime
    planned_end: datetime
    notes: Optional[str] = None

    @model_validator(mode='after')
    def check_dates(self) -> 'TripCreate':
        if self.planned_end <= self.planned_start:
            raise ValueError("planned_end must be after planned_start")
        return self

class TripUpdate(BaseModel):
    vehicle_id: Optional[uuid.UUID] = None
    driver_id: Optional[uuid.UUID] = None
    source: Optional[str] = None
    destination: Optional[str] = None
    cargo_description: Optional[str] = None
    cargo_weight: Optional[float] = Field(None, ge=0)
    planned_distance: Optional[float] = Field(None, ge=0)
    planned_start: Optional[datetime] = None
    planned_end: Optional[datetime] = None
    notes: Optional[str] = None

class TripCompleteUpdate(BaseModel):
    actual_distance: float = Field(..., ge=0)
    final_odometer: float = Field(..., ge=0)
    fuel_consumed: float = Field(..., ge=0)
    trip_revenue: float = Field(..., ge=0)

class TripResponse(TripBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

class TripDetailResponse(TripResponse):
    vehicle: Optional[VehicleResponse] = None
    driver: Optional[DriverResponse] = None
