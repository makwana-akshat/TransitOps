from typing import Generic, TypeVar, Type, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from datetime import datetime, timezone

T = TypeVar("T")

class BaseRepository(Generic[T]):
    def __init__(self, model_class: Type[T], db_session: AsyncSession):
        self.model = model_class
        self.db = db_session

    async def get_by_id(self, id: uuid.UUID) -> Optional[T]:
        query = select(self.model).where(self.model.id == id)
        if hasattr(self.model, "deleted_at"):
            query = query.where(self.model.deleted_at.is_(None))
        result = await self.db.execute(query)
        return result.scalars().first()

    async def create(self, obj_in: dict, commit: bool = True) -> T:
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        if commit:
            await self.db.commit()
            await self.db.refresh(db_obj)
        else:
            await self.db.flush()
        return db_obj

    async def update(self, db_obj: T, obj_in: dict, commit: bool = True) -> T:
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        if commit:
            await self.db.commit()
            await self.db.refresh(db_obj)
        else:
            await self.db.flush()
        return db_obj

    async def soft_delete(self, db_obj: T) -> None:
        if hasattr(db_obj, "deleted_at"):
            setattr(db_obj, "deleted_at", datetime.utcnow())
        await self.db.commit()
