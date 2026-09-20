"""Shared FastAPI dependencies."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.security import decode_access_token

# auto_error=False so a missing header produces our own 401 with a consistent
# body, rather than FastAPI's default 403.
bearer_scheme = HTTPBearer(auto_error=False, description="Admin access token")

DbSession = Annotated[Session, Depends(get_db)]

_UNAUTHORISED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
) -> User:
    """Resolve the authenticated admin user, or raise 401.

    The account is re-read from the database on every request rather than
    trusted from the token body, so deactivating a user takes effect
    immediately instead of when their token happens to expire.
    """
    if credentials is None or not credentials.credentials:
        raise _UNAUTHORISED

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise _UNAUTHORISED

    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        raise _UNAUTHORISED from None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise _UNAUTHORISED

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_superuser(user: CurrentUser) -> User:
    """Restrict an endpoint to superusers (user administration)."""
    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires a superuser account.",
        )
    return user


CurrentSuperuser = Annotated[User, Depends(get_current_superuser)]


def get_optional_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)] = None,
) -> User | None:
    """Resolve the user when a valid token is present, otherwise return None.

    Used by endpoints that are public but expose more to an admin — listing
    unpublished content, for example. An invalid token is treated as absent
    rather than as an error, so a stale session still sees the public view.
    """
    if credentials is None or not credentials.credentials:
        return None

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None

    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        return None

    user = db.get(User, user_id)
    return user if user is not None and user.is_active else None


OptionalUser = Annotated[User | None, Depends(get_optional_user)]
