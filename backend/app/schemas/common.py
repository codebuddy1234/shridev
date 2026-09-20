"""Shared schema helpers."""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int = Field(description="Total rows matching the filter, ignoring pagination.")
    page: int
    page_size: int
    pages: int


class MessageResponse(BaseModel):
    message: str


def strip_or_none(value: str | None) -> str | None:
    """Normalise optional free-text input: trim, and treat blank as absent.

    Stops the database filling with empty strings that then have to be
    distinguished from NULL everywhere downstream.
    """
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None
