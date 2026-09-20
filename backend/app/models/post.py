"""Insights articles."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import ARRAY, Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, TimestampMixin


class BlogPost(Base, TimestampMixin):
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(220), nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    cover_url: Mapped[str | None] = mapped_column(String(500))
    author_name: Mapped[str | None] = mapped_column(String(160))
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String(60)), default=list, server_default="{}", nullable=False
    )

    # Seeded demo articles carry this flag and the UI labels them visibly, so
    # example content is never mistaken for something ShriDev published.
    is_placeholder: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
