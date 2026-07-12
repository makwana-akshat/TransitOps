from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from typing import Optional, List, Dict
from datetime import datetime, timezone
import uuid

from app.enums.fleet import FuelType, PaymentMethod, ExpenseType

class FuelLogBase(BaseModel):
    vehicle_id: uuid.UUID
    trip_id: Optional[uuid.UUID] = None
    fuel_type: FuelType
    liters: float = Field(..., gt=0)
    price_per_liter: float = Field(..., gt=0)
    total_cost: float = Field(..., ge=0)
    fuel_station: Optional[str] = None
    odometer: Optional[float] = Field(None, ge=0)
    filled_at: datetime
    invoice_number: Optional[str] = None
    payment_method: PaymentMethod
    remarks: Optional[str] = None

    @model_validator(mode='after')
    def validate_total_cost(self):
        # Automatically recalculate total_cost if incorrect
        calculated_cost = round(self.liters * self.price_per_liter, 2)
        if abs(self.total_cost - calculated_cost) > 0.01:
            self.total_cost = calculated_cost
        return self

    @field_validator('filled_at')
    @classmethod
    def validate_filled_at(cls, v: datetime):
        if v.timestamp() > datetime.now(timezone.utc).timestamp():
            raise ValueError("filled_at cannot be in the future")
        return v

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogUpdate(BaseModel):
    trip_id: Optional[uuid.UUID] = None
    fuel_type: Optional[FuelType] = None
    liters: Optional[float] = Field(None, gt=0)
    price_per_liter: Optional[float] = Field(None, gt=0)
    total_cost: Optional[float] = Field(None, ge=0)
    fuel_station: Optional[str] = None
    odometer: Optional[float] = Field(None, ge=0)
    filled_at: Optional[datetime] = None
    invoice_number: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    remarks: Optional[str] = None

    @field_validator('filled_at')
    @classmethod
    def validate_filled_at(cls, v: Optional[datetime]):
        if v and v.timestamp() > datetime.now(timezone.utc).timestamp():
            raise ValueError("filled_at cannot be in the future")
        return v

class FuelLogResponse(FuelLogBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[uuid.UUID] = None

class ExpenseBase(BaseModel):
    vehicle_id: uuid.UUID
    trip_id: Optional[uuid.UUID] = None
    expense_type: ExpenseType
    amount: float = Field(..., gt=0)
    expense_date: datetime
    vendor: Optional[str] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    payment_method: PaymentMethod
    remarks: Optional[str] = None

    @field_validator('expense_date')
    @classmethod
    def validate_expense_date(cls, v: datetime):
        if v.timestamp() > datetime.now(timezone.utc).timestamp():
            raise ValueError("expense_date cannot be in the future")
        return v

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    trip_id: Optional[uuid.UUID] = None
    expense_type: Optional[ExpenseType] = None
    amount: Optional[float] = Field(None, gt=0)
    expense_date: Optional[datetime] = None
    vendor: Optional[str] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    remarks: Optional[str] = None

    @field_validator('expense_date')
    @classmethod
    def validate_expense_date(cls, v: Optional[datetime]):
        if v and v.timestamp() > datetime.now(timezone.utc).timestamp():
            raise ValueError("expense_date cannot be in the future")
        return v

class ExpenseResponse(ExpenseBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[uuid.UUID] = None

class FuelSummaryResponse(BaseModel):
    total_fuel_cost: float
    average_fuel_cost: float
    average_fuel_price: float
    total_liters: float

class ExpenseSummaryResponse(BaseModel):
    total_expenses: float
    expense_breakdown: Dict[str, float]
    total_operational_cost: float

class VehicleCostSummaryResponse(BaseModel):
    vehicle_id: uuid.UUID
    lifetime_fuel_cost: float
    lifetime_maintenance_cost: float
    lifetime_other_expenses: float
    lifetime_operational_cost: float
    average_cost_per_km: float
