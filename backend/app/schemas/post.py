"""Insights article schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import strip_or_none
from app.services.slugs import slugify

ALLOWED_CATEGORIES = [
    "AI",
    "Web Development",
    "Software Engineering",
    "Data",
    "Business Technology",
    "Tutorials",
    "Company News",
]


class BlogPostBase(BaseModel):
    title: str = Field(min_length=3, max_length=220)
    excerpt: str = Field(min_length=10, max_length=600)
    content: str = Field(min_length=20)
    category: str = Field(min_length=2, max_length=80)
    cover_url: str | None = Field(default=None, max_length=500)
    author_name: str | None = Field(default=None, max_length=160)
    tags: list[str] = Field(default_factory=list, max_length=12)
    # Marks seeded example content, which the UI labels visibly so it is never
    # mistaken for an article ShriDev actually published.
    is_placeholder: bool = False
    featured: bool = False
    published: bool = False
    published_at: datetime | None = None

    @field_validator("cover_url", "author_name")
    @classmethod
    def _normalise(cls, value: str | None) -> str | None:
        return strip_or_none(value)

    @field_validator("tags")
    @classmethod
    def _clean_tags(cls, value: list[str]) -> list[str]:
        return [tag.strip() for tag in value if tag and tag.strip()]


class BlogPostCreate(BlogPostBase):
    slug: str | None = Field(default=None, max_length=180)

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, value: str | None) -> str | None:
        cleaned = strip_or_none(value)
        return slugify(cleaned) if cleaned else None


class BlogPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=220)
    slug: str | None = Field(default=None, max_length=180)
    excerpt: str | None = Field(default=None, min_length=10, max_length=600)
    content: str | None = Field(default=None, min_length=20)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    cover_url: str | None = Field(default=None, max_length=500)
    author_name: str | None = Field(default=None, max_length=160)
    tags: list[str] | None = Field(default=None, max_length=12)
    is_placeholder: bool | None = None
    featured: bool | None = None
    published: bool | None = None
    published_at: datetime | None = None

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, value: str | None) -> str | None:
        cleaned = strip_or_none(value)
        return slugify(cleaned) if cleaned else None


class BlogPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    excerpt: str
    content: str
    category: str
    cover_url: str | None
    author_name: str | None
    tags: list[str]
    is_placeholder: bool
    featured: bool
    published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime


class AdminStatsResponse(BaseModel):
    total_enquiries: int
    new_enquiries: int
    active_projects: int
    completed_projects: int
    published_projects: int
    team_members: int
    published_posts: int
    status_breakdown: dict[str, int]
