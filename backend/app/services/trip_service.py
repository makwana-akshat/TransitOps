import uuid
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.repositories.trip_repository import TripRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.repositories.driver_repository import DriverRepository
from app.schemas.trip import TripCreate, TripUpdate, TripCompleteUpdate
from app.models.user import User
from app.enums.fleet import TripStatus, VehicleStatus, DriverStatus

class TripService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = TripRepository(db)
        self.vehicle_repo = VehicleRepository(db)
        self.driver_repo = DriverRepository(db)

    async def get_trips(self, page: int, page_size: int, search: Optional[str] = None, **filters):
        return await self.repo.get_paginated(page, page_size, search, **filters)

    async def get_active_trips(self):
        return await self.repo.get_active_trips()

    async def get_trip_by_id(self, trip_id: uuid.UUID):
        trip = await self.repo.get_by_id_with_relations(trip_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        return trip

    async def create_trip(self, trip_in: TripCreate, current_user: User):
        vehicle = await self.vehicle_repo.get_by_id(trip_in.vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
            
        driver = await self.driver_repo.get_by_id(trip_in.driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        if vehicle.status != VehicleStatus.AVAILABLE:
            raise HTTPException(status_code=409, detail="Vehicle is not available")
            
        if driver.status != DriverStatus.AVAILABLE:
            raise HTTPException(status_code=409, detail="Driver is not available")
            
        if vehicle.capacity_kg is not None and trip_in.cargo_weight > vehicle.capacity_kg:
            raise HTTPException(status_code=400, detail="Cargo weight exceeds vehicle capacity")
            
        if driver.license_expiry and driver.license_expiry < datetime.now(timezone.utc).date():
            raise HTTPException(status_code=400, detail="Driver license is expired")

        trip_number = await self.repo.generate_trip_number()
        
        trip_data = trip_in.model_dump(exclude_unset=True)
        trip_data["trip_number"] = trip_number
        trip_data["created_by"] = current_user.id
        
        return await self.repo.create(trip_data)

    async def update_trip(self, trip_id: uuid.UUID, trip_in: TripUpdate):
        trip = await self.get_trip_by_id(trip_id)
        
        if trip.status != TripStatus.DRAFT:
            raise HTTPException(status_code=400, detail="Can only update DRAFT trips directly. Use specialized endpoints for status transitions.")
            
        update_data = trip_in.model_dump(exclude_unset=True)
        return await self.repo.update(trip, update_data)

    async def delete_trip(self, trip_id: uuid.UUID):
        trip = await self.get_trip_by_id(trip_id)
        if trip.status not in [TripStatus.DRAFT, TripStatus.CANCELLED]:
            raise HTTPException(status_code=400, detail="Cannot soft-delete a dispatched or completed trip. Cancel it first.")
        await self.repo.soft_delete(trip)

    async def dispatch_trip(self, trip_id: uuid.UUID, current_user: User):
        trip = await self.get_trip_by_id(trip_id)
        
        if trip.status != TripStatus.DRAFT:
            raise HTTPException(status_code=400, detail="Only DRAFT trips can be dispatched")

        vehicle = await self.vehicle_repo.get_by_id(trip.vehicle_id)
        driver = await self.driver_repo.get_by_id(trip.driver_id)
        
        if vehicle.status != VehicleStatus.AVAILABLE:
            raise HTTPException(status_code=409, detail="Vehicle is no longer available")
        if driver.status != DriverStatus.AVAILABLE:
            raise HTTPException(status_code=409, detail="Driver is no longer available")
        if driver.license_expiry and driver.license_expiry < datetime.now(timezone.utc).date():
            raise HTTPException(status_code=400, detail="Driver license is expired")

        async with self.db.begin_nested():
            trip.status = TripStatus.DISPATCHED
            trip.actual_start = datetime.now(timezone.utc)
            vehicle.status = VehicleStatus.ON_TRIP
            driver.status = DriverStatus.ON_TRIP
            
            self.db.add(trip)
            self.db.add(vehicle)
            self.db.add(driver)
            
        await self.db.commit()
        await self.db.refresh(trip)
        return trip

    async def complete_trip(self, trip_id: uuid.UUID, complete_in: TripCompleteUpdate, current_user: User):
        trip = await self.get_trip_by_id(trip_id)
        
        if trip.status != TripStatus.DISPATCHED:
            raise HTTPException(status_code=400, detail="Only DISPATCHED trips can be completed")

        vehicle = await self.vehicle_repo.get_by_id(trip.vehicle_id)
        driver = await self.driver_repo.get_by_id(trip.driver_id)

        if complete_in.final_odometer <= vehicle.current_odometer:
            raise HTTPException(status_code=400, detail="Final odometer must be strictly greater than current odometer")

        async with self.db.begin_nested():
            trip.status = TripStatus.COMPLETED
            trip.actual_end = datetime.now(timezone.utc)
            trip.actual_distance = complete_in.actual_distance
            trip.fuel_consumed = complete_in.fuel_consumed
            trip.trip_revenue = complete_in.trip_revenue
            
            vehicle.status = VehicleStatus.AVAILABLE
            vehicle.current_odometer = complete_in.final_odometer
            
            driver.status = DriverStatus.AVAILABLE
            
            self.db.add(trip)
            self.db.add(vehicle)
            self.db.add(driver)
            
        await self.db.commit()
        await self.db.refresh(trip)
        return trip

    async def cancel_trip(self, trip_id: uuid.UUID, current_user: User):
        trip = await self.get_trip_by_id(trip_id)
        
        if trip.status in [TripStatus.COMPLETED, TripStatus.CANCELLED]:
            raise HTTPException(status_code=400, detail="Cannot cancel a completed or already cancelled trip")

        async with self.db.begin_nested():
            if trip.status == TripStatus.DISPATCHED:
                vehicle = await self.vehicle_repo.get_by_id(trip.vehicle_id)
                driver = await self.driver_repo.get_by_id(trip.driver_id)
                if vehicle:
                    vehicle.status = VehicleStatus.AVAILABLE
                    self.db.add(vehicle)
                if driver:
                    driver.status = DriverStatus.AVAILABLE
                    self.db.add(driver)
                    
            trip.status = TripStatus.CANCELLED
            self.db.add(trip)
            
        await self.db.commit()
        await self.db.refresh(trip)
        return trip
