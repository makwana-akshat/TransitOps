from typing import Optional, Dict, Any
from sqlalchemy import select, func, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import uuid

from app.repositories.base import BaseRepository
from app.models.expense import FuelLog, Expense
from app.models.vehicle import Vehicle
from app.utils.pagination import paginate

class FuelLogRepository(BaseRepository[FuelLog]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(FuelLog, db_session)

    async def get_paginated(
        self,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        vehicle_id: Optional[str] = None,
        fuel_type: Optional[str] = None,
        payment_method: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: Optional[str] = "filled_at",
        sort_order: Optional[str] = "desc"
    ):
        query = select(FuelLog).join(FuelLog.vehicle).where(FuelLog.deleted_at.is_(None))
        
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Vehicle.registration_number.ilike(search_pattern),
                    FuelLog.fuel_station.ilike(search_pattern),
                    FuelLog.invoice_number.ilike(search_pattern)
                )
            )
            
        if vehicle_id:
            query = query.where(FuelLog.vehicle_id == vehicle_id)
        if fuel_type:
            query = query.where(FuelLog.fuel_type == fuel_type)
        if payment_method:
            query = query.where(FuelLog.payment_method == payment_method)
        if start_date:
            query = query.where(FuelLog.filled_at >= start_date)
        if end_date:
            query = query.where(FuelLog.filled_at <= end_date)
            
        allowed_sort_fields = {
            "filled_at": FuelLog.filled_at,
            "total_cost": FuelLog.total_cost,
            "created_at": FuelLog.created_at
        }
        
        sort_column = allowed_sort_fields.get(sort_by, FuelLog.created_at)
        if sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
            
        return await paginate(self.db, query, page, page_size)

    async def get_summary(self) -> Dict[str, float]:
        query = select(
            func.sum(FuelLog.total_cost).label("total_fuel_cost"),
            func.avg(FuelLog.total_cost).label("average_fuel_cost"),
            func.avg(FuelLog.price_per_liter).label("average_fuel_price"),
            func.sum(FuelLog.liters).label("total_liters")
        ).where(FuelLog.deleted_at.is_(None))
        
        result = await self.db.execute(query)
        row = result.first()
        return {
            "total_fuel_cost": float(row.total_fuel_cost or 0.0),
            "average_fuel_cost": float(row.average_fuel_cost or 0.0),
            "average_fuel_price": float(row.average_fuel_price or 0.0),
            "total_liters": float(row.total_liters or 0.0)
        }

class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(Expense, db_session)

    async def get_paginated(
        self,
        page: int,
        page_size: int,
        search: Optional[str] = None,
        vehicle_id: Optional[str] = None,
        expense_type: Optional[str] = None,
        payment_method: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        sort_by: Optional[str] = "expense_date",
        sort_order: Optional[str] = "desc"
    ):
        query = select(Expense).join(Expense.vehicle).where(Expense.deleted_at.is_(None))
        
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Vehicle.registration_number.ilike(search_pattern),
                    Expense.vendor.ilike(search_pattern),
                    Expense.invoice_number.ilike(search_pattern)
                )
            )
            
        if vehicle_id:
            query = query.where(Expense.vehicle_id == vehicle_id)
        if expense_type:
            query = query.where(Expense.expense_type == expense_type)
        if payment_method:
            query = query.where(Expense.payment_method == payment_method)
        if start_date:
            query = query.where(Expense.expense_date >= start_date)
        if end_date:
            query = query.where(Expense.expense_date <= end_date)
            
        allowed_sort_fields = {
            "expense_date": Expense.expense_date,
            "amount": Expense.amount,
            "created_at": Expense.created_at
        }
        
        sort_column = allowed_sort_fields.get(sort_by, Expense.created_at)
        if sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
            
        return await paginate(self.db, query, page, page_size)

    async def get_summary(self) -> Dict[str, Any]:
        total_query = select(func.sum(Expense.amount)).where(Expense.deleted_at.is_(None))
        total_result = await self.db.execute(total_query)
        total_expenses = float(total_result.scalar() or 0.0)
        
        breakdown_query = select(
            Expense.expense_type, 
            func.sum(Expense.amount)
        ).where(Expense.deleted_at.is_(None)).group_by(Expense.expense_type)
        breakdown_result = await self.db.execute(breakdown_query)
        
        breakdown = {row[0].value if hasattr(row[0], 'value') else row[0]: float(row[1]) for row in breakdown_result.all()}
        
        fuel_query = select(func.sum(FuelLog.total_cost)).where(FuelLog.deleted_at.is_(None))
        fuel_result = await self.db.execute(fuel_query)
        total_fuel = float(fuel_result.scalar() or 0.0)
        
        return {
            "total_expenses": total_expenses,
            "expense_breakdown": breakdown,
            "total_operational_cost": total_expenses + total_fuel
        }
