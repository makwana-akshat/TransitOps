import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.db.session import get_db
from app.dependencies.auth import require_fleet_manager, require_role, Role
from app.models.user import User
from app.schemas.expense import FuelLogCreate, FuelLogUpdate, FuelLogResponse, FuelSummaryResponse
from app.schemas.common import ApiResponse, PaginatedResponse
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/api/fuel-logs", tags=["Fuel Logs"])

require_staff = require_role([Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST])
require_write = require_role([Role.ADMIN, Role.FLEET_MANAGER, Role.FINANCIAL_ANALYST])

def get_expense_service(db: AsyncSession = Depends(get_db)) -> ExpenseService:
    return ExpenseService(db)

@router.post("", response_model=ApiResponse[FuelLogResponse], status_code=status.HTTP_201_CREATED)
async def create_fuel_log(
    record_in: FuelLogCreate,
    current_user: User = Depends(require_write),
    service: ExpenseService = Depends(get_expense_service)
):
    record = await service.create_fuel_log(record_in, current_user)
    return ApiResponse(success=True, message="Fuel log created successfully.", data=record)

@router.get("", response_model=PaginatedResponse[FuelLogResponse])
async def get_fuel_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    fuel_type: Optional[str] = None,
    payment_method: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    sort_by: Optional[str] = Query("filled_at"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(require_staff),
    service: ExpenseService = Depends(get_expense_service)
):
    paginated_data = await service.get_fuel_logs(
        page, page_size, search, vehicle_id=vehicle_id, fuel_type=fuel_type,
        payment_method=payment_method, start_date=start_date, end_date=end_date,
        sort_by=sort_by, sort_order=sort_order
    )
    return PaginatedResponse(success=True, message="Fuel logs retrieved successfully.", data=paginated_data)

@router.get("/summary", response_model=ApiResponse[FuelSummaryResponse])
async def get_fuel_summary(
    current_user: User = Depends(require_staff),
    service: ExpenseService = Depends(get_expense_service)
):
    summary = await service.get_fuel_summary()
    return ApiResponse(success=True, message="Fuel summary retrieved.", data=summary)

@router.get("/{id}", response_model=ApiResponse[FuelLogResponse])
async def get_fuel_log(
    id: uuid.UUID,
    current_user: User = Depends(require_staff),
    service: ExpenseService = Depends(get_expense_service)
):
    record = await service.get_fuel_log_by_id(id)
    return ApiResponse(success=True, message="Fuel log retrieved.", data=record)

@router.put("/{id}", response_model=ApiResponse[FuelLogResponse])
async def update_fuel_log(
    id: uuid.UUID,
    record_in: FuelLogUpdate,
    current_user: User = Depends(require_write),
    service: ExpenseService = Depends(get_expense_service)
):
    record = await service.update_fuel_log(id, record_in, current_user)
    return ApiResponse(success=True, message="Fuel log updated.", data=record)

@router.delete("/{id}", response_model=ApiResponse[None])
async def delete_fuel_log(
    id: uuid.UUID,
    current_user: User = Depends(require_write),
    service: ExpenseService = Depends(get_expense_service)
):
    await service.delete_fuel_log(id, current_user)
    return ApiResponse(success=True, message="Fuel log deleted.")
