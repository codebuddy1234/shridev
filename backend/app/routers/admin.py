"""Admin dashboard aggregates."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import func, select

from app.deps import CurrentUser, DbSession
from app.models.enquiry import Enquiry, EnquiryStatus
from app.models.post import BlogPost
from app.models.project import Project
from app.models.team import TeamMember
from app.schemas.post import AdminStatsResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsResponse)
def dashboard_stats(db: DbSession, _user: CurrentUser) -> AdminStatsResponse:
    """Counts for the dashboard tiles.

    Computed in a single grouped query per entity rather than one query per
    tile, so the dashboard stays cheap as the tables grow.
    """
    status_rows = db.execute(
        select(Enquiry.status, func.count())
        .where(Enquiry.archived.is_(False))
        .group_by(Enquiry.status)
    ).all()
    breakdown = {row[0].value: row[1] for row in status_rows}

    total_enquiries = sum(breakdown.values())

    # "Active" spans the phases where work is genuinely under way.
    active = sum(
        breakdown.get(state.value, 0)
        for state in (EnquiryStatus.DISCOVERY, EnquiryStatus.PROPOSAL, EnquiryStatus.IN_PROGRESS)
    )

    published_projects = db.execute(
        select(func.count()).select_from(Project).where(Project.published.is_(True))
    ).scalar_one()

    team_members = db.execute(
        select(func.count()).select_from(TeamMember).where(TeamMember.published.is_(True))
    ).scalar_one()

    published_posts = db.execute(
        select(func.count()).select_from(BlogPost).where(BlogPost.published.is_(True))
    ).scalar_one()

    return AdminStatsResponse(
        total_enquiries=total_enquiries,
        new_enquiries=breakdown.get(EnquiryStatus.NEW.value, 0),
        active_projects=active,
        completed_projects=breakdown.get(EnquiryStatus.COMPLETED.value, 0),
        published_projects=published_projects,
        team_members=team_members,
        published_posts=published_posts,
        status_breakdown={state.value: breakdown.get(state.value, 0) for state in EnquiryStatus},
    )
