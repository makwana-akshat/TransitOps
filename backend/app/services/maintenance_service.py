import uuid
from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.repositories.maintenance_repository import MaintenanceRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.maintenance import MaintenanceRecordCreate, MaintenanceRecordUpdate, MaintenanceCompleteUpdate
from app.models.user import User
from app.enums.fleet import MaintenanceStatus, VehicleStatus

class MaintenanceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MaintenanceRepository(db)
        self.vehicle_repo = VehicleRepository(db)

    async def get_paginated(self, page: int, page_size: int, search: Optional[str] = None, **filters):
        return await self.repo.get_paginated(page, page_size, search, **filters)

    async def get_active(self):
        return await self.repo.get_active_maintenance()
        
    async def get_upcoming(self):
        return await self.repo.get_upcoming_maintenance()

    async def get_history_by_vehicle(self, vehicle_id: uuid.UUID):
        return await self.repo.get_history_by_vehicle(vehicle_id)

    async def get_by_id(self, record_id: uuid.UUID):
        record = await self.repo.get_by_id_with_vehicle(record_id)
        if not record:
            raise HTTPException(status_code=404, detail="Maintenance Record not found")
        return record

    async def create_maintenance(self, record_in: MaintenanceRecordCreate, current_user: User):
        vehicle = await self.vehicle_repo.get_by_id(record_in.vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
            
        if vehicle.status == VehicleStatus.RETIRED:
            raise HTTPException(status_code=400, detail="Cannot perform maintenance on a retired vehicle")
            
        if vehicle.status == VehicleStatus.ON_TRIP:
            raise HTTPException(status_code=409, detail="Vehicle is currently on a trip")
            
        active_records = await self.repo.get_active_for_vehicle(vehicle.id)
        if active_records:
            raise HTTPException(status_code=409, detail="Vehicle is already under active maintenance")

        async with self.db.begin_nested():
            record_data = record_in.model_dump(exclude_unset=True)
            record_data["created_by"] = current_user.id
            record = await self.repo.create(record_data)
            
            vehicle.status = VehicleStatus.IN_SHOP
            self.db.add(vehicle)
            
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def update_maintenance(self, record_id: uuid.UUID, record_in: MaintenanceRecordUpdate):
        record = await self.get_by_id(record_id)
        
        if record.status in [MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED]:
            raise HTTPException(status_code=400, detail="Cannot update completed or cancelled maintenance records directly.")
            
        update_data = record_in.model_dump(exclude_unset=True)
        return await self.repo.update(record, update_data)

    async def delete_maintenance(self, record_id: uuid.UUID):
        record = await self.get_by_id(record_id)
        if record.status in [MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS]:
            raise HTTPException(status_code=400, detail="Cannot soft-delete an active maintenance record. Cancel it first.")
        await self.repo.soft_delete(record)

    async def complete_maintenance(self, record_id: uuid.UUID, complete_in: MaintenanceCompleteUpdate, current_user: User):
        record = await self.get_by_id(record_id)
        
        if record.status not in [MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS]:
            raise HTTPException(status_code=400, detail="Only OPEN or IN_PROGRESS records can be completed")

        vehicle = await self.vehicle_repo.get_by_id(record.vehicle_id)

        async with self.db.begin_nested():
            record.status = MaintenanceStatus.COMPLETED
            record.completed_date = datetime.now(timezone.utc)
            record.actual_cost = complete_in.actual_cost
            if complete_in.mechanic_name:
                record.mechanic_name = complete_in.mechanic_name
            if complete_in.invoice_number:
                record.invoice_number = complete_in.invoice_number
            if complete_in.remarks:
                record.remarks = complete_in.remarks
            if complete_in.next_service_due:
                record.next_service_due = complete_in.next_service_due
                
            if vehicle and vehicle.status != VehicleStatus.RETIRED:
                vehicle.status = VehicleStatus.AVAILABLE
                self.db.add(vehicle)
                
            self.db.add(record)
            
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def cancel_maintenance(self, record_id: uuid.UUID, current_user: User):
        record = await self.get_by_id(record_id)
        
        if record.status in [MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED]:
            raise HTTPException(status_code=400, detail="Cannot cancel a completed or already cancelled maintenance record")

        async with self.db.begin_nested():
            vehicle = await self.vehicle_repo.get_by_id(record.vehicle_id)
            if vehicle and vehicle.status != VehicleStatus.RETIRED:
                vehicle.status = VehicleStatus.AVAILABLE
                self.db.add(vehicle)
                
            record.status = MaintenanceStatus.CANCELLED
            self.db.add(record)
            
        await self.db.commit()
        await self.db.refresh(record)
        return record
