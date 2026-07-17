import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

DB_URL = settings.supabase_db_url

async def main():
    engine = create_async_engine(DB_URL)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE trips ADD COLUMN deleted_at TIMESTAMPTZ NULL;"))
            print("Column added!")
        except Exception as e:
            print("Error or column already exists:", e)

asyncio.run(main())
