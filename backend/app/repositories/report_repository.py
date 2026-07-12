from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime

from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.expense import FuelLog
from app.models.maintenance import MaintenanceRecord
from app.enums.fleet import TripStatus

class ReportRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _apply_date_filter(self, query, column, start_date: Optional[datetime], end_date: Optional[datetime]):
        if start_date:
            query = query.where(column >= start_date)
        if end_date:
            query = query.where(column <= end_date)
        return query

    async def get_fleet_utilization(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
        query = select(
            Vehicle.id,
            Vehicle.registration_number,
            func.count(Trip.id).label("total_trips"),
            func.sum(Trip.actual_distance).label("distance_travelled")
        ).outerjoin(
            Trip, (Vehicle.id == Trip.vehicle_id) & (Trip.status == TripStatus.COMPLETED)
        ).where(Vehicle.deleted_at.is_(None))
        
        query = self._apply_date_filter(query, Trip.actual_end, start_date, end_date)
        query = query.group_by(Vehicle.id)
        
        res = await self.db.execute(query)
        return res.all()

    async def get_vehicle_performance(self):
        query = select(
            Vehicle.id,
            Vehicle.registration_number,
            Vehicle.current_odometer,
            Vehicle.total_fuel_cost,
            Vehicle.total_maintenance_cost,
            Vehicle.total_other_expenses,
            Vehicle.total_operational_cost,
            func.count(Trip.id).label("trips_completed")
        ).outerjoin(
            Trip, (Vehicle.id == Trip.vehicle_id) & (Trip.status == TripStatus.COMPLETED)
        ).where(Vehicle.deleted_at.is_(None)).group_by(Vehicle.id)
        
        res = await self.db.execute(query)
        return res.all()

    async def get_driver_performance(self):
        query = select(
            Driver.id,
            Driver.first_name,
            Driver.last_name,
            Driver.safety_score,
            Driver.total_distance,
            func.count(Trip.id).label("trips_completed"),
            func.sum(Trip.trip_fuel_cost).label("fuel_consumption")
        ).outerjoin(
            Trip, (Driver.id == Trip.driver_id) & (Trip.status == TripStatus.COMPLETED)
        ).where(Driver.deleted_at.is_(None)).group_by(Driver.id)
        
        res = await self.db.execute(query)
        return res.all()

    async def get_fuel_efficiency(self):
        query = select(
            Vehicle.id,
            Vehicle.registration_number,
            Vehicle.current_odometer.label("distance"),
            func.sum(FuelLog.liters).label("fuel_consumed")
        ).outerjoin(
            FuelLog, Vehicle.id == FuelLog.vehicle_id
        ).where(Vehicle.deleted_at.is_(None)).group_by(Vehicle.id)
        
        res = await self.db.execute(query)
        return res.all()

    async def get_operational_cost(self):
        query = select(
            Vehicle.id,
            Vehicle.registration_number,
            Vehicle.total_fuel_cost,
            Vehicle.total_maintenance_cost,
            Vehicle.total_other_expenses,
            Vehicle.total_operational_cost
        ).where(Vehicle.deleted_at.is_(None))
        
        res = await self.db.execute(query)
        return res.all()

    async def get_vehicle_roi(self):
        query = select(
            Vehicle.id,
            Vehicle.registration_number,
            Vehicle.purchase_price.label("acquisition_cost"),
            func.sum(Trip.trip_revenue).label("revenue"),
            Vehicle.total_maintenance_cost,
            Vehicle.total_fuel_cost,
            Vehicle.total_other_expenses
        ).outerjoin(
            Trip, (Vehicle.id == Trip.vehicle_id) & (Trip.status == TripStatus.COMPLETED)
        ).where(Vehicle.deleted_at.is_(None)).group_by(Vehicle.id)
        
        res = await self.db.execute(query)
        return res.all()

    async def get_revenue_analysis(self):
        query = select(
            extract('year', Trip.actual_end).label("year"),
            extract('month', Trip.actual_end).label("month"),
            func.sum(Trip.trip_revenue).label("revenue"),
            func.sum(Trip.trip_operational_cost).label("expenses")
        ).where(
            Trip.status == TripStatus.COMPLETED,
            Trip.actual_end.is_not(None)
        ).group_by(
            extract('year', Trip.actual_end),
            extract('month', Trip.actual_end)
        )
        
        res = await self.db.execute(query)
        return res.all()

    async def get_maintenance_report(self):
        query = select(
            Vehicle.id,
            Vehicle.registration_number,
            Vehicle.total_maintenance_cost,
            func.count(MaintenanceRecord.id).label("frequency")
        ).outerjoin(
            MaintenanceRecord, Vehicle.id == MaintenanceRecord.vehicle_id
        ).where(Vehicle.deleted_at.is_(None)).group_by(Vehicle.id)
        
        res = await self.db.execute(query)
        return res.all()

    async def get_trip_summary(self):
        query = select(
            extract('year', Trip.created_at).label("year"),
            extract('month', Trip.created_at).label("month"),
            func.count(Trip.id).filter(Trip.status == TripStatus.COMPLETED).label("completed_trips"),
            func.count(Trip.id).filter(Trip.status == TripStatus.CANCELLED).label("cancelled_trips"),
            func.sum(Trip.actual_distance).filter(Trip.status == TripStatus.COMPLETED).label("total_distance"),
            func.sum(Trip.trip_revenue).filter(Trip.status == TripStatus.COMPLETED).label("total_revenue"),
            func.sum(Trip.trip_fuel_cost).filter(Trip.status == TripStatus.COMPLETED).label("total_fuel_cost")
        ).group_by(
            extract('year', Trip.created_at),
            extract('month', Trip.created_at)
        )
        
        res = await self.db.execute(query)
        return res.all()
