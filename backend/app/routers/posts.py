"""Insights articles."""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, Response, status
from sqlalchemy import select

from app.deps import CurrentUser, DbSession, OptionalUser
from app.models.post import BlogPost
from app.schemas.post import BlogPostCreate, BlogPostResponse, BlogPostUpdate
from app.services.slugs import unique_slug

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("", response_model=list[BlogPostResponse])
def list_posts(
    db: DbSession,
    user: OptionalUser,
    category: str | None = Query(None, max_length=80),
    featured: bool | None = Query(None),
    limit: int | None = Query(None, ge=1, le=100),
    include_unpublished: bool = Query(False, description="Admin only."),
) -> list[BlogPost]:
    stmt = select(BlogPost)
    if not (include_unpublished and user is not None):
        stmt = stmt.where(BlogPost.published.is_(True))
    if category:
        stmt = stmt.where(BlogPost.category == category)
    if featured is not None:
        stmt = stmt.where(BlogPost.featured.is_(featured))

    # Newest first, falling back to creation time for drafts with no publish date.
    stmt = stmt.order_by(
        BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc()
    )
    if limit:
        stmt = stmt.limit(limit)

    return list(db.execute(stmt).scalars().all())


@router.get("/{slug}", response_model=BlogPostResponse)
def get_post(slug: str, db: DbSession, user: OptionalUser) -> BlogPost:
    post = db.execute(select(BlogPost).where(BlogPost.slug == slug)).scalar_one_or_none()
    if post is None or (not post.published and user is None):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    return post


@router.post("", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(payload: BlogPostCreate, db: DbSession, user: CurrentUser) -> BlogPost:
    data = payload.model_dump(exclude={"slug"})

    # Publishing without an explicit date stamps it now, so ordering is never
    # left undefined for a live article.
    if data.get("published") and not data.get("published_at"):
        data["published_at"] = datetime.now(timezone.utc)

    post = BlogPost(slug=unique_slug(db, BlogPost, payload.slug or payload.title, max_length=180), **data)
    db.add(post)
    db.commit()
    db.refresh(post)
    logger.info("Post %s created by user %s", post.id, user.id)
    return post


@router.patch("/{post_id}", response_model=BlogPostResponse)
def update_post(
    post_id: int,
    payload: BlogPostUpdate,
    db: DbSession,
    user: CurrentUser,
) -> BlogPost:
    post = db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")

    changes = payload.model_dump(exclude_unset=True, exclude={"slug"})
    for field, value in changes.items():
        setattr(post, field, value)

    if "slug" in payload.model_fields_set and payload.slug:
        post.slug = unique_slug(db, BlogPost, payload.slug, exclude_id=post.id, max_length=180)

    if post.published and post.published_at is None:
        post.published_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: DbSession, user: CurrentUser) -> Response:
    post = db.get(BlogPost, post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    db.delete(post)
    db.commit()
    logger.warning("Post %s deleted by user %s", post_id, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
