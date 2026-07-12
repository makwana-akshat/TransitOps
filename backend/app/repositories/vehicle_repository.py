from typing import Optional
from sqlalchemy import select, or_, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.vehicle import Vehicle
from app.utils.pagination import paginate

class VehicleRepository(BaseRepository[Vehicle]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(Vehicle, db_session)
        
    async def get_by_registration(self, registration_number: str) -> Optional[Vehicle]:
        query = select(Vehicle).where(Vehicle.registration_number == registration_number.upper())
        result = await self.db.execute(query)
        return result.scalars().first()
        
    async def get_paginated(
        self,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        status: Optional[str] = None,
        region: Optional[str] = None,
        vehicle_type: Optional[str] = None,
        year: Optional[int] = None,
        manufacturer: Optional[str] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc"
    ):
        query = select(Vehicle).where(Vehicle.deleted_at.is_(None))
        
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Vehicle.registration_number.ilike(search_pattern),
                    Vehicle.vehicle_name.ilike(search_pattern),
                    Vehicle.model.ilike(search_pattern),
                    Vehicle.manufacturer.ilike(search_pattern)
                )
            )
            
        if status:
            query = query.where(Vehicle.status == status)
        if region:
            query = query.where(Vehicle.region == region)
        if vehicle_type:
            query = query.where(Vehicle.vehicle_type == vehicle_type)
        if year is not None:
            query = query.where(Vehicle.year == year)
        if manufacturer:
            query = query.where(Vehicle.manufacturer == manufacturer)
            
        allowed_sort_fields = {
            "registration_number": Vehicle.registration_number,
            "vehicle_name": Vehicle.vehicle_name,
            "current_odometer": Vehicle.current_odometer,
            "capacity_kg": Vehicle.capacity_kg,
            "purchase_date": Vehicle.purchase_date,
            "created_at": Vehicle.created_at
        }
        
        sort_column = allowed_sort_fields.get(sort_by, Vehicle.created_at)
        
        if sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
            
        return await paginate(self.db, query, page, page_size)
