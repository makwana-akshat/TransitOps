import time
from datetime import datetime, timedelta, date
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.dashboard import (
    DashboardOverviewResponse, RecentActivityItem, StatusChartItem, 
    MonthlyTripItem, MonthlyCostItem, TopVehicleItem, TopDriverItem, 
    AlertItem, GlobalSearchResponse
)

CACHE_TTL = 60 # 60 seconds
_cache: Dict[str, Any] = {}

class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AnalyticsRepository(db)

    async def _get_cached(self, key: str, func, *args, **kwargs):
        now = time.time()
        if key in _cache:
            entry = _cache[key]
            if now - entry["time"] < CACHE_TTL:
                return entry["data"]
                
        data = await func(*args, **kwargs)
        _cache[key] = {"data": data, "time": now}
        return data

    async def get_overview(self) -> DashboardOverviewResponse:
        data = await self._get_cached("overview", self.repo.get_overview)
        
        active_vehicles = data["activeVehicles"]
        on_trip_vehicles = data["onTripVehicles"]
        
        utilization = 0.0
        if active_vehicles > 0:
            utilization = round((on_trip_vehicles / active_vehicles) * 100, 2)
            
        target_date = datetime.now().date() - timedelta(days=30)
        snapshots = await self._get_cached(f"snapshots_{target_date}", self.repo.get_snapshots_for_date, target_date)
        
        def calc_change(current, previous):
            if previous > 0:
                return round(((current - previous) / previous) * 100, 1)
            return 100.0 if current > 0 else 0.0
            
        return DashboardOverviewResponse(
            activeVehicles=active_vehicles,
            activeVehiclesChange=calc_change(active_vehicles, snapshots.get("active_vehicles", 0)),
            availableVehicles=data["availableVehicles"],
            availableVehiclesChange=calc_change(data["availableVehicles"], snapshots.get("available_vehicles", 0)),
            vehiclesInMaintenance=data["vehiclesInMaintenance"],
            vehiclesInMaintenanceChange=calc_change(data["vehiclesInMaintenance"], snapshots.get("vehicles_in_maintenance", 0)),
            retiredVehicles=data["retiredVehicles"],
            activeTrips=data["activeTrips"],
            completedTripsToday=data["completedTripsToday"],
            completedTripsTodayChange=calc_change(data["completedTripsToday"], snapshots.get("completed_trips_today", 0)),
            pendingTrips=data["pendingTrips"],
            driversOnDuty=data["driversOnDuty"],
            driversOnDutyChange=calc_change(data["driversOnDuty"], snapshots.get("drivers_on_duty", 0)),
            availableDrivers=data["availableDrivers"],
            suspendedDrivers=data["suspendedDrivers"],
            fleetUtilization=utilization,
            fleetUtilizationChange=calc_change(utilization, snapshots.get("fleet_utilization", 0)),
            totalFuelCost=data["totalFuelCost"],
            totalMaintenanceCost=data["totalMaintenanceCost"],
            totalOperationalCost=data["totalOperationalCost"]
        )

    async def get_recent_activity(self, limit: int = 10) -> List[RecentActivityItem]:
        data = await self._get_cached(f"recent_activity_{limit}", self.repo.get_recent_activity, limit)
        return [RecentActivityItem(**item) for item in data]

    async def get_vehicle_status_chart(self) -> List[StatusChartItem]:
        data = await self._get_cached("vehicle_status_chart", self.repo.get_vehicle_status_chart)
        return [StatusChartItem(**item) for item in data]

    async def get_driver_status_chart(self) -> List[StatusChartItem]:
        data = await self._get_cached("driver_status_chart", self.repo.get_driver_status_chart)
        return [StatusChartItem(**item) for item in data]

    async def get_trip_status_chart(self) -> List[StatusChartItem]:
        data = await self._get_cached("trip_status_chart", self.repo.get_trip_status_chart)
        return [StatusChartItem(**item) for item in data]

    async def get_monthly_trips(self) -> List[MonthlyTripItem]:
        data = await self._get_cached("monthly_trips", self.repo.get_monthly_trips)
        return [MonthlyTripItem(**item) for item in data]

    async def get_monthly_fuel_cost(self) -> List[MonthlyCostItem]:
        data = await self._get_cached("monthly_fuel_cost", self.repo.get_monthly_fuel_cost)
        return [MonthlyCostItem(**item) for item in data]

    async def get_monthly_expenses(self) -> List[MonthlyCostItem]:
        data = await self._get_cached("monthly_expenses", self.repo.get_monthly_expenses)
        return [MonthlyCostItem(**item) for item in data]

    async def get_top_vehicles(self) -> List[TopVehicleItem]:
        data = await self._get_cached("top_vehicles", self.repo.get_top_vehicles)
        return [TopVehicleItem(**item) for item in data]

    async def get_top_drivers(self) -> List[TopDriverItem]:
        data = await self._get_cached("top_drivers", self.repo.get_top_drivers)
        return [TopDriverItem(**item) for item in data]

    async def get_alerts(self) -> List[AlertItem]:
        data = await self._get_cached("alerts", self.repo.get_alerts)
        return [AlertItem(**item) for item in data]

    async def global_search(self, search: str) -> GlobalSearchResponse:
        # We don't cache search due to high cardinality of queries
        data = await self.repo.global_search(search)
        return GlobalSearchResponse(**data)
