from typing import Optional, List
from sqlalchemy import select, or_, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.driver import Driver
from app.utils.pagination import paginate

class DriverRepository(BaseRepository[Driver]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(Driver, db_session)
        
    async def get_by_employee_code(self, employee_code: str) -> Optional[Driver]:
        query = select(Driver).where(Driver.employee_code == employee_code)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_by_license_number(self, license_number: str) -> Optional[Driver]:
        query = select(Driver).where(Driver.license_number == license_number)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[Driver]:
        query = select(Driver).where(Driver.email == email)
        result = await self.db.execute(query)
        return result.scalars().first()
        
    async def get_paginated(
        self,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        status: Optional[str] = None,
        license_category: Optional[str] = None,
        safety_score_min: Optional[float] = None,
        safety_score_max: Optional[float] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc"
    ):
        query = select(Driver).where(Driver.deleted_at.is_(None))
        
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Driver.employee_code.ilike(search_pattern),
                    Driver.full_name.ilike(search_pattern),
                    Driver.email.ilike(search_pattern),
                    Driver.license_number.ilike(search_pattern),
                    Driver.phone.ilike(search_pattern)
                )
            )
            
        if status:
            query = query.where(Driver.status == status)
        if license_category:
            query = query.where(Driver.license_category == license_category)
        if safety_score_min is not None:
            query = query.where(Driver.safety_score >= safety_score_min)
        if safety_score_max is not None:
            query = query.where(Driver.safety_score <= safety_score_max)
            
        allowed_sort_fields = {
            "full_name": Driver.full_name,
            "employee_code": Driver.employee_code,
            "joining_date": Driver.joining_date,
            "license_expiry": Driver.license_expiry,
            "safety_score": Driver.safety_score,
            "created_at": Driver.created_at
        }
        
        sort_column = allowed_sort_fields.get(sort_by, Driver.created_at)
        
        if sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
            
        return await paginate(self.db, query, page, page_size)

    async def get_all_active(self) -> List[Driver]:
        query = select(Driver).where(Driver.deleted_at.is_(None))
        result = await self.db.execute(query)
        return list(result.scalars().all())
