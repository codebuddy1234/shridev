"""URL slug generation."""

from __future__ import annotations

import re
import unicodedata

from sqlalchemy import select
from sqlalchemy.orm import Session

_NON_WORD = re.compile(r"[^\w\s-]", re.UNICODE)
_WHITESPACE = re.compile(r"[\s_-]+")


def slugify(value: str, max_length: int = 160) -> str:
    """Convert arbitrary text into a lowercase, hyphenated URL segment."""
    # Decompose accents to their base letters so "Café" becomes "cafe" rather
    # than losing the character entirely.
    normalised = unicodedata.normalize("NFKD", value)
    ascii_only = normalised.encode("ascii", "ignore").decode("ascii")
    cleaned = _NON_WORD.sub("", ascii_only).strip().lower()
    slug = _WHITESPACE.sub("-", cleaned).strip("-")
    return slug[:max_length].rstrip("-") or "item"


def unique_slug(
    db: Session,
    model: type,
    value: str,
    *,
    exclude_id: int | None = None,
    max_length: int = 160,
) -> str:
    """Return a slug unique within ``model``, appending -2, -3 … as needed.

    ``exclude_id`` lets a record keep its own slug when being updated.
    """
    base = slugify(value, max_length=max_length)
    candidate = base
    suffix = 2

    while True:
        stmt = select(model.id).where(model.slug == candidate)
        if exclude_id is not None:
            stmt = stmt.where(model.id != exclude_id)
        if db.execute(stmt).first() is None:
            return candidate

        # Trim the base so the numeric suffix never pushes past the column width.
        tail = f"-{suffix}"
        candidate = f"{base[: max_length - len(tail)]}{tail}"
        suffix += 1
