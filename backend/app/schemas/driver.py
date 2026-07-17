from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime, date, timezone
import uuid

from app.enums.fleet import DriverStatus

class DriverBase(BaseModel):
    employee_code: str = Field(..., description="Unique employee code")
    full_name: str = Field(..., min_length=1)
    email: Optional[EmailStr] = None
    phone: str = Field(..., min_length=5)
    license_number: str = Field(...)
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

    @field_validator('safety_score')
    @classmethod
    def validate_safety_score(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0 <= v <= 100):
            raise ValueError("Safety score must be between 0 and 100")
        return v

    @field_validator('date_of_birth')
    @classmethod
    def validate_age(cls, v: Optional[date]) -> Optional[date]:
        if v is not None:
            today = datetime.now(timezone.utc).date()
            age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
            if age < 18:
                raise ValueError("Driver must be at least 18 years old")
        return v

    @field_validator('joining_date')
    @classmethod
    def validate_joining_date(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v > datetime.now(timezone.utc).date():
            raise ValueError("Joining date cannot be in the future")
        return v

class DriverCreate(DriverBase):
    @field_validator('license_expiry')
    @classmethod
    def validate_license_expiry(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v < datetime.now(timezone.utc).date():
            raise ValueError("License expiry cannot be in the past when creating a driver")
        return v

class DriverUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=5)
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

    @field_validator('safety_score')
    @classmethod
    def validate_safety_score(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0 <= v <= 100):
            raise ValueError("Safety score must be between 0 and 100")
        return v

    @field_validator('date_of_birth')
    @classmethod
    def validate_age(cls, v: Optional[date]) -> Optional[date]:
        if v is not None:
            today = datetime.now(timezone.utc).date()
            age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
            if age < 18:
                raise ValueError("Driver must be at least 18 years old")
        return v

    @field_validator('joining_date')
    @classmethod
    def validate_joining_date(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v > datetime.now(timezone.utc).date():
            raise ValueError("Joining date cannot be in the future")
        return v

class DriverStatusUpdate(BaseModel):
    status: DriverStatus

class DriverSafetyScoreUpdate(BaseModel):
    safety_score: float = Field(..., ge=0, le=100)

class DriverResponse(DriverBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]
    
    @property
    def license_status(self) -> str:
        if not self.license_expiry:
            return "UNKNOWN"
        today = datetime.now(timezone.utc).date()
        if self.license_expiry < today:
            return "EXPIRED"
        delta = self.license_expiry - today
        if delta.days <= 30:
            return "EXPIRING_SOON"
        return "VALID"

class ComplianceAlertsResponse(BaseModel):
    expired_licenses: list[DriverResponse]
    expiring_soon: list[DriverResponse]
    low_safety_scores: list[DriverResponse]
