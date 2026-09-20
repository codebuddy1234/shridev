"""Admin authentication."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select

from app.config import settings
from app.deps import CurrentUser, DbSession
from app.models.user import User
from app.rate_limit import login_rate_limit
from app.schemas.auth import (
    LoginRequest,
    PasswordChangeRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.common import MessageResponse
from app.security import PasswordTooLongError, create_access_token, hash_password, verify_password

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    # Deliberately identical for an unknown email and a wrong password, so the
    # endpoint cannot be used to enumerate which accounts exist.
    detail="Incorrect email or password.",
    headers={"WWW-Authenticate": "Bearer"},
)


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    db: DbSession,
    request: Request,
    _: None = Depends(login_rate_limit),
) -> TokenResponse:
    """Exchange credentials for an access token."""
    user = db.execute(
        select(User).where(User.email == payload.email.lower())
    ).scalar_one_or_none()

    if user is None:
        # Hash anyway so the response time does not reveal whether the account
        # exists. bcrypt dominates the cost of this endpoint either way.
        verify_password(payload.password, "$2b$12$" + "." * 53)
        raise _INVALID_CREDENTIALS

    if not verify_password(payload.password, user.hashed_password):
        logger.warning("Failed login attempt for user id=%s", user.id)
        raise _INVALID_CREDENTIALS

    if not user.is_active:
        raise _INVALID_CREDENTIALS

    token = create_access_token(user.id, {"email": user.email})
    return TokenResponse(
        access_token=token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse)
def read_current_user(user: CurrentUser) -> User:
    """Return the signed-in account. Used to validate a stored session."""
    return user


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: PasswordChangeRequest,
    user: CurrentUser,
    db: DbSession,
) -> MessageResponse:
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if payload.new_password == payload.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new password must be different from the current one.",
        )

    try:
        user.hashed_password = hash_password(payload.new_password)
    except PasswordTooLongError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    db.commit()
    return MessageResponse(message="Password updated.")
