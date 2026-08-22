from __future__ import annotations

from typing import ClassVar

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_bool_env(value: object, *, field_name: str) -> bool:
    """Parse common .env boolean strings (true/false, 1/0, yes/no)."""
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    normalized = str(value).strip().lower()
    if normalized in {"true", "1", "yes", "on"}:
        return True
    if normalized in {"false", "0", "no", "off", ""}:
        return False
    raise ValueError(
        f"{field_name} must be true or false (got {value!r}). "
        f"Check your .env — common typo: 'falsex' instead of 'false'."
    )


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    All configuration values are read from .env file or environment
    variables at startup. This follows the Twelve-Factor App methodology
    for configuration management.
    """

    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "Pure Luxe Holidays"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: str = "change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    TRUSTED_HOSTS: list[str] = ["localhost", "127.0.0.1", "testserver"]

    # Seed admin (development only — override in .env for local bootstrap)
    SEED_ADMIN_EMAIL: str = "admin@plh.com"
    SEED_ADMIN_PASSWORD: str = ""
    SEED_ADMIN_NAME: str = "Super Admin"
    # When true, delete seed/ objects from storage before re-seeding (testing).
    SEED_CLEAR_STORAGE: bool = True
    # When true (development only), wipe the entire storage bucket/folder before seed.
    SEED_CLEAR_ALL_STORAGE: bool = False
    # When true, bootstrap seed runs in the background on API startup.
    RUN_SEED: bool = True

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://user:password@localhost:5432/pure_luxe_holidays"
    )

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # File Uploads
    UPLOAD_DIR: str = "./uploads"
    STORAGE_BACKEND: str = "local"  # "local" or "r2"

    # Cloudflare R2 (S3-compatible). Required when STORAGE_BACKEND=r2.
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = ""
    R2_PUBLIC_BASE_URL: str = ""
    R2_ENDPOINT_URL: str = ""

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

    @field_validator("DEBUG", "RUN_SEED", "SEED_CLEAR_STORAGE", "SEED_CLEAR_ALL_STORAGE", mode="before")
    @classmethod
    def parse_bool_settings(cls, value: object, info) -> bool:
        return _parse_bool_env(value, field_name=str(info.field_name).upper())

    @property
    def is_development(self) -> bool:
        """Check if the application is running in development mode."""
        return self.APP_ENV.lower() == "development"

    @property
    def is_production(self) -> bool:
        """Check if the application is running in production mode."""
        return self.APP_ENV.lower() == "production"

    @property
    def is_testing(self) -> bool:
        """Check if the application is running in testing mode."""
        return self.APP_ENV.lower() == "testing"

    @property
    def database_url_sync(self) -> str:
        """Return a synchronous database URL for Alembic usage."""
        return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

    @property
    def uses_r2_storage(self) -> bool:
        """Return True when Cloudflare R2 is the active media backend."""
        return self.STORAGE_BACKEND.lower() == "r2"

    @property
    def r2_s3_endpoint(self) -> str:
        """Return the R2 S3 API endpoint."""
        if self.R2_ENDPOINT_URL:
            return self.R2_ENDPOINT_URL.rstrip("/")
        if not self.R2_ACCOUNT_ID:
            return ""
        return f"https://{self.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

    @field_validator("STORAGE_BACKEND")
    @classmethod
    def validate_storage_backend(cls, value: str) -> str:
        normalized = (value or "local").strip().lower()
        if normalized not in {"local", "r2"}:
            raise ValueError("STORAGE_BACKEND must be 'local' or 'r2'")
        return normalized

    @field_validator("R2_PUBLIC_BASE_URL")
    @classmethod
    def strip_r2_public_url(cls, value: str) -> str:
        return (value or "").rstrip("/")

    @model_validator(mode="after")
    def validate_r2_credentials(self) -> "Settings":
        if not self.uses_r2_storage:
            return self
        missing = [
            name
            for name in (
                "R2_ACCOUNT_ID",
                "R2_ACCESS_KEY_ID",
                "R2_SECRET_ACCESS_KEY",
                "R2_BUCKET_NAME",
                "R2_PUBLIC_BASE_URL",
            )
            if not getattr(self, name)
        ]
        if missing:
            raise ValueError(
                "STORAGE_BACKEND=r2 requires: " + ", ".join(missing)
            )
        return self

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, value: str, info) -> str:
        app_env = info.data.get("APP_ENV", "development")
        if str(app_env).lower() == "production" and value == "change-this-in-production":
            raise ValueError("SECRET_KEY must be set to a secure value in production")
        return value


settings: Settings = Settings()
"""Singleton instance of application settings."""