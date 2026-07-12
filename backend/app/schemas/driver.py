from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime, date
import uuid

from app.enums.fleet import DriverStatus

class DriverBase(BaseModel):
    employee_code: str
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    license_number: str
    license_category: Optional[str] = None
    license_expiry: Optional[date] = None
    date_of_birth: Optional[date] = None
    joining_date: Optional[date] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    safety_score: Optional[float] = None
    status: DriverStatus = DriverStatus.AVAILABLE
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry: Optional[date] = None
    date_of_birth: Optional[date] = None
    joining_date: Optional[date] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    safety_score: Optional[float] = None
    status: Optional[DriverStatus] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class DriverResponse(DriverBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

class DriverListResponse(BaseModel):
    items: list[DriverResponse]
    total: int
