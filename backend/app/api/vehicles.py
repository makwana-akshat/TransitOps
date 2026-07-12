import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import get_current_active_user, require_fleet_manager
from app.models.user import User
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse, VehicleStatusUpdate
from app.schemas.common import ApiResponse, PaginatedResponse
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

def get_vehicle_service(db: AsyncSession = Depends(get_db)) -> VehicleService:
    return VehicleService(db)

@router.post("", response_model=ApiResponse[VehicleResponse], status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_in: VehicleCreate,
    current_user: User = Depends(require_fleet_manager),
    service: VehicleService = Depends(get_vehicle_service)
):
    vehicle = await service.create_vehicle(vehicle_in, current_user)
    return ApiResponse(success=True, message="Vehicle created successfully.", data=vehicle)

@router.get("", response_model=PaginatedResponse[VehicleResponse])
async def get_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    region: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    year: Optional[int] = None,
    manufacturer: Optional[str] = None,
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_active_user),
    service: VehicleService = Depends(get_vehicle_service)
):
    paginated_data = await service.get_vehicles(
        page, page_size, search, status=status, region=region, 
        vehicle_type=vehicle_type, year=year, manufacturer=manufacturer, 
        sort_by=sort_by, sort_order=sort_order
    )
    return PaginatedResponse(success=True, message="Vehicles retrieved successfully.", data=paginated_data)

@router.get("/{id}", response_model=ApiResponse[VehicleResponse])
async def get_vehicle(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    service: VehicleService = Depends(get_vehicle_service)
):
    vehicle = await service.get_vehicle_by_id(id)
    return ApiResponse(success=True, message="Vehicle retrieved successfully.", data=vehicle)

@router.put("/{id}", response_model=ApiResponse[VehicleResponse])
async def update_vehicle(
    id: uuid.UUID,
    vehicle_in: VehicleUpdate,
    current_user: User = Depends(require_fleet_manager),
    service: VehicleService = Depends(get_vehicle_service)
):
    vehicle = await service.update_vehicle(id, vehicle_in)
    return ApiResponse(success=True, message="Vehicle updated successfully.", data=vehicle)

@router.patch("/{id}/status", response_model=ApiResponse[VehicleResponse])
async def update_vehicle_status(
    id: uuid.UUID,
    status_in: VehicleStatusUpdate,
    current_user: User = Depends(require_fleet_manager),
    service: VehicleService = Depends(get_vehicle_service)
):
    vehicle = await service.update_status(id, status_in)
    return ApiResponse(success=True, message="Vehicle status updated successfully.", data=vehicle)

@router.delete("/{id}", response_model=ApiResponse[None])
async def delete_vehicle(
    id: uuid.UUID,
    current_user: User = Depends(require_fleet_manager),
    service: VehicleService = Depends(get_vehicle_service)
):
    await service.delete_vehicle(id)
    return ApiResponse(success=True, message="Vehicle deleted successfully.")
