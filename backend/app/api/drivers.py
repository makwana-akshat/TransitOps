import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import get_current_active_user, require_fleet_manager, require_safety_officer, require_role
from app.models.user import User, Role
from app.schemas.driver import DriverCreate, DriverUpdate, DriverResponse, DriverStatusUpdate, DriverSafetyScoreUpdate, ComplianceAlertsResponse
from app.schemas.common import ApiResponse, PaginatedResponse
from app.services.driver_service import DriverService

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])

require_staff = require_role([Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST])
require_fleet_or_safety = require_role([Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER])

def get_driver_service(db: AsyncSession = Depends(get_db)) -> DriverService:
    return DriverService(db)

@router.post("", response_model=ApiResponse[DriverResponse], status_code=status.HTTP_201_CREATED)
async def create_driver(
    driver_in: DriverCreate,
    current_user: User = Depends(require_fleet_manager),
    service: DriverService = Depends(get_driver_service)
):
    driver = await service.create_driver(driver_in, current_user)
    return ApiResponse(success=True, message="Driver created successfully.", data=driver)

@router.get("", response_model=PaginatedResponse[DriverResponse])
async def get_drivers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    license_category: Optional[str] = None,
    safety_score_min: Optional[float] = None,
    safety_score_max: Optional[float] = None,
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(require_staff),
    service: DriverService = Depends(get_driver_service)
):
    paginated_data = await service.get_drivers(
        page, page_size, search, status=status, license_category=license_category, 
        safety_score_min=safety_score_min, safety_score_max=safety_score_max,
        sort_by=sort_by, sort_order=sort_order
    )
    return PaginatedResponse(success=True, message="Drivers retrieved successfully.", data=paginated_data)

@router.get("/compliance-alerts", response_model=ApiResponse[ComplianceAlertsResponse])
async def get_compliance_alerts(
    current_user: User = Depends(require_fleet_or_safety),
    service: DriverService = Depends(get_driver_service)
):
    alerts = await service.get_compliance_alerts()
    return ApiResponse(success=True, message="Compliance alerts retrieved.", data=alerts)

@router.get("/{id}", response_model=ApiResponse[DriverResponse])
async def get_driver(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    service: DriverService = Depends(get_driver_service)
):
    driver = await service.get_driver_by_id(id)
    return ApiResponse(success=True, message="Driver retrieved successfully.", data=driver)

@router.put("/{id}", response_model=ApiResponse[DriverResponse])
async def update_driver(
    id: uuid.UUID,
    driver_in: DriverUpdate,
    current_user: User = Depends(require_fleet_manager),
    service: DriverService = Depends(get_driver_service)
):
    driver = await service.update_driver(id, driver_in, current_user)
    return ApiResponse(success=True, message="Driver updated successfully.", data=driver)

@router.patch("/{id}/status", response_model=ApiResponse[DriverResponse])
async def update_driver_status(
    id: uuid.UUID,
    status_in: DriverStatusUpdate,
    current_user: User = Depends(require_fleet_or_safety),
    service: DriverService = Depends(get_driver_service)
):
    driver = await service.update_status(id, status_in, current_user)
    return ApiResponse(success=True, message="Driver status updated successfully.", data=driver)

@router.patch("/{id}/safety-score", response_model=ApiResponse[DriverResponse])
async def update_driver_safety_score(
    id: uuid.UUID,
    score_in: DriverSafetyScoreUpdate,
    current_user: User = Depends(require_safety_officer),
    service: DriverService = Depends(get_driver_service)
):
    driver = await service.update_safety_score(id, score_in)
    return ApiResponse(success=True, message="Safety score updated successfully.", data=driver)

@router.delete("/{id}", response_model=ApiResponse[None])
async def delete_driver(
    id: uuid.UUID,
    current_user: User = Depends(require_fleet_manager),
    service: DriverService = Depends(get_driver_service)
):
    await service.delete_driver(id)
    return ApiResponse(success=True, message="Driver deleted successfully.")
