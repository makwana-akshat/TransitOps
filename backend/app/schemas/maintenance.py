from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import uuid

from app.enums.fleet import MaintenanceStatus

class MaintenanceRecordBase(BaseModel):
    vehicle_id: uuid.UUID
    maintenance_type: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[float] = None
    workshop_name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: MaintenanceStatus = MaintenanceStatus.OPEN
    next_service_due: Optional[datetime] = None

class MaintenanceRecordCreate(MaintenanceRecordBase):
    pass

class MaintenanceRecordUpdate(BaseModel):
    vehicle_id: Optional[uuid.UUID] = None
    maintenance_type: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[float] = None
    workshop_name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[MaintenanceStatus] = None
    next_service_due: Optional[datetime] = None

class MaintenanceRecordResponse(MaintenanceRecordBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

class MaintenanceRecordListResponse(BaseModel):
    items: list[MaintenanceRecordResponse]
    total: int
