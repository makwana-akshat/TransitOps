from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime, timezone
import uuid

from app.enums.fleet import MaintenanceStatus, MaintenanceType, MaintenancePriority
from app.schemas.vehicle import VehicleResponse

class MaintenanceRecordBase(BaseModel):
    vehicle_id: uuid.UUID
    maintenance_type: MaintenanceType
    priority: MaintenancePriority = MaintenancePriority.MEDIUM
    description: Optional[str] = None
    workshop_name: Optional[str] = None
    mechanic_name: Optional[str] = None
    invoice_number: Optional[str] = None
    remarks: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, ge=0)
    actual_cost: Optional[float] = Field(None, ge=0)
    start_date: datetime
    expected_completion: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    next_service_due: Optional[datetime] = None
    status: MaintenanceStatus = MaintenanceStatus.OPEN

class MaintenanceRecordCreate(BaseModel):
    vehicle_id: uuid.UUID
    maintenance_type: MaintenanceType
    priority: MaintenancePriority = MaintenancePriority.MEDIUM
    description: Optional[str] = None
    workshop_name: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, ge=0)
    start_date: datetime
    expected_completion: Optional[datetime] = None
    next_service_due: Optional[datetime] = None

class MaintenanceRecordUpdate(BaseModel):
    maintenance_type: Optional[MaintenanceType] = None
    priority: Optional[MaintenancePriority] = None
    description: Optional[str] = None
    workshop_name: Optional[str] = None
    mechanic_name: Optional[str] = None
    invoice_number: Optional[str] = None
    remarks: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    expected_completion: Optional[datetime] = None
    next_service_due: Optional[datetime] = None
    status: Optional[MaintenanceStatus] = None

class MaintenanceCompleteUpdate(BaseModel):
    actual_cost: float = Field(..., ge=0)
    mechanic_name: Optional[str] = None
    invoice_number: Optional[str] = None
    remarks: Optional[str] = None
    next_service_due: Optional[datetime] = None

class MaintenanceRecordResponse(MaintenanceRecordBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

class MaintenanceRecordDetailResponse(MaintenanceRecordResponse):
    vehicle: Optional[VehicleResponse] = None
