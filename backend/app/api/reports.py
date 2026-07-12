from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.dependencies.auth import require_role, Role
from app.models.user import User
from app.services.report_service import ReportService
from app.schemas.reports import ReportResponse

router = APIRouter(prefix="/api/reports", tags=["Reports"])

require_report_viewer = require_role([Role.ADMIN, Role.FINANCIAL_ANALYST, Role.FLEET_MANAGER])

def get_report_service(db: AsyncSession = Depends(get_db)) -> ReportService:
    return ReportService(db)

@router.get("/fleet-utilization", response_model=ReportResponse)
async def get_fleet_utilization(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    data = await service.get_fleet_utilization(start_date, end_date)
    return ReportResponse(data=data)

@router.get("/vehicle-performance", response_model=ReportResponse)
async def get_vehicle_performance(
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    data = await service.get_vehicle_performance()
    return ReportResponse(data=data)

@router.get("/driver-performance", response_model=ReportResponse)
async def get_driver_performance(
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    data = await service.get_driver_performance()
    return ReportResponse(data=data)

@router.get("/fuel-efficiency", response_model=ReportResponse)
async def get_fuel_efficiency(
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    data = await service.get_fuel_efficiency()
    return ReportResponse(data=data)

@router.get("/operational-cost", response_model=ReportResponse)
async def get_operational_cost(
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    data = await service.get_operational_cost()
    return ReportResponse(data=data)

@router.get("/vehicle-roi", response_model=ReportResponse)
async def get_vehicle_roi(
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    data = await service.get_vehicle_roi()
    return ReportResponse(data=data)

@router.get("/revenue", response_model=ReportResponse)
async def get_revenue_analysis(
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    data = await service.get_revenue_analysis()
    return ReportResponse(data=data)

@router.get("/maintenance", response_model=ReportResponse)
async def get_maintenance_report(
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    data = await service.get_maintenance_report()
    return ReportResponse(data=data)

@router.get("/trips", response_model=ReportResponse)
async def get_trip_summary(
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    data = await service.get_trip_summary()
    return ReportResponse(data=data)

@router.get("/export/{export_format}")
async def export_report(
    export_format: str,
    report_type: str = Query(..., description="e.g. fleet-utilization, vehicle-roi"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(require_report_viewer),
    service: ReportService = Depends(get_report_service)
):
    if export_format not in ["csv", "excel", "pdf"]:
        raise HTTPException(status_code=400, detail="Invalid export format")
        
    try:
        buffer, media_type, filename = await service.export_report(report_type, export_format, start_date, end_date)
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Report generation failed")
