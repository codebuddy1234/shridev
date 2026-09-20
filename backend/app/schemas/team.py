"""Team member schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.schemas.common import strip_or_none


class TeamMemberBase(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    role: str = Field(min_length=2, max_length=160)
    bio: str | None = Field(default=None, max_length=2000)
    photo_url: str | None = Field(default=None, max_length=500)
    github_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None
    sort_order: int = 0
    published: bool = True

    @field_validator("bio", "photo_url")
    @classmethod
    def _normalise(cls, value: str | None) -> str | None:
        return strip_or_none(value)


class TeamMemberCreate(TeamMemberBase):
    pass


class TeamMemberUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    role: str | None = Field(default=None, min_length=2, max_length=160)
    bio: str | None = Field(default=None, max_length=2000)
    photo_url: str | None = Field(default=None, max_length=500)
    github_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None
    sort_order: int | None = None
    published: bool | None = None


class TeamMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    role: str
    bio: str | None
    photo_url: str | None
    github_url: str | None
    linkedin_url: str | None
    sort_order: int
    published: bool
    created_at: datetime
    updated_at: datetime
