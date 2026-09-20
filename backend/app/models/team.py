"""Team members.

Names and photographs are supplied by ShriDev through the admin interface.
Nothing is seeded here, so the public team page shows an honest empty state
until real people are added.
"""

from __future__ import annotations

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, TimestampMixin


class TeamMember(Base, TimestampMixin):
    __tablename__ = "team_members"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    role: Mapped[str] = mapped_column(String(160), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text)
    # Null renders an initials avatar rather than a broken image.
    photo_url: Mapped[str | None] = mapped_column(String(500))
    github_url: Mapped[str | None] = mapped_column(String(500))
    linkedin_url: Mapped[str | None] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
