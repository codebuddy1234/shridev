"""Application configuration.

Every value is read from the environment (or a local ``.env`` during
development). Nothing secret is hardcoded, and the application refuses to start
in production without an explicitly configured ``SECRET_KEY``.
"""

from __future__ import annotations

import logging
import secrets
from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

# 32 characters is the floor for an HS256 signing key; token_urlsafe(48)
# produces 64, which is what the documented generator command gives.
MIN_SECRET_KEY_LENGTH = 32


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ----------------------------------------------------
    APP_NAME: str = "ShriDev API"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = False
    API_PREFIX: str = "/api"

    # --- Database -------------------------------------------------------
    # Supplied by the hosting provider in production. The development default
    # points at a local PostgreSQL instance and is never used in production,
    # where the validator below requires an explicit value.
    DATABASE_URL: str = "postgresql+psycopg://shridev:shridev_dev_password@127.0.0.1:5432/shridev"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE_SECONDS: int = 1800
    SQL_ECHO: bool = False

    # --- Security -------------------------------------------------------
    # Left blank by default and resolved in _require_production_secrets below.
    #
    # A default_factory is deliberately NOT used here: `SECRET_KEY=` in a .env
    # file arrives as an empty string, which pydantic treats as a *set* value,
    # so the factory would never run. The key stayed empty and PyJWT failed at
    # token creation with "HMAC key must not be empty" — after the password had
    # already verified, which made a configuration fault look like an
    # authentication one.
    SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8
    # bcrypt work factor. 12 is a reasonable 2020s default; raise as hardware
    # improves. Tests override this to keep the suite fast.
    BCRYPT_ROUNDS: int = 12

    # --- CORS -----------------------------------------------------------
    # Comma-separated list of allowed origins, e.g.
    # "https://shridev.com,https://www.shridev.com"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- Rate limiting --------------------------------------------------
    RATE_LIMIT_ENABLED: bool = True
    ENQUIRY_RATE_LIMIT: int = 5
    ENQUIRY_RATE_WINDOW_SECONDS: int = 900
    LOGIN_RATE_LIMIT: int = 8
    LOGIN_RATE_WINDOW_SECONDS: int = 900

    # --- Bootstrap admin -------------------------------------------------
    # Used only by scripts/create_admin.py. Never read at request time.
    FIRST_ADMIN_EMAIL: str | None = None
    FIRST_ADMIN_PASSWORD: str | None = None
    FIRST_ADMIN_NAME: str = "ShriDev Admin"

    @field_validator("DATABASE_URL")
    @classmethod
    def _normalise_database_url(cls, value: str) -> str:
        """Accept the ``postgres://`` and ``postgresql://`` forms that hosting
        providers hand out, and route both through the psycopg 3 driver."""
        if value.startswith("postgres://"):
            value = value.replace("postgres://", "postgresql://", 1)
        if value.startswith("postgresql://"):
            value = value.replace("postgresql://", "postgresql+psycopg://", 1)
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @model_validator(mode="after")
    def _require_production_secrets(self) -> "Settings":
        """Resolve the signing key, and fail fast on an unsafe production setup."""
        # Blank, whitespace-only and unset are all treated as "no key given".
        # This is checked against the resolved value rather than os.environ,
        # because pydantic-settings loads .env into the model without exporting
        # it to the process environment — reading os.getenv here would reject a
        # perfectly good key that was set in backend/.env.
        if not self.SECRET_KEY.strip():
            if self.ENVIRONMENT == "production":
                raise ValueError(
                    "SECRET_KEY must be set to a non-empty value when "
                    "ENVIRONMENT=production. Generate one with:\n"
                    '  python -c "import secrets; print(secrets.token_urlsafe(48))"'
                )
            # Development convenience: generate an ephemeral key so the app
            # runs out of the box. It changes on every restart, so sessions do
            # not survive a reload — hence the warning rather than silence.
            object.__setattr__(self, "SECRET_KEY", secrets.token_urlsafe(48))
            logger.warning(
                "SECRET_KEY is empty; generated a temporary one for this process. "
                "Admin sessions will end whenever the server restarts. Set SECRET_KEY "
                "in backend/.env to keep them: "
                'python -c "import secrets; print(secrets.token_urlsafe(48))"'
            )

        if self.ENVIRONMENT == "production":
            if len(self.SECRET_KEY) < MIN_SECRET_KEY_LENGTH:
                raise ValueError(
                    f"SECRET_KEY is only {len(self.SECRET_KEY)} characters; at least "
                    f"{MIN_SECRET_KEY_LENGTH} are required in production."
                )
            if "localhost" in self.DATABASE_URL or "127.0.0.1" in self.DATABASE_URL:
                raise ValueError(
                    "DATABASE_URL still points at localhost while ENVIRONMENT=production."
                )
            if any(origin.startswith("http://localhost") for origin in self.cors_origin_list):
                raise ValueError(
                    "CORS_ORIGINS still contains a localhost origin while ENVIRONMENT=production."
                )
        return self


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance. Import this rather than constructing Settings."""
    return Settings()


settings = get_settings()
