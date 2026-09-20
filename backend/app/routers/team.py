"""Team members."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, Response, status
from sqlalchemy import select

from app.deps import CurrentUser, DbSession, OptionalUser
from app.models.team import TeamMember
from app.schemas.team import TeamMemberCreate, TeamMemberResponse, TeamMemberUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/team", tags=["team"])


def _url_fields(payload) -> dict:
    """HttpUrl validation on the way in, plain strings in the column."""
    return {
        "github_url": str(payload.github_url) if payload.github_url else None,
        "linkedin_url": str(payload.linkedin_url) if payload.linkedin_url else None,
    }


@router.get("", response_model=list[TeamMemberResponse])
def list_team(
    db: DbSession,
    user: OptionalUser,
    include_unpublished: bool = Query(False, description="Admin only."),
) -> list[TeamMember]:
    stmt = select(TeamMember)
    if not (include_unpublished and user is not None):
        stmt = stmt.where(TeamMember.published.is_(True))
    stmt = stmt.order_by(TeamMember.sort_order.asc(), TeamMember.id.asc())
    return list(db.execute(stmt).scalars().all())


@router.post("", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(payload: TeamMemberCreate, db: DbSession, user: CurrentUser) -> TeamMember:
    member = TeamMember(
        **payload.model_dump(exclude={"github_url", "linkedin_url"}),
        **_url_fields(payload),
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    logger.info("Team member %s created by user %s", member.id, user.id)
    return member


@router.patch("/{member_id}", response_model=TeamMemberResponse)
def update_member(
    member_id: int,
    payload: TeamMemberUpdate,
    db: DbSession,
    user: CurrentUser,
) -> TeamMember:
    member = db.get(TeamMember, member_id)
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found.")

    changes = payload.model_dump(exclude_unset=True)
    for field in ("github_url", "linkedin_url"):
        if field in changes and changes[field] is not None:
            changes[field] = str(changes[field])

    for field, value in changes.items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)
    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: int, db: DbSession, user: CurrentUser) -> Response:
    member = db.get(TeamMember, member_id)
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found.")
    db.delete(member)
    db.commit()
    logger.warning("Team member %s deleted by user %s", member_id, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
