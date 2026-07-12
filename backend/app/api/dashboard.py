from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies.auth import require_role, Role
from app.models.user import User
from app.schemas.dashboard import (
    DashboardOverviewResponse, RecentActivityItem, StatusChartItem, 
    MonthlyTripItem, MonthlyCostItem, TopVehicleItem, TopDriverItem, 
    AlertItem, GlobalSearchResponse
)
from app.schemas.common import ApiResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

require_staff = require_role([Role.ADMIN, Role.FLEET_MANAGER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST])

def get_dashboard_service(db: AsyncSession = Depends(get_db)) -> DashboardService:
    return DashboardService(db)

@router.get("/overview", response_model=ApiResponse[DashboardOverviewResponse])
async def get_overview(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_overview()
    return ApiResponse(success=True, message="Dashboard overview retrieved successfully.", data=data)

@router.get("/recent-activity", response_model=ApiResponse[List[RecentActivityItem]])
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_recent_activity(limit)
    return ApiResponse(success=True, message="Recent activity retrieved successfully.", data=data)

@router.get("/charts/vehicle-status", response_model=ApiResponse[List[StatusChartItem]])
async def get_vehicle_status_chart(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_vehicle_status_chart()
    return ApiResponse(success=True, message="Vehicle status chart retrieved successfully.", data=data)

@router.get("/charts/driver-status", response_model=ApiResponse[List[StatusChartItem]])
async def get_driver_status_chart(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_driver_status_chart()
    return ApiResponse(success=True, message="Driver status chart retrieved successfully.", data=data)

@router.get("/charts/trip-status", response_model=ApiResponse[List[StatusChartItem]])
async def get_trip_status_chart(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_trip_status_chart()
    return ApiResponse(success=True, message="Trip status chart retrieved successfully.", data=data)

@router.get("/charts/monthly-trips", response_model=ApiResponse[List[MonthlyTripItem]])
async def get_monthly_trips(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_monthly_trips()
    return ApiResponse(success=True, message="Monthly trips chart retrieved successfully.", data=data)

@router.get("/charts/monthly-fuel-cost", response_model=ApiResponse[List[MonthlyCostItem]])
async def get_monthly_fuel_cost(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_monthly_fuel_cost()
    return ApiResponse(success=True, message="Monthly fuel cost chart retrieved successfully.", data=data)

@router.get("/charts/monthly-expenses", response_model=ApiResponse[List[MonthlyCostItem]])
async def get_monthly_expenses(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_monthly_expenses()
    return ApiResponse(success=True, message="Monthly expenses chart retrieved successfully.", data=data)

@router.get("/top-vehicles", response_model=ApiResponse[List[TopVehicleItem]])
async def get_top_vehicles(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_top_vehicles()
    return ApiResponse(success=True, message="Top vehicles retrieved successfully.", data=data)

@router.get("/top-drivers", response_model=ApiResponse[List[TopDriverItem]])
async def get_top_drivers(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_top_drivers()
    return ApiResponse(success=True, message="Top drivers retrieved successfully.", data=data)

@router.get("/alerts", response_model=ApiResponse[List[AlertItem]])
async def get_alerts(
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.get_alerts()
    return ApiResponse(success=True, message="Alerts retrieved successfully.", data=data)

@router.get("/search", response_model=ApiResponse[GlobalSearchResponse])
async def get_search(
    search: str = Query(..., min_length=1),
    current_user: User = Depends(require_staff),
    service: DashboardService = Depends(get_dashboard_service)
):
    data = await service.global_search(search)
    return ApiResponse(success=True, message="Search results retrieved successfully.", data=data)
