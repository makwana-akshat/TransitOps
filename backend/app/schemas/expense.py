from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import uuid

from app.enums.fleet import ExpenseType

# FuelLog Schemas

class FuelLogBase(BaseModel):
    vehicle_id: uuid.UUID
    trip_id: Optional[uuid.UUID] = None
    liters: Optional[float] = None
    price_per_liter: Optional[float] = None
    total_cost: Optional[float] = None
    fuel_station: Optional[str] = None
    odometer: Optional[float] = None
    filled_at: Optional[datetime] = None

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogUpdate(BaseModel):
    vehicle_id: Optional[uuid.UUID] = None
    trip_id: Optional[uuid.UUID] = None
    liters: Optional[float] = None
    price_per_liter: Optional[float] = None
    total_cost: Optional[float] = None
    fuel_station: Optional[str] = None
    odometer: Optional[float] = None
    filled_at: Optional[datetime] = None

class FuelLogResponse(FuelLogBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime

class FuelLogListResponse(BaseModel):
    items: list[FuelLogResponse]
    total: int

# Expense Schemas

class ExpenseBase(BaseModel):
    vehicle_id: uuid.UUID
    trip_id: Optional[uuid.UUID] = None
    expense_type: ExpenseType
    amount: float
    description: Optional[str] = None
    expense_date: Optional[datetime] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    vehicle_id: Optional[uuid.UUID] = None
    trip_id: Optional[uuid.UUID] = None
    expense_type: Optional[ExpenseType] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    expense_date: Optional[datetime] = None

class ExpenseResponse(ExpenseBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_by: Optional[uuid.UUID]
    created_at: datetime

class ExpenseListResponse(BaseModel):
    items: list[ExpenseResponse]
    total: int
