from typing import Optional, List
from sqlalchemy import select, or_, asc, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.repositories.base import BaseRepository
from app.models.maintenance import MaintenanceRecord
from app.models.vehicle import Vehicle
from app.enums.fleet import MaintenanceStatus, VehicleStatus
from app.utils.pagination import paginate

class MaintenanceRepository(BaseRepository[MaintenanceRecord]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(MaintenanceRecord, db_session)

    async def get_by_id_with_vehicle(self, record_id) -> Optional[MaintenanceRecord]:
        query = (
            select(MaintenanceRecord)
            .options(selectinload(MaintenanceRecord.vehicle))
            .where(MaintenanceRecord.id == record_id)
            .where(MaintenanceRecord.deleted_at.is_(None))
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_active_for_vehicle(self, vehicle_id) -> List[MaintenanceRecord]:
        query = (
            select(MaintenanceRecord)
            .where(MaintenanceRecord.vehicle_id == vehicle_id)
            .where(MaintenanceRecord.status.in_([MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS]))
            .where(MaintenanceRecord.deleted_at.is_(None))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_active_maintenance(self) -> List[MaintenanceRecord]:
        query = (
            select(MaintenanceRecord)
            .options(selectinload(MaintenanceRecord.vehicle))
            .where(MaintenanceRecord.status.in_([MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS]))
            .where(MaintenanceRecord.deleted_at.is_(None))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_upcoming_maintenance(self) -> List[MaintenanceRecord]:
        now = datetime.now(timezone.utc)
        query = (
            select(MaintenanceRecord)
            .options(selectinload(MaintenanceRecord.vehicle))
            .where(MaintenanceRecord.status.in_([MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS]))
            .where(MaintenanceRecord.expected_completion != None)
            .where(MaintenanceRecord.expected_completion > now)
            .where(MaintenanceRecord.deleted_at.is_(None))
            .order_by(asc(MaintenanceRecord.expected_completion))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_history_by_vehicle(self, vehicle_id) -> List[MaintenanceRecord]:
        query = (
            select(MaintenanceRecord)
            .where(MaintenanceRecord.vehicle_id == vehicle_id)
            .where(MaintenanceRecord.status.in_([MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED]))
            .where(MaintenanceRecord.deleted_at.is_(None))
            .order_by(desc(MaintenanceRecord.completed_date))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_paginated(
        self,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        maintenance_type: Optional[str] = None,
        vehicle_id: Optional[str] = None,
        workshop_name: Optional[str] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc"
    ):
        query = (
            select(MaintenanceRecord)
            .join(MaintenanceRecord.vehicle)
            .options(selectinload(MaintenanceRecord.vehicle))
            .where(MaintenanceRecord.deleted_at.is_(None))
        )
        
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Vehicle.registration_number.ilike(search_pattern),
                    Vehicle.name.ilike(search_pattern),
                    MaintenanceRecord.workshop_name.ilike(search_pattern),
                    MaintenanceRecord.mechanic_name.ilike(search_pattern),
                    MaintenanceRecord.invoice_number.ilike(search_pattern),
                )
            )
            
        if status:
            query = query.where(MaintenanceRecord.status == status)
        if priority:
            query = query.where(MaintenanceRecord.priority == priority)
        if maintenance_type:
            query = query.where(MaintenanceRecord.maintenance_type == maintenance_type)
        if vehicle_id:
            query = query.where(MaintenanceRecord.vehicle_id == vehicle_id)
        if workshop_name:
            query = query.where(MaintenanceRecord.workshop_name.ilike(f"%{workshop_name}%"))
            
        allowed_sort_fields = {
            "start_date": MaintenanceRecord.start_date,
            "completed_date": MaintenanceRecord.completed_date,
            "estimated_cost": MaintenanceRecord.estimated_cost,
            "actual_cost": MaintenanceRecord.actual_cost,
            "priority": MaintenanceRecord.priority,
            "created_at": MaintenanceRecord.created_at
        }
        
        sort_column = allowed_sort_fields.get(sort_by, MaintenanceRecord.created_at)
        
        if sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
            
        return await paginate(self.db, query, page, page_size)
