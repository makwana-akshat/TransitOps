from sqlalchemy import select, func, desc, extract, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone, date
import asyncio

from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance import MaintenanceRecord
from app.models.expense import FuelLog, Expense
from app.enums.fleet import VehicleStatus, TripStatus, DriverStatus

class AnalyticsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_overview(self):
        active_vehicles = await self.db.execute(select(func.count(Vehicle.id)).where(Vehicle.status != VehicleStatus.RETIRED, Vehicle.deleted_at.is_(None)))
        available_vehicles = await self.db.execute(select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatus.AVAILABLE, Vehicle.deleted_at.is_(None)))
        vehicles_in_maintenance = await self.db.execute(select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatus.IN_SHOP, Vehicle.deleted_at.is_(None)))
        retired_vehicles = await self.db.execute(select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatus.RETIRED, Vehicle.deleted_at.is_(None)))
        on_trip_vehicles = await self.db.execute(select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatus.ON_TRIP, Vehicle.deleted_at.is_(None)))
        
        active_trips = await self.db.execute(select(func.count(Trip.id)).where(Trip.status == TripStatus.DISPATCHED))
        completed_trips_today = await self.db.execute(select(func.count(Trip.id)).where(Trip.status == TripStatus.COMPLETED, cast(Trip.actual_end, Date) == datetime.now(timezone.utc).date()))
        pending_trips = await self.db.execute(select(func.count(Trip.id)).where(Trip.status == TripStatus.DRAFT))
        
        drivers_on_duty = await self.db.execute(select(func.count(Driver.id)).where(Driver.status == DriverStatus.ON_TRIP, Driver.deleted_at.is_(None)))
        available_drivers = await self.db.execute(select(func.count(Driver.id)).where(Driver.status == DriverStatus.AVAILABLE, Driver.deleted_at.is_(None)))
        suspended_drivers = await self.db.execute(select(func.count(Driver.id)).where(Driver.status == DriverStatus.SUSPENDED, Driver.deleted_at.is_(None)))
        
        costs_res = await self.db.execute(select(
            func.sum(Vehicle.total_fuel_cost).label("fuel"),
            func.sum(Vehicle.total_maintenance_cost).label("maintenance"),
            func.sum(Vehicle.total_operational_cost).label("operational")
        ).where(Vehicle.deleted_at.is_(None)))
        
        costs = costs_res.first()
        return {
            "activeVehicles": active_vehicles.scalar() or 0,
            "availableVehicles": available_vehicles.scalar() or 0,
            "vehiclesInMaintenance": vehicles_in_maintenance.scalar() or 0,
            "retiredVehicles": retired_vehicles.scalar() or 0,
            "onTripVehicles": on_trip_vehicles.scalar() or 0,
            
            "activeTrips": active_trips.scalar() or 0,
            "completedTripsToday": completed_trips_today.scalar() or 0,
            "pendingTrips": pending_trips.scalar() or 0,
            
            "driversOnDuty": drivers_on_duty.scalar() or 0,
            "availableDrivers": available_drivers.scalar() or 0,
            "suspendedDrivers": suspended_drivers.scalar() or 0,
            
            "totalFuelCost": float(costs.fuel or 0.0) if costs else 0.0,
            "totalMaintenanceCost": float(costs.maintenance or 0.0) if costs else 0.0,
            "totalOperationalCost": float(costs.operational or 0.0) if costs else 0.0
        }

    async def get_recent_activity(self, limit: int = 10):
        recent = []
        
        v_query = select(Vehicle.id, Vehicle.registration_number, Vehicle.created_at).order_by(desc(Vehicle.created_at)).limit(limit)
        d_query = select(Driver.id, Driver.full_name, Driver.created_at).order_by(desc(Driver.created_at)).limit(limit)
        t_query = select(Trip.id, Trip.trip_number, Trip.created_at).order_by(desc(Trip.created_at)).limit(limit)
        
        v_res = await self.db.execute(v_query)
        d_res = await self.db.execute(d_query)
        t_res = await self.db.execute(t_query)
        
        for v in v_res.all():
            recent.append({"id": v.id, "activity_type": "Vehicle Added", "description": f"Vehicle {v.registration_number} added", "created_at": v.created_at})
        for d in d_res.all():
            recent.append({"id": d.id, "activity_type": "Driver Added", "description": f"Driver {d.full_name} added", "created_at": d.created_at})
        for t in t_res.all():
            recent.append({"id": t.id, "activity_type": "Trip Created", "description": f"Trip {t.trip_number} scheduled", "created_at": t.created_at})
            
        recent.sort(key=lambda x: x["created_at"], reverse=True)
        return recent[:limit]

    async def get_vehicle_status_chart(self):
        query = select(Vehicle.status, func.count(Vehicle.id)).where(Vehicle.deleted_at.is_(None)).group_by(Vehicle.status)
        result = await self.db.execute(query)
        return [{"status": row[0].value, "count": row[1]} for row in result.all()]
        
    async def get_driver_status_chart(self):
        query = select(Driver.status, func.count(Driver.id)).where(Driver.deleted_at.is_(None)).group_by(Driver.status)
        result = await self.db.execute(query)
        return [{"status": row[0].value, "count": row[1]} for row in result.all()]
        
    async def get_trip_status_chart(self):
        query = select(Trip.status, func.count(Trip.id)).group_by(Trip.status)
        result = await self.db.execute(query)
        return [{"status": row[0].value, "count": row[1]} for row in result.all()]

    async def get_monthly_trips(self):
        # We group by EXTRACT(MONTH) and YEAR
        query = select(
            extract('year', Trip.created_at).label('year'),
            extract('month', Trip.created_at).label('month'),
            func.count(Trip.id).label('count')
        ).group_by(
            extract('year', Trip.created_at),
            extract('month', Trip.created_at)
        ).order_by(desc('year'), desc('month')).limit(12)
        
        result = await self.db.execute(query)
        return [{"month": f"{int(row.year)}-{int(row.month):02d}", "trip_count": row.count} for row in result.all()]
        
    async def get_monthly_fuel_cost(self):
        query = select(
            extract('year', FuelLog.filled_at).label('year'),
            extract('month', FuelLog.filled_at).label('month'),
            func.sum(FuelLog.total_cost).label('cost')
        ).where(FuelLog.deleted_at.is_(None)).group_by(
            extract('year', FuelLog.filled_at),
            extract('month', FuelLog.filled_at)
        ).order_by(desc('year'), desc('month')).limit(12)
        
        result = await self.db.execute(query)
        return [{"month": f"{int(row.year)}-{int(row.month):02d}", "cost": float(row.cost)} for row in result.all()]

    async def get_monthly_expenses(self):
        query = select(
            extract('year', Expense.expense_date).label('year'),
            extract('month', Expense.expense_date).label('month'),
            func.sum(Expense.amount).label('cost')
        ).where(Expense.deleted_at.is_(None)).group_by(
            extract('year', Expense.expense_date),
            extract('month', Expense.expense_date)
        ).order_by(desc('year'), desc('month')).limit(12)
        
        result = await self.db.execute(query)
        return [{"month": f"{int(row.year)}-{int(row.month):02d}", "cost": float(row.cost)} for row in result.all()]

    async def get_top_vehicles(self):
        # To get trips completed per vehicle, we can join Trip table or simply rely on distance and fuel_cost
        # For full accuracy, let's group Trip count
        query = select(
            Vehicle.id,
            Vehicle.registration_number,
            Vehicle.current_odometer,
            Vehicle.total_fuel_cost,
            func.count(Trip.id).label('trips_completed')
        ).outerjoin(
            Trip, (Vehicle.id == Trip.vehicle_id) & (Trip.status == TripStatus.COMPLETED)
        ).where(
            Vehicle.deleted_at.is_(None)
        ).group_by(
            Vehicle.id
        ).order_by(desc(Vehicle.current_odometer)).limit(10)
        
        result = await self.db.execute(query)
        return [{
            "vehicle_id": row.id,
            "registration": row.registration_number,
            "distance": row.current_odometer,
            "fuel_cost": row.total_fuel_cost,
            "trips_completed": row.trips_completed
        } for row in result.all()]

    async def get_top_drivers(self):
        query = select(
            Driver.id,
            Driver.full_name,
            Driver.safety_score,
            func.count(Trip.id).label('trips_completed')
        ).outerjoin(
            Trip, (Driver.id == Trip.driver_id) & (Trip.status == TripStatus.COMPLETED)
        ).where(
            Driver.deleted_at.is_(None)
        ).group_by(
            Driver.id
        ).order_by(desc('trips_completed')).limit(10)
        
        result = await self.db.execute(query)
        return [{
            "driver_id": row.id,
            "name": row.full_name,
            "safety_score": row.safety_score or 0.0,
            "distance": 0.0,
            "trips_completed": row.trips_completed
        } for row in result.all()]

    async def get_alerts(self):
        alerts = []
        
        # Suspended Drivers
        d_query = select(Driver).where(Driver.status == DriverStatus.SUSPENDED, Driver.deleted_at.is_(None))
        for d in (await self.db.execute(d_query)).scalars().all():
            alerts.append({"alert_type": "Driver Suspended", "description": f"{d.first_name} {d.last_name} is suspended.", "severity": "HIGH", "related_id": d.id})
            
        # Vehicles in shop
        v_query = select(Vehicle).where(Vehicle.status == VehicleStatus.IN_SHOP, Vehicle.deleted_at.is_(None))
        for v in (await self.db.execute(v_query)).scalars().all():
            alerts.append({"alert_type": "Vehicle In Maintenance", "description": f"{v.registration_number} is currently in the shop.", "severity": "MEDIUM", "related_id": v.id})
            
        return alerts

    async def global_search(self, query_str: str):
        search_pattern = f"%{query_str}%"
        
        v_query = select(Vehicle).where(Vehicle.registration_number.ilike(search_pattern), Vehicle.deleted_at.is_(None)).limit(5)
        d_query = select(Driver).where(
            Driver.full_name.ilike(search_pattern), 
            Driver.deleted_at.is_(None)
        ).limit(5)
        t_query = select(Trip).where(Trip.trip_number.ilike(search_pattern)).limit(5)
        
        v_res = await self.db.execute(v_query)
        d_res = await self.db.execute(d_query)
        t_res = await self.db.execute(t_query)
        
        return {
            "matchingVehicles": [{"id": v.id, "type": "VEHICLE", "title": v.registration_number, "subtitle": f"Status: {v.status.value}"} for v in v_res.scalars().all()],
            "matchingDrivers": [{"id": d.id, "type": "DRIVER", "title": d.full_name, "subtitle": f"Status: {d.status.value}"} for d in d_res.scalars().all()],
            "matchingTrips": [{"id": t.id, "type": "TRIP", "title": t.trip_number, "subtitle": f"Status: {t.status.value}"} for t in t_res.scalars().all()],
        }

    async def get_snapshots_for_date(self, target_date: date):
        from app.models.snapshot import DailySnapshot
        query = select(DailySnapshot).where(DailySnapshot.date == target_date)
        result = await self.db.execute(query)
        snapshots = result.scalars().all()
        return {s.metric_name: s.value for s in snapshots}
