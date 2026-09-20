"""Authentication schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    # Only a presence check here — the real strength requirement is enforced
    # when an account is created, not when an existing one signs in.
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Token lifetime in seconds.")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    is_superuser: bool
    created_at: datetime


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    # bcrypt truncates past 72 bytes, so the ceiling is enforced rather than
    # silently accepted. See app/security.py.
    new_password: str = Field(min_length=12, max_length=72)
