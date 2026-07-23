from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Any, Dict
from datetime import datetime

from app.repositories.report_repository import ReportRepository
from app.services.export_service import ExportService
from app.schemas.reports import (
    FleetUtilizationItem, VehiclePerformanceItem, DriverPerformanceItem,
    FuelEfficiencyItem, OperationalCostItem, VehicleROIItem,
    RevenueAnalysisItem, MaintenanceReportItem, TripSummaryItem
)

class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ReportRepository(db)

    async def get_fleet_utilization(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, as_export: bool = False):
        data = await self.repo.get_fleet_utilization(start_date, end_date)
        results = []
        for row in data:
            idle_time = 0.0
            utilization = 100.0 if row.total_trips > 0 else 0.0
            
            results.append({
                "vehicle_id": row.vehicle_id,
                "registration_number": row.registration_number,
                "total_trips": row.total_trips,
                "distance_travelled": float(row.distance_travelled or 0),
                "idle_time_hours": idle_time,
                "utilization_percentage": utilization
            })
            
        if as_export:
            return results
        return [FleetUtilizationItem(**r) for r in results]

    async def get_vehicle_performance(self, as_export: bool = False):
        data = await self.repo.get_vehicle_performance()
        results = []
        for row in data:
            cost_per_km = 0.0
            if row.current_odometer and row.current_odometer > 0:
                cost_per_km = row.total_operational_cost / row.current_odometer
                
            results.append({
                "vehicle_id": row.id,
                "registration_number": row.registration_number,
                "trips_completed": row.trips_completed,
                "distance": float(row.current_odometer or 0),
                "fuel_cost": float(row.total_fuel_cost or 0),
                "maintenance_cost": float(row.total_maintenance_cost or 0),
                "expense_cost": float(row.total_other_expenses or 0),
                "operational_cost": float(row.total_operational_cost or 0),
                "cost_per_km": round(cost_per_km, 2)
            })
            
        if as_export:
            return results
        return [VehiclePerformanceItem(**r) for r in results]

    async def get_driver_performance(self, as_export: bool = False):
        data = await self.repo.get_driver_performance()
        results = []
        for row in data:
            avg_trip_dist = 0.0
            if row.trips_completed > 0:
                avg_trip_dist = row.total_distance / row.trips_completed
                
            results.append({
                "driver_id": row.id,
                "name": f"{row.first_name} {row.last_name}",
                "trips_completed": row.trips_completed,
                "distance_driven": float(row.total_distance or 0),
                "safety_score": float(row.safety_score or 0),
                "fuel_consumption": float(row.fuel_consumption or 0),
                "avg_trip_distance": round(avg_trip_dist, 2)
            })
            
        if as_export:
            return results
        return [DriverPerformanceItem(**r) for r in results]

    async def get_fuel_efficiency(self, as_export: bool = False):
        data = await self.repo.get_fuel_efficiency()
        results = []
        for row in data:
            km_per_liter = 0.0
            if row.fuel_consumed and row.fuel_consumed > 0:
                km_per_liter = row.distance / row.fuel_consumed
                
            results.append({
                "vehicle_id": row.id,
                "registration_number": row.registration_number,
                "distance": float(row.distance or 0),
                "fuel_consumed": float(row.fuel_consumed or 0),
                "km_per_liter": round(km_per_liter, 2)
            })
            
        if as_export:
            return results
        return [FuelEfficiencyItem(**r) for r in results]

    async def get_operational_cost(self, as_export: bool = False):
        data = await self.repo.get_operational_cost()
        results = []
        for row in data:
            results.append({
                "vehicle_id": row.id,
                "registration_number": row.registration_number,
                "fuel_cost": float(row.total_fuel_cost or 0),
                "maintenance_cost": float(row.total_maintenance_cost or 0),
                "other_expenses": float(row.total_other_expenses or 0),
                "total_operational_cost": float(row.total_operational_cost or 0)
            })
            
        if as_export:
            return results
        return [OperationalCostItem(**r) for r in results]

    async def get_vehicle_roi(self, as_export: bool = False):
        data = await self.repo.get_vehicle_roi()
        results = []
        for row in data:
            roi = 0.0
            rev = float(row.revenue or 0)
            maint = float(row.total_maintenance_cost or 0)
            fuel = float(row.total_fuel_cost or 0)
            other = float(row.total_other_expenses or 0)
            acq = float(row.acquisition_cost or 0)
            
            if acq > 0:
                roi = ((rev - (maint + fuel + other)) / acq) * 100
                
            results.append({
                "vehicle_id": row.id,
                "registration_number": row.registration_number,
                "acquisition_cost": acq,
                "revenue": rev,
                "maintenance_cost": maint,
                "fuel_cost": fuel,
                "other_expenses": other,
                "roi_percentage": round(roi, 2)
            })
            
        if as_export:
            return results
        return [VehicleROIItem(**r) for r in results]

    async def get_revenue_analysis(self, as_export: bool = False):
        data = await self.repo.get_revenue_analysis()
        results = []
        for row in data:
            rev = float(row.revenue or 0)
            exp = float(row.expenses or 0)
            
            results.append({
                "period": f"{int(row.year)}-{int(row.month):02d}",
                "revenue": rev,
                "expenses": exp,
                "profit": rev - exp
            })
            
        if as_export:
            return results
        return [RevenueAnalysisItem(**r) for r in results]

    async def get_maintenance_report(self, as_export: bool = False):
        data = await self.repo.get_maintenance_report()
        results = []
        for row in data:
            results.append({
                "vehicle_id": row.id,
                "registration_number": row.registration_number,
                "total_maintenance_cost": float(row.total_maintenance_cost or 0),
                "frequency": row.frequency,
                "downtime_hours": 0.0
            })
            
        if as_export:
            return results
        return [MaintenanceReportItem(**r) for r in results]

    async def get_trip_summary(self, as_export: bool = False):
        data = await self.repo.get_trip_summary()
        results = []
        for row in data:
            comp = row.completed_trips or 0
            avg_dist = float(row.total_distance or 0) / comp if comp > 0 else 0.0
            avg_rev = float(row.total_revenue or 0) / comp if comp > 0 else 0.0
            avg_fuel = float(row.total_fuel_cost or 0) / comp if comp > 0 else 0.0
            
            results.append({
                "period": f"{int(row.year)}-{int(row.month):02d}",
                "completed_trips": comp,
                "cancelled_trips": row.cancelled_trips or 0,
                "avg_distance": round(avg_dist, 2),
                "avg_revenue": round(avg_rev, 2),
                "avg_fuel_cost": round(avg_fuel, 2)
            })
            
        if as_export:
            return results
        return [TripSummaryItem(**r) for r in results]

    async def export_report(self, report_type: str, export_format: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
        dispatch = {
            "fleet-utilization": lambda: self.get_fleet_utilization(start_date, end_date, as_export=True),
            "vehicle-performance": lambda: self.get_vehicle_performance(as_export=True),
            "driver-performance": lambda: self.get_driver_performance(as_export=True),
            "fuel-efficiency": lambda: self.get_fuel_efficiency(as_export=True),
            "operational-cost": lambda: self.get_operational_cost(as_export=True),
            "vehicle-roi": lambda: self.get_vehicle_roi(as_export=True),
            "revenue": lambda: self.get_revenue_analysis(as_export=True),
            "maintenance": lambda: self.get_maintenance_report(as_export=True),
            "trips": lambda: self.get_trip_summary(as_export=True),
        }
        
        if report_type not in dispatch:
            raise ValueError(f"Invalid report type: {report_type}")
            
        data = await dispatch[report_type]()
        
        if export_format == "csv":
            return ExportService.generate_csv(data), "text/csv", f"{report_type}.csv"
        elif export_format == "excel":
            return ExportService.generate_excel(data), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", f"{report_type}.xlsx"
        elif export_format == "pdf":
            return ExportService.generate_pdf(data, title=report_type.replace("-", " ").title()), "application/pdf", f"{report_type}.pdf"
        else:
            raise ValueError(f"Invalid export format: {export_format}")
