"""Password hashing and JWT issuing/verification.

bcrypt is used directly rather than through passlib: passlib is unmaintained
and emits version warnings against modern bcrypt releases.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt

from app.config import settings

# bcrypt operates on at most 72 bytes and silently truncates beyond that.
# Rejecting longer input is clearer than accepting a password whose tail is
# ignored, which would make two different passwords interchangeable.
BCRYPT_MAX_BYTES = 72


class PasswordTooLongError(ValueError):
    """Raised when a password exceeds bcrypt's 72-byte input limit."""


def hash_password(password: str) -> str:
    encoded = password.encode("utf-8")
    if len(encoded) > BCRYPT_MAX_BYTES:
        raise PasswordTooLongError(
            f"Password must be at most {BCRYPT_MAX_BYTES} bytes when UTF-8 encoded."
        )
    return bcrypt.hashpw(encoded, bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Constant-time comparison via bcrypt. Never raises on malformed input."""
    try:
        encoded = password.encode("utf-8")
        if len(encoded) > BCRYPT_MAX_BYTES:
            return False
        return bcrypt.checkpw(encoded, password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        # A corrupt or legacy hash must fail closed, not error the request.
        return False


def create_access_token(subject: str | int, extra_claims: dict[str, Any] | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Return the payload, or None when the token is invalid or expired."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError:
        return None

    # Reject any token minted for a different purpose.
    if payload.get("type") != "access":
        return None
    return payload
