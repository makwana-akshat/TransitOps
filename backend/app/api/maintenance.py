import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import require_fleet_manager, require_role, Role
from app.models.user import User
from app.schemas.maintenance import MaintenanceRecordCreate, MaintenanceRecordUpdate, MaintenanceRecordResponse, MaintenanceRecordDetailResponse, MaintenanceCompleteUpdate
from app.schemas.common import ApiResponse, PaginatedResponse
from app.services.maintenance_service import MaintenanceService

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

require_staff = require_role([Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST])

def get_maintenance_service(db: AsyncSession = Depends(get_db)) -> MaintenanceService:
    return MaintenanceService(db)

@router.post("", response_model=ApiResponse[MaintenanceRecordResponse], status_code=status.HTTP_201_CREATED)
async def create_maintenance(
    record_in: MaintenanceRecordCreate,
    current_user: User = Depends(require_fleet_manager),
    service: MaintenanceService = Depends(get_maintenance_service)
):
    record = await service.create_maintenance(record_in, current_user)
    return ApiResponse(success=True, message="Maintenance record created successfully.", data=record)

@router.get("", response_model=PaginatedResponse[MaintenanceRecordDetailResponse])
async def get_maintenance_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    maintenance_type: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    workshop_name: Optional[str] = None,
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(require_staff),
    service: MaintenanceService = Depends(get_maintenance_service)
):
    paginated_data = await service.get_paginated(
        page, page_size, search, status=status, priority=priority, 
        maintenance_type=maintenance_type, vehicle_id=vehicle_id, workshop_name=workshop_name,
        sort_by=sort_by, sort_order=sort_order
    )
    return PaginatedResponse(success=True, message="Maintenance records retrieved successfully.", data=paginated_data)

@router.get("/active", response_model=ApiResponse[List[MaintenanceRecordDetailResponse]])
async def get_active_maintenance(
    current_user: User = Depends(require_staff),
    service: MaintenanceService = Depends(get_maintenance_service)
):
    records = await service.get_active()
    return ApiResponse(success=True, message="Active maintenance records retrieved.", data=records)

@router.get("/upcoming", response_model=ApiResponse[List[MaintenanceRecordDetailResponse]])
async def get_upcoming_maintenance(
    current_user: User = Depends(require_staff),
    service: MaintenanceService = Depends(get_maintenance_service)
):
    records = await service.get_upcoming()
    return ApiResponse(success=True, message="Upcoming maintenance records retrieved.", data=records)

@router.get("/{id}", response_model=ApiResponse[MaintenanceRecordDetailResponse])
async def get_maintenance_record(
    id: uuid.UUID,
    current_user: User = Depends(require_staff),
    service: MaintenanceService = Depends(get_maintenance_service)
):
    record = await service.get_by_id(id)
    return ApiResponse(success=True, message="Maintenance record retrieved.", data=record)

@router.put("/{id}", response_model=ApiResponse[MaintenanceRecordResponse])
async def update_maintenance(
    id: uuid.UUID,
    record_in: MaintenanceRecordUpdate,
    current_user: User = Depends(require_fleet_manager),
    service: MaintenanceService = Depends(get_maintenance_service)
):
    record = await service.update_maintenance(id, record_in)
    return ApiResponse(success=True, message="Maintenance record updated.", data=record)

@router.patch("/{id}/complete", response_model=ApiResponse[MaintenanceRecordResponse])
async def complete_maintenance(
    id: uuid.UUID,
    complete_in: MaintenanceCompleteUpdate,
    current_user: User = Depends(require_fleet_manager),
    service: MaintenanceService = Depends(get_maintenance_service)
):
    record = await service.complete_maintenance(id, complete_in, current_user)
    return ApiResponse(success=True, message="Maintenance record completed.", data=record)

@router.patch("/{id}/cancel", response_model=ApiResponse[MaintenanceRecordResponse])
async def cancel_maintenance(
    id: uuid.UUID,
    current_user: User = Depends(require_fleet_manager),
    service: MaintenanceService = Depends(get_maintenance_service)
):
    record = await service.cancel_maintenance(id, current_user)
    return ApiResponse(success=True, message="Maintenance record cancelled.", data=record)

@router.delete("/{id}", response_model=ApiResponse[None])
async def delete_maintenance(
    id: uuid.UUID,
    current_user: User = Depends(require_fleet_manager),
    service: MaintenanceService = Depends(get_maintenance_service)
):
    await service.delete_maintenance(id)
    return ApiResponse(success=True, message="Maintenance record soft-deleted.")
