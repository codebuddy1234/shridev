"""Database engine, session factory and the declarative base."""

from __future__ import annotations

from collections.abc import Generator
from datetime import datetime

from sqlalchemy import DateTime, create_engine, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.SQL_ECHO,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    # Managed Postgres providers drop idle connections; recycling below their
    # timeout avoids "server closed the connection unexpectedly" on first use.
    pool_recycle=settings.DB_POOL_RECYCLE_SECONDS,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base shared by every model."""


class TimestampMixin:
    """created_at / updated_at maintained by the database, not the app."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


def get_db() -> Generator:
    """FastAPI dependency yielding a session that is always closed.

    The session is rolled back on an exception so a failed request can never
    leave a partial transaction open on a pooled connection.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
