import uuid
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.repositories.expense_repository import FuelLogRepository, ExpenseRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.repositories.trip_repository import TripRepository
from app.schemas.expense import FuelLogCreate, FuelLogUpdate, ExpenseCreate, ExpenseUpdate
from app.models.user import User
from app.enums.fleet import ExpenseType

class ExpenseService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.fuel_repo = FuelLogRepository(db)
        self.expense_repo = ExpenseRepository(db)
        self.vehicle_repo = VehicleRepository(db)
        self.trip_repo = TripRepository(db)

    async def _adjust_vehicle_fuel(self, vehicle_id: uuid.UUID, amount_diff: float):
        if amount_diff == 0:
            return
        vehicle = await self.vehicle_repo.get_by_id(vehicle_id)
        if not vehicle:
            return
        vehicle.total_fuel_cost += amount_diff
        vehicle.total_operational_cost += amount_diff
        self.db.add(vehicle)

    async def _adjust_trip_fuel(self, trip_id: Optional[uuid.UUID], amount_diff: float):
        if not trip_id or amount_diff == 0:
            return
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            return
        trip.trip_fuel_cost += amount_diff
        trip.trip_operational_cost += amount_diff
        self.db.add(trip)

    async def _adjust_vehicle_expense(self, vehicle_id: uuid.UUID, exp_type: ExpenseType, amount_diff: float):
        if amount_diff == 0:
            return
        vehicle = await self.vehicle_repo.get_by_id(vehicle_id)
        if not vehicle:
            return
        
        if exp_type in [ExpenseType.MAINTENANCE, ExpenseType.REPAIR]:
            vehicle.total_maintenance_cost += amount_diff
        else:
            vehicle.total_other_expenses += amount_diff
            
        vehicle.total_operational_cost += amount_diff
        self.db.add(vehicle)

    async def _adjust_trip_expense(self, trip_id: Optional[uuid.UUID], amount_diff: float):
        if not trip_id or amount_diff == 0:
            return
        trip = await self.trip_repo.get_by_id(trip_id)
        if not trip:
            return
        trip.trip_expenses += amount_diff
        trip.trip_operational_cost += amount_diff
        self.db.add(trip)

    # FUEL LOGS
    
    async def get_fuel_logs(self, page: int, page_size: int, search: Optional[str] = None, **filters):
        return await self.fuel_repo.get_paginated(page, page_size, search, **filters)
        
    async def get_fuel_summary(self):
        return await self.fuel_repo.get_summary()

    async def get_fuel_log_by_id(self, log_id: uuid.UUID):
        record = await self.fuel_repo.get_by_id(log_id)
        if not record:
            raise HTTPException(status_code=404, detail="Fuel Log not found")
        return record

    async def create_fuel_log(self, record_in: FuelLogCreate, current_user: User):
        vehicle = await self.vehicle_repo.get_by_id(record_in.vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
            
        if record_in.trip_id:
            trip = await self.trip_repo.get_by_id(record_in.trip_id)
            if not trip:
                raise HTTPException(status_code=404, detail="Trip not found")

        if record_in.odometer is not None and vehicle.current_odometer > record_in.odometer:
            raise HTTPException(status_code=400, detail="Odometer reading cannot decrease from current vehicle odometer")

        async with self.db.begin_nested():
            record_data = record_in.model_dump(exclude_unset=True)
            record_data["created_by"] = current_user.id
            record = await self.fuel_repo.create(record_data, commit=False)
            
            await self._adjust_vehicle_fuel(vehicle.id, record.total_cost)
            await self._adjust_trip_fuel(record.trip_id, record.total_cost)
            
            if record_in.odometer is not None and record_in.odometer > vehicle.current_odometer:
                vehicle.current_odometer = record_in.odometer
                self.db.add(vehicle)
                
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def update_fuel_log(self, log_id: uuid.UUID, record_in: FuelLogUpdate, current_user: User):
        record = await self.get_fuel_log_by_id(log_id)
        
        async with self.db.begin_nested():
            old_cost = record.total_cost
            old_trip_id = record.trip_id
            
            update_data = record_in.model_dump(exclude_unset=True)
            update_data["updated_by"] = current_user.id
            update_data["updated_at"] = datetime.now(timezone.utc)
            
            if 'liters' in update_data or 'price_per_liter' in update_data:
                liters = update_data.get('liters', record.liters)
                price = update_data.get('price_per_liter', record.price_per_liter)
                new_cost = round(liters * price, 2)
                update_data['total_cost'] = new_cost
                
            updated_record = await self.fuel_repo.update(record, update_data, commit=False)
            
            cost_diff = updated_record.total_cost - old_cost
            
            if record_in.trip_id is not None and record_in.trip_id != old_trip_id:
                await self._adjust_trip_fuel(old_trip_id, -old_cost)
                await self._adjust_trip_fuel(updated_record.trip_id, updated_record.total_cost)
            else:
                await self._adjust_trip_fuel(updated_record.trip_id, cost_diff)
                
            await self._adjust_vehicle_fuel(updated_record.vehicle_id, cost_diff)
            
        await self.db.commit()
        await self.db.refresh(updated_record)
        return updated_record

    async def delete_fuel_log(self, log_id: uuid.UUID, current_user: User):
        record = await self.get_fuel_log_by_id(log_id)
        
        async with self.db.begin_nested():
            await self._adjust_vehicle_fuel(record.vehicle_id, -record.total_cost)
            await self._adjust_trip_fuel(record.trip_id, -record.total_cost)
            
            record.deleted_at = datetime.now(timezone.utc)
            record.updated_by = current_user.id
            self.db.add(record)
            
        await self.db.commit()

    # EXPENSES
    
    async def get_expenses(self, page: int, page_size: int, search: Optional[str] = None, **filters):
        return await self.expense_repo.get_paginated(page, page_size, search, **filters)
        
    async def get_expense_summary(self):
        return await self.expense_repo.get_summary()

    async def get_expense_by_id(self, expense_id: uuid.UUID):
        record = await self.expense_repo.get_by_id(expense_id)
        if not record:
            raise HTTPException(status_code=404, detail="Expense not found")
        return record

    async def create_expense(self, record_in: ExpenseCreate, current_user: User):
        vehicle = await self.vehicle_repo.get_by_id(record_in.vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
            
        if record_in.trip_id:
            trip = await self.trip_repo.get_by_id(record_in.trip_id)
            if not trip:
                raise HTTPException(status_code=404, detail="Trip not found")

        async with self.db.begin_nested():
            record_data = record_in.model_dump(exclude_unset=True)
            record_data["created_by"] = current_user.id
            record = await self.expense_repo.create(record_data, commit=False)
            
            await self._adjust_vehicle_expense(vehicle.id, record.expense_type, record.amount)
            await self._adjust_trip_expense(record.trip_id, record.amount)
                
        await self.db.commit()
        await self.db.refresh(record)
        return record

    async def update_expense(self, expense_id: uuid.UUID, record_in: ExpenseUpdate, current_user: User):
        record = await self.get_expense_by_id(expense_id)
        
        async with self.db.begin_nested():
            old_amount = record.amount
            old_type = record.expense_type
            old_trip_id = record.trip_id
            
            update_data = record_in.model_dump(exclude_unset=True)
            update_data["updated_by"] = current_user.id
            update_data["updated_at"] = datetime.now(timezone.utc)
            
            updated_record = await self.expense_repo.update(record, update_data, commit=False)
            
            if 'expense_type' in update_data and old_type != updated_record.expense_type:
                await self._adjust_vehicle_expense(updated_record.vehicle_id, old_type, -old_amount)
                await self._adjust_vehicle_expense(updated_record.vehicle_id, updated_record.expense_type, updated_record.amount)
            else:
                amount_diff = updated_record.amount - old_amount
                await self._adjust_vehicle_expense(updated_record.vehicle_id, updated_record.expense_type, amount_diff)
            
            if record_in.trip_id is not None and record_in.trip_id != old_trip_id:
                await self._adjust_trip_expense(old_trip_id, -old_amount)
                await self._adjust_trip_expense(updated_record.trip_id, updated_record.amount)
            else:
                amount_diff = updated_record.amount - old_amount
                await self._adjust_trip_expense(updated_record.trip_id, amount_diff)
            
        await self.db.commit()
        await self.db.refresh(updated_record)
        return updated_record

    async def delete_expense(self, expense_id: uuid.UUID, current_user: User):
        record = await self.get_expense_by_id(expense_id)
        
        async with self.db.begin_nested():
            await self._adjust_vehicle_expense(record.vehicle_id, record.expense_type, -record.amount)
            await self._adjust_trip_expense(record.trip_id, -record.amount)
            
            record.deleted_at = datetime.now(timezone.utc)
            record.updated_by = current_user.id
            self.db.add(record)
            
        await self.db.commit()
