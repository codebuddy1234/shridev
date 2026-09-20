"""Project (case study) schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.schemas.common import strip_or_none
from app.services.slugs import slugify


class ProjectImageBase(BaseModel):
    url: str = Field(max_length=500)
    caption: str | None = Field(default=None, max_length=300)
    sort_order: int = 0


class ProjectImageCreate(ProjectImageBase):
    pass


class ProjectImageResponse(ProjectImageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ProjectBase(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    summary: str = Field(min_length=10, max_length=1000)
    category: str = Field(min_length=2, max_length=120)

    thumbnail_url: str | None = Field(default=None, max_length=500)
    cover_url: str | None = Field(default=None, max_length=500)

    challenge: str | None = None
    solution: str | None = None
    architecture: str | None = None
    development_process: str | None = None
    outcome: str | None = None

    features: list[str] = Field(default_factory=list, max_length=30)
    technologies: list[str] = Field(default_factory=list, max_length=30)

    # Validated as URLs then stored as plain strings, so a malformed link can
    # never be published into an anchor on the public site.
    live_url: HttpUrl | None = None
    github_url: HttpUrl | None = None

    featured: bool = False
    published: bool = False
    sort_order: int = 0

    @field_validator("challenge", "solution", "architecture", "development_process", "outcome")
    @classmethod
    def _normalise_prose(cls, value: str | None) -> str | None:
        return strip_or_none(value)

    @field_validator("features", "technologies")
    @classmethod
    def _clean_list(cls, value: list[str]) -> list[str]:
        return [item.strip() for item in value if item and item.strip()]


class ProjectCreate(ProjectBase):
    # Derived from the title when omitted, so the admin form does not force
    # the author to invent one.
    slug: str | None = Field(default=None, max_length=160)
    images: list[ProjectImageCreate] = Field(default_factory=list, max_length=20)

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, value: str | None) -> str | None:
        cleaned = strip_or_none(value)
        return slugify(cleaned) if cleaned else None


class ProjectUpdate(BaseModel):
    """PATCH semantics — only the fields present are changed."""

    title: str | None = Field(default=None, min_length=2, max_length=200)
    slug: str | None = Field(default=None, max_length=160)
    summary: str | None = Field(default=None, min_length=10, max_length=1000)
    category: str | None = Field(default=None, min_length=2, max_length=120)
    thumbnail_url: str | None = Field(default=None, max_length=500)
    cover_url: str | None = Field(default=None, max_length=500)
    challenge: str | None = None
    solution: str | None = None
    architecture: str | None = None
    development_process: str | None = None
    outcome: str | None = None
    features: list[str] | None = Field(default=None, max_length=30)
    technologies: list[str] | None = Field(default=None, max_length=30)
    live_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    featured: bool | None = None
    published: bool | None = None
    sort_order: int | None = None
    images: list[ProjectImageCreate] | None = Field(default=None, max_length=20)

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, value: str | None) -> str | None:
        cleaned = strip_or_none(value)
        return slugify(cleaned) if cleaned else None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    summary: str
    category: str
    thumbnail_url: str | None
    cover_url: str | None
    challenge: str | None
    solution: str | None
    architecture: str | None
    development_process: str | None
    outcome: str | None
    features: list[str]
    technologies: list[str]
    live_url: str | None
    github_url: str | None
    featured: bool
    published: bool
    sort_order: int
    images: list[ProjectImageResponse]
    created_at: datetime
    updated_at: datetime
