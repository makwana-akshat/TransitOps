
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.supabase_db_url)
    async with async_sessionmaker(engine)() as session:
        result = await session.execute(text('SELECT id, registration_number, deleted_at FROM vehicles;'))
        for r in result.fetchall():
            print(dict(r._mapping))

asyncio.run(main())

