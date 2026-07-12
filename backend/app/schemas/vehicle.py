from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime, date, timezone
import uuid

from app.enums.fleet import VehicleStatus

class VehicleBase(BaseModel):
    registration_number: str = Field(..., description="Unique registration number")
    vehicle_name: str = Field(..., description="Name of the vehicle")
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

    @field_validator('registration_number')
    @classmethod
    def registration_uppercase(cls, v: str) -> str:
        return v.upper().strip()

    @field_validator('capacity_kg')
    @classmethod
    def capacity_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Capacity must be greater than zero")
        return v

    @field_validator('acquisition_cost', 'current_odometer')
    @classmethod
    def value_non_negative(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Value cannot be negative")
        return v

    @field_validator('purchase_date')
    @classmethod
    def purchase_date_past(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v > datetime.now(timezone.utc).date():
            raise ValueError("Purchase date cannot be in the future")
        return v

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
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

    @field_validator('registration_number')
    @classmethod
    def registration_uppercase(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.upper().strip()
        return v

    @field_validator('capacity_kg')
    @classmethod
    def capacity_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Capacity must be greater than zero")
        return v

    @field_validator('acquisition_cost', 'current_odometer')
    @classmethod
    def value_non_negative(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Value cannot be negative")
        return v

    @field_validator('purchase_date')
    @classmethod
    def purchase_date_past(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v > datetime.now(timezone.utc).date():
            raise ValueError("Purchase date cannot be in the future")
        return v

class VehicleStatusUpdate(BaseModel):
    status: VehicleStatus

class VehicleResponse(VehicleBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]
