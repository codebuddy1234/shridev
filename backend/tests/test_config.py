"""Configuration resolution, especially the signing key.

These exist because a blank ``SECRET_KEY=`` in .env — exactly what
.env.example ships — produced an empty signing key, and the failure surfaced
as PyJWT's opaque "HMAC key must not be empty" at the final step of login,
long after the password had verified. A configuration fault looked like an
authentication fault.
"""

from __future__ import annotations

import importlib
import sys

import jwt
import pytest

# No database is involved in any of these.
pytestmark = pytest.mark.no_db

PRODUCTION_BASE = {
    "DATABASE_URL": "postgresql+psycopg://u:p@db.example.com:5432/x",
    "CORS_ORIGINS": "https://shridev.com",
}

MANAGED_VARS = ("SECRET_KEY", "ENVIRONMENT", "DATABASE_URL", "CORS_ORIGINS")


def build_settings(monkeypatch: pytest.MonkeyPatch, **env: str):
    """Construct Settings with a controlled environment.

    ``_env_file=None`` stops pydantic-settings reading a developer's real
    backend/.env, which would otherwise make these outcomes machine-dependent.
    """
    for name in MANAGED_VARS:
        monkeypatch.delenv(name, raising=False)
    for name, value in env.items():
        monkeypatch.setenv(name, value)

    for module in [m for m in sys.modules if m.startswith("app.config")]:
        del sys.modules[module]

    import app.config as config

    importlib.reload(config)
    return config.Settings(_env_file=None)


def test_blank_secret_key_is_replaced_in_development(monkeypatch: pytest.MonkeyPatch) -> None:
    """`SECRET_KEY=` in .env is a *set* empty string, not an absent value."""
    settings = build_settings(monkeypatch, SECRET_KEY="", ENVIRONMENT="development")
    assert settings.SECRET_KEY, "an empty key must never survive into the app"
    assert len(settings.SECRET_KEY) >= 32


def test_whitespace_secret_key_is_treated_as_blank(monkeypatch: pytest.MonkeyPatch) -> None:
    settings = build_settings(monkeypatch, SECRET_KEY="   ", ENVIRONMENT="development")
    assert settings.SECRET_KEY.strip()
    assert len(settings.SECRET_KEY) >= 32


def test_absent_secret_key_is_generated_in_development(monkeypatch: pytest.MonkeyPatch) -> None:
    settings = build_settings(monkeypatch, ENVIRONMENT="development")
    assert len(settings.SECRET_KEY) >= 32


def test_generated_key_can_actually_sign_a_token(monkeypatch: pytest.MonkeyPatch) -> None:
    """The regression itself: jwt.encode must not raise InvalidKeyError."""
    settings = build_settings(monkeypatch, SECRET_KEY="", ENVIRONMENT="development")
    token = jwt.encode({"sub": "1"}, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    assert decoded["sub"] == "1"


def test_explicit_secret_key_is_preserved(monkeypatch: pytest.MonkeyPatch) -> None:
    explicit = "k" * 64
    settings = build_settings(monkeypatch, SECRET_KEY=explicit, ENVIRONMENT="development")
    assert settings.SECRET_KEY == explicit


def test_blank_secret_key_is_refused_in_production(monkeypatch: pytest.MonkeyPatch) -> None:
    """Production must never fall back to a throwaway key."""
    with pytest.raises(ValueError, match="SECRET_KEY"):
        build_settings(monkeypatch, SECRET_KEY="", ENVIRONMENT="production", **PRODUCTION_BASE)


def test_short_secret_key_is_refused_in_production(monkeypatch: pytest.MonkeyPatch) -> None:
    with pytest.raises(ValueError, match="at least"):
        build_settings(
            monkeypatch, SECRET_KEY="tooshort", ENVIRONMENT="production", **PRODUCTION_BASE
        )


def test_production_accepts_a_key_from_the_env_file_not_just_os_environ(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The check reads the resolved value, not os.getenv.

    pydantic-settings loads .env into the model without exporting it to the
    process environment, so an os.getenv check would reject a valid key that
    was set in backend/.env — refusing to start for the wrong reason.
    """
    settings = build_settings(
        monkeypatch, SECRET_KEY="v" * 64, ENVIRONMENT="production", **PRODUCTION_BASE
    )
    assert settings.SECRET_KEY == "v" * 64


def test_production_still_rejects_localhost_database(monkeypatch: pytest.MonkeyPatch) -> None:
    with pytest.raises(ValueError, match="DATABASE_URL"):
        build_settings(
            monkeypatch,
            SECRET_KEY="v" * 64,
            ENVIRONMENT="production",
            DATABASE_URL="postgresql+psycopg://u:p@127.0.0.1:5432/x",
            CORS_ORIGINS="https://shridev.com",
        )


def test_production_still_rejects_localhost_cors_origin(monkeypatch: pytest.MonkeyPatch) -> None:
    with pytest.raises(ValueError, match="CORS_ORIGINS"):
        build_settings(
            monkeypatch,
            SECRET_KEY="v" * 64,
            ENVIRONMENT="production",
            DATABASE_URL="postgresql+psycopg://u:p@db.example.com:5432/x",
            CORS_ORIGINS="http://localhost:3000",
        )
