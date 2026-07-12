from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "TransitOps API"
    debug: bool = True
    
    # Database Configuration (e.g. postgresql+psycopg://...)
    supabase_db_url: str
    
    # Auth (Clerk) Config - for future use
    clerk_secret_key: str | None = None
    clerk_publishable_key: str | None = None
    jwt_audience: str | None = None
    jwt_issuer: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
