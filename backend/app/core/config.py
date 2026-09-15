from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = "http://localhost:3000"

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    DATABASE_URL: str = ""

    STORAGE_BUCKET: str = "legal-documents"
    MAX_FILE_SIZE_MB: int = 50

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
