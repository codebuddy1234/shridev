"""Portfolio projects.

Reads are public and return only published rows. Listing unpublished rows and
every write require an authenticated admin.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, Response, status
from sqlalchemy import select

from app.deps import CurrentUser, DbSession, OptionalUser
from app.models.project import Project, ProjectImage
from app.schemas.project import (
    ProjectCreate,
    ProjectImageCreate,
    ProjectResponse,
    ProjectUpdate,
)
from app.services.slugs import unique_slug

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["projects"])


def _replace_images(db: DbSession, project: Project, images: list[ProjectImageCreate]) -> None:
    """Replace a project's gallery wholesale.

    The admin form submits the full ordered list, so reconciling row by row
    would add complexity without changing the result.
    """
    project.images.clear()
    db.flush()
    for index, image in enumerate(images):
        project.images.append(
            ProjectImage(
                url=image.url,
                caption=image.caption,
                sort_order=image.sort_order or index,
            )
        )


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    db: DbSession,
    user: OptionalUser,
    featured: bool | None = Query(None),
    category: str | None = Query(None, max_length=120),
    limit: int | None = Query(None, ge=1, le=100),
    include_unpublished: bool = Query(
        False, description="Admin only — ignored without a valid access token."
    ),
) -> list[Project]:
    stmt = select(Project)

    # Unpublished work is only ever visible to an authenticated admin. An
    # anonymous caller passing the flag simply gets the public list.
    if not (include_unpublished and user is not None):
        stmt = stmt.where(Project.published.is_(True))

    if featured is not None:
        stmt = stmt.where(Project.featured.is_(featured))
    if category:
        stmt = stmt.where(Project.category == category)

    stmt = stmt.order_by(Project.sort_order.asc(), Project.created_at.desc())
    if limit:
        stmt = stmt.limit(limit)

    return list(db.execute(stmt).scalars().all())


@router.get("/{slug}", response_model=ProjectResponse)
def get_project(slug: str, db: DbSession, user: OptionalUser) -> Project:
    project = db.execute(select(Project).where(Project.slug == slug)).scalar_one_or_none()

    # An unpublished project is a 404 for the public, not a 403 — its existence
    # is not disclosed before it is ready.
    if project is None or (not project.published and user is None):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    return project


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: DbSession, user: CurrentUser) -> Project:
    data = payload.model_dump(exclude={"slug", "images"})
    # Pydantic validated these as URLs; the column stores plain text.
    data["live_url"] = str(payload.live_url) if payload.live_url else None
    data["github_url"] = str(payload.github_url) if payload.github_url else None

    project = Project(
        slug=unique_slug(db, Project, payload.slug or payload.title),
        **data,
    )
    db.add(project)
    db.flush()

    if payload.images:
        _replace_images(db, project, payload.images)

    db.commit()
    db.refresh(project)
    logger.info("Project %s created by user %s", project.id, user.id)
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: DbSession,
    user: CurrentUser,
) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    changes = payload.model_dump(exclude_unset=True, exclude={"images", "slug"})
    for field in ("live_url", "github_url"):
        if field in changes and changes[field] is not None:
            changes[field] = str(changes[field])

    for field, value in changes.items():
        setattr(project, field, value)

    if "slug" in payload.model_fields_set and payload.slug:
        project.slug = unique_slug(db, Project, payload.slug, exclude_id=project.id)

    if payload.images is not None:
        _replace_images(db, project, payload.images)

    db.commit()
    db.refresh(project)
    logger.info("Project %s updated by user %s", project_id, user.id)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: DbSession, user: CurrentUser) -> Response:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")

    db.delete(project)  # Gallery rows cascade.
    db.commit()
    logger.warning("Project %s deleted by user %s", project_id, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
