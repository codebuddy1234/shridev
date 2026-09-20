"""Portfolio projects and their gallery images.

Projects are content, not code: adding a case study is an admin action, never
a deployment. That is why the narrative sections live in the database.
"""

from __future__ import annotations

from sqlalchemy import ARRAY, Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, TimestampMixin


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False, index=True)

    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    cover_url: Mapped[str | None] = mapped_column(String(500))

    # --- Case study narrative -------------------------------------------
    challenge: Mapped[str | None] = mapped_column(Text)
    solution: Mapped[str | None] = mapped_column(Text)
    architecture: Mapped[str | None] = mapped_column(Text)
    development_process: Mapped[str | None] = mapped_column(Text)
    # Nullable on purpose: a case study with no measured result omits the
    # section entirely rather than publishing an invented metric.
    outcome: Mapped[str | None] = mapped_column(Text)

    features: Mapped[list[str]] = mapped_column(
        ARRAY(String(300)), default=list, server_default="{}", nullable=False
    )
    technologies: Mapped[list[str]] = mapped_column(
        ARRAY(String(80)), default=list, server_default="{}", nullable=False
    )

    live_url: Mapped[str | None] = mapped_column(String(500))
    github_url: Mapped[str | None] = mapped_column(String(500))

    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    images: Mapped[list["ProjectImage"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProjectImage.sort_order",
        lazy="selectin",
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Project id={self.id} slug={self.slug!r}>"


class ProjectImage(Base, TimestampMixin):
    __tablename__ = "project_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str | None] = mapped_column(String(300))
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    project: Mapped[Project] = relationship(back_populates="images")
