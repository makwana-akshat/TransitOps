from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "TransitOps API"
    debug: bool = True
    
    # Database Configuration (e.g. postgresql+psycopg://...)
    supabase_db_url: str
    
    # Auth (Clerk) Config
    clerk_secret_key: str
    clerk_publishable_key: str
    clerk_jwt_audience: str
    clerk_jwt_issuer: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
