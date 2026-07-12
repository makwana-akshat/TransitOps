import uuid
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleStatusUpdate
from app.models.user import User
from app.enums.fleet import VehicleStatus

class VehicleService:
    def __init__(self, db: AsyncSession):
        self.repo = VehicleRepository(db)

    async def get_vehicles(self, page: int, page_size: int, search: Optional[str] = None, **filters):
        return await self.repo.get_paginated(page, page_size, search, **filters)

    async def get_vehicle_by_id(self, vehicle_id: uuid.UUID):
        vehicle = await self.repo.get_by_id(vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        return vehicle

    async def create_vehicle(self, vehicle_in: VehicleCreate, current_user: User):
        existing = await self.repo.get_by_registration(vehicle_in.registration_number)
        if existing:
            raise HTTPException(status_code=409, detail="Registration number already exists")
        
        vehicle_data = vehicle_in.model_dump(exclude_unset=True)
        vehicle_data["created_by"] = current_user.id
        return await self.repo.create(vehicle_data)

    async def update_vehicle(self, vehicle_id: uuid.UUID, vehicle_in: VehicleUpdate):
        vehicle = await self.get_vehicle_by_id(vehicle_id)
        
        update_data = vehicle_in.model_dump(exclude_unset=True)
        
        if vehicle.status == VehicleStatus.RETIRED:
            # Can only edit notes
            if any(k != "notes" for k in update_data.keys()):
                raise HTTPException(status_code=400, detail="Cannot edit a retired vehicle except for notes")

        if vehicle_in.registration_number and vehicle_in.registration_number != vehicle.registration_number:
            existing = await self.repo.get_by_registration(vehicle_in.registration_number)
            if existing and existing.id != vehicle.id:
                raise HTTPException(status_code=409, detail="Registration number already exists")

        if vehicle_in.current_odometer is not None and vehicle_in.current_odometer < vehicle.current_odometer:
            raise HTTPException(status_code=400, detail="Current odometer cannot decrease")

        if vehicle_in.status and vehicle_in.status != vehicle.status:
            self._validate_status_transition(vehicle.status, vehicle_in.status)

        return await self.repo.update(vehicle, update_data)

    async def update_status(self, vehicle_id: uuid.UUID, status_in: VehicleStatusUpdate):
        vehicle = await self.get_vehicle_by_id(vehicle_id)
        if status_in.status != vehicle.status:
            self._validate_status_transition(vehicle.status, status_in.status)
        return await self.repo.update(vehicle, {"status": status_in.status})

    async def delete_vehicle(self, vehicle_id: uuid.UUID):
        vehicle = await self.get_vehicle_by_id(vehicle_id)
        if vehicle.status == VehicleStatus.RETIRED:
            raise HTTPException(status_code=400, detail="Cannot delete a retired vehicle")
        await self.repo.soft_delete(vehicle)

    def _validate_status_transition(self, current_status: VehicleStatus, new_status: VehicleStatus):
        if current_status == VehicleStatus.RETIRED and new_status == VehicleStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail="Retired vehicles cannot become available")
        if current_status == VehicleStatus.IN_SHOP and new_status == VehicleStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail="In shop vehicles cannot become available directly")
