from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    PORT: int = 8000
    DATABASE_URL: str = "postgresql://postgres:postgres@db.supabase.co:5432/postgres"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
