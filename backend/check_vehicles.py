import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

DB_URL = settings.supabase_db_url

async def main():
    engine = create_async_engine(DB_URL)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT id, registration_number, deleted_at FROM vehicles;"))
        rows = result.fetchall()
        print(f"Total vehicles in DB: {len(rows)}")
        for r in rows:
            print(f" - {r.registration_number}, deleted_at: {r.deleted_at}")

asyncio.run(main())
