"""Pydantic-settings configuration loaded entirely from environment.

Di server, env disuplai lewat `--env-file /opt/geoscan/.env` saat `docker run`.
Tidak ada secret yang di-hardcode di sini.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── App ──
    APP_NAME: str = "Geoscan API"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False

    # ── Database ──
    DATABASE_URL: str = "postgresql+asyncpg://geoscan_user:CHANGE_ME@postgres:5432/geoscan"

    # ── Security / JWT ──
    SECRET_KEY: str = "CHANGE_ME_SECRET"
    INTERNAL_API_KEY: str = "CHANGE_ME_INTERNAL"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── Redis ──
    REDIS_URL: str = "redis://geoscan-redis:6379/0"

    # ── Celery ──
    CELERY_BROKER_URL: str = "redis://geoscan-redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://geoscan-redis:6379/1"
    CELERY_TASK_QUEUE: str = "geoscan"

    # ── n8n (satu-satunya outbound dependency dari backend) ──
    N8N_WEBHOOK_URL: str = "http://n8n:5678"

    # ── CORS ──
    ALLOWED_ORIGINS: str = "http://localhost:3000,https://apigeo.cosger.online"

    # ── AI engine (Phase 5) — Gemini + Pinecone ──
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL_ANALYSIS: str = "gemini-2.5-flash"
    GEMINI_MODEL_EMBEDDING: str = "gemini-embedding-001"
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "geoscan-historical"
    # Embedding dimension. gemini-embedding-001 supports MRL truncation; we use
    # 1536 to keep the Pinecone index dimension unchanged from the original spec.
    PINECONE_DIMENSION: int = 1536

    # ── Observability (Phase 7) ──
    SENTRY_DSN: str = ""

    # ── Business rules ──
    FREE_TIER_MAX_PORTFOLIO_ASSETS: int = 3

    @property
    def cors_origins(self) -> list[str]:
        """Parse ALLOWED_ORIGINS (comma-separated) menjadi list."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @field_validator("DATABASE_URL")
    @classmethod
    def _ensure_async_driver(cls, v: str) -> str:
        # Pastikan driver async dipakai oleh SQLAlchemy engine.
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @property
    def sync_database_url(self) -> str:
        """URL sinkron untuk Alembic (psycopg/asyncpg-less migration runner)."""
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
