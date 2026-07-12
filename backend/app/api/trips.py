import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import get_current_active_user, require_fleet_manager, require_role, Role
from app.models.user import User
from app.schemas.trip import TripCreate, TripUpdate, TripResponse, TripDetailResponse, TripCompleteUpdate
from app.schemas.common import ApiResponse, PaginatedResponse
from app.services.trip_service import TripService

router = APIRouter(prefix="/api/trips", tags=["Trips"])

require_staff = require_role([Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST])

def get_trip_service(db: AsyncSession = Depends(get_db)) -> TripService:
    return TripService(db)

@router.post("", response_model=ApiResponse[TripResponse], status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_in: TripCreate,
    current_user: User = Depends(require_fleet_manager),
    service: TripService = Depends(get_trip_service)
):
    trip = await service.create_trip(trip_in, current_user)
    return ApiResponse(success=True, message="Trip created successfully.", data=trip)

@router.get("", response_model=PaginatedResponse[TripDetailResponse])
async def get_trips(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_active_user),
    service: TripService = Depends(get_trip_service)
):
    paginated_data = await service.get_trips(
        page, page_size, search, status=status, vehicle_id=vehicle_id, 
        driver_id=driver_id, sort_by=sort_by, sort_order=sort_order
    )
    return PaginatedResponse(success=True, message="Trips retrieved successfully.", data=paginated_data)

@router.get("/active", response_model=ApiResponse[List[TripDetailResponse]])
async def get_active_trips(
    current_user: User = Depends(require_staff),
    service: TripService = Depends(get_trip_service)
):
    trips = await service.get_active_trips()
    return ApiResponse(success=True, message="Active trips retrieved successfully.", data=trips)

@router.get("/{id}", response_model=ApiResponse[TripDetailResponse])
async def get_trip(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    service: TripService = Depends(get_trip_service)
):
    trip = await service.get_trip_by_id(id)
    return ApiResponse(success=True, message="Trip retrieved successfully.", data=trip)

@router.put("/{id}", response_model=ApiResponse[TripResponse])
async def update_trip(
    id: uuid.UUID,
    trip_in: TripUpdate,
    current_user: User = Depends(require_fleet_manager),
    service: TripService = Depends(get_trip_service)
):
    trip = await service.update_trip(id, trip_in)
    return ApiResponse(success=True, message="Trip updated successfully.", data=trip)

@router.patch("/{id}/dispatch", response_model=ApiResponse[TripResponse])
async def dispatch_trip(
    id: uuid.UUID,
    current_user: User = Depends(require_fleet_manager),
    service: TripService = Depends(get_trip_service)
):
    trip = await service.dispatch_trip(id, current_user)
    return ApiResponse(success=True, message="Trip dispatched successfully.", data=trip)

@router.patch("/{id}/complete", response_model=ApiResponse[TripResponse])
async def complete_trip(
    id: uuid.UUID,
    complete_in: TripCompleteUpdate,
    current_user: User = Depends(require_fleet_manager),
    service: TripService = Depends(get_trip_service)
):
    trip = await service.complete_trip(id, complete_in, current_user)
    return ApiResponse(success=True, message="Trip completed successfully.", data=trip)

@router.patch("/{id}/cancel", response_model=ApiResponse[TripResponse])
async def cancel_trip(
    id: uuid.UUID,
    current_user: User = Depends(require_fleet_manager),
    service: TripService = Depends(get_trip_service)
):
    trip = await service.cancel_trip(id, current_user)
    return ApiResponse(success=True, message="Trip cancelled successfully.", data=trip)

@router.delete("/{id}", response_model=ApiResponse[None])
async def delete_trip(
    id: uuid.UUID,
    current_user: User = Depends(require_fleet_manager),
    service: TripService = Depends(get_trip_service)
):
    await service.delete_trip(id)
    return ApiResponse(success=True, message="Trip soft-deleted successfully.")
