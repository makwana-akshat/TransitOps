from typing import Optional, List
from sqlalchemy import select, or_, asc, desc, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.trip import Trip
from app.enums.fleet import TripStatus
from app.utils.pagination import paginate

class TripRepository(BaseRepository[Trip]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(Trip, db_session)
        
    async def generate_trip_number(self) -> str:
        query = select(func.count()).select_from(Trip)
        result = await self.db.execute(query)
        count = result.scalar() or 0
        return f"TRIP-{(count + 1):06d}"

    async def get_by_id_with_relations(self, trip_id) -> Optional[Trip]:
        query = (
            select(Trip)
            .options(selectinload(Trip.vehicle), selectinload(Trip.driver))
            .where(Trip.id == trip_id)
            .where(Trip.deleted_at.is_(None))
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_active_trips(self) -> List[Trip]:
        query = (
            select(Trip)
            .options(selectinload(Trip.vehicle), selectinload(Trip.driver))
            .where(Trip.status == TripStatus.DISPATCHED)
            .where(Trip.deleted_at.is_(None))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
        
    async def get_paginated(
        self,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        status: Optional[str] = None,
        vehicle_id: Optional[str] = None,
        driver_id: Optional[str] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc"
    ):
        query = select(Trip).options(selectinload(Trip.vehicle), selectinload(Trip.driver)).where(Trip.deleted_at.is_(None))
        
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Trip.trip_number.ilike(search_pattern),
                    Trip.source.ilike(search_pattern),
                    Trip.destination.ilike(search_pattern),
                    Trip.cargo_description.ilike(search_pattern)
                )
            )
            
        if status:
            query = query.where(Trip.status == status)
        if vehicle_id:
            query = query.where(Trip.vehicle_id == vehicle_id)
        if driver_id:
            query = query.where(Trip.driver_id == driver_id)
            
        allowed_sort_fields = {
            "trip_number": Trip.trip_number,
            "planned_start": Trip.planned_start,
            "actual_start": Trip.actual_start,
            "status": Trip.status,
            "created_at": Trip.created_at
        }
        
        sort_column = allowed_sort_fields.get(sort_by, Trip.created_at)
        
        if sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
            
        return await paginate(self.db, query, page, page_size)
