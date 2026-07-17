
import asyncio
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, text
from app.models.vehicle import Vehicle
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.supabase_db_url, echo=True)
    async with async_sessionmaker(engine)() as session:
        result = await session.execute(select(Vehicle).limit(1))
        vehicle = result.scalars().first()
        if vehicle:
            print(f'Deleting {vehicle.registration_number}')
            setattr(vehicle, 'deleted_at', datetime.utcnow())
            await session.commit()
            print('Committed!')
        else:
            print('No vehicles found')

asyncio.run(main())

