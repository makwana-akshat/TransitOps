import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import get_current_active_user, require_fleet_manager, require_role, Role
from app.models.user import User
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse, VehicleStatusUpdate
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.maintenance import MaintenanceRecordResponse
from app.schemas.expense import VehicleCostSummaryResponse
from app.services.vehicle_service import VehicleService
from app.services.maintenance_service import MaintenanceService

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

require_staff = require_role([Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST])

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
    current_user: User = Depends(require_staff),
    service: VehicleService = Depends(get_vehicle_service)
):
    vehicle = await service.get_vehicle_by_id(id)
    return ApiResponse(success=True, message="Vehicle retrieved successfully.", data=vehicle)

@router.get("/{id}/maintenance-history", response_model=ApiResponse[list[MaintenanceRecordResponse]])
async def get_vehicle_maintenance_history(
    id: uuid.UUID,
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db)
):
    service = MaintenanceService(db)
    records = await service.get_history_by_vehicle(id)
    return ApiResponse(success=True, message="Vehicle maintenance history retrieved.", data=records)

@router.get("/{id}/cost-summary", response_model=ApiResponse[VehicleCostSummaryResponse])
async def get_vehicle_cost_summary(
    id: uuid.UUID,
    current_user: User = Depends(require_staff),
    service: VehicleService = Depends(get_vehicle_service)
):
    vehicle = await service.get_vehicle_by_id(id)
    
    avg_cost = 0.0
    if vehicle.current_odometer > 0:
        avg_cost = vehicle.total_operational_cost / vehicle.current_odometer
        
    summary = {
        "vehicle_id": vehicle.id,
        "lifetime_fuel_cost": vehicle.total_fuel_cost,
        "lifetime_maintenance_cost": vehicle.total_maintenance_cost,
        "lifetime_other_expenses": vehicle.total_other_expenses,
        "lifetime_operational_cost": vehicle.total_operational_cost,
        "average_cost_per_km": round(avg_cost, 2)
    }
    
    return ApiResponse(success=True, message="Vehicle cost summary retrieved.", data=summary)

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
