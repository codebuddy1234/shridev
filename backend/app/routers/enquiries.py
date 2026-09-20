"""Project enquiries.

``POST`` is public (rate limited, honeypot protected). Every other operation
requires an authenticated admin.
"""

from __future__ import annotations

import logging
from math import ceil
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import func, or_, select

from app.deps import CurrentUser, DbSession
from app.models.enquiry import Enquiry, EnquiryStatus
from app.rate_limit import enquiry_rate_limit
from app.schemas.common import PaginatedResponse
from app.schemas.enquiry import (
    EnquiryCreate,
    EnquiryCreatedResponse,
    EnquiryResponse,
    EnquiryUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enquiries", tags=["enquiries"])

SortField = Literal["created_at", "-created_at", "name", "-name", "status", "-status"]


@router.post(
    "",
    response_model=EnquiryCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a project enquiry (public)",
)
def create_enquiry(
    payload: EnquiryCreate,
    db: DbSession,
    request: Request,
    _: None = Depends(enquiry_rate_limit),
) -> EnquiryCreatedResponse:
    # Honeypot: the field is invisible to real users, so anything in it is
    # automated. Respond as though it succeeded — a bot that receives a clear
    # rejection simply retries with the field removed.
    if payload.website:
        logger.info("Rejected honeypot submission from %s", request.client.host if request.client else "?")
        return EnquiryCreatedResponse(
            id=0,
            reference="SD-0000",
            message="Thank you. Your project enquiry has been received.",
        )

    enquiry = Enquiry(
        name=payload.name,
        email=payload.email.lower(),
        phone=payload.phone,
        company=payload.company,
        service=payload.service,
        project_type=payload.project_type,
        budget=payload.budget,
        timeline=payload.timeline,
        message=payload.message,
        contact_method=payload.contact_method,
        referral_source=payload.referral_source,
        status=EnquiryStatus.NEW,
    )

    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    logger.info("Enquiry %s created for service=%s", enquiry.id, enquiry.service)

    return EnquiryCreatedResponse(
        id=enquiry.id,
        reference=f"SD-{enquiry.id:04d}",
        message="Thank you. Your project enquiry has been received.",
    )


@router.get("", response_model=PaginatedResponse[EnquiryResponse])
def list_enquiries(
    db: DbSession,
    _user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: EnquiryStatus | None = Query(None, alias="status"),
    service: str | None = Query(None, max_length=80),
    search: str | None = Query(None, max_length=160),
    archived: bool = Query(False),
    sort: SortField = Query("-created_at"),
) -> PaginatedResponse[EnquiryResponse]:
    """Admin lead list with filtering, search, sorting and pagination."""
    conditions = [Enquiry.archived.is_(archived)]

    if status_filter is not None:
        conditions.append(Enquiry.status == status_filter)
    if service:
        conditions.append(Enquiry.service == service)
    if search:
        # Bound parameters throughout — no string interpolation reaches SQL.
        term = f"%{search.strip().lower()}%"
        conditions.append(
            or_(
                func.lower(Enquiry.name).like(term),
                func.lower(Enquiry.email).like(term),
                func.lower(func.coalesce(Enquiry.company, "")).like(term),
                func.lower(Enquiry.message).like(term),
            )
        )

    total = db.execute(
        select(func.count()).select_from(Enquiry).where(*conditions)
    ).scalar_one()

    descending = sort.startswith("-")
    column = {
        "created_at": Enquiry.created_at,
        "name": Enquiry.name,
        "status": Enquiry.status,
    }[sort.lstrip("-")]
    order = column.desc() if descending else column.asc()

    rows = (
        db.execute(
            select(Enquiry)
            .where(*conditions)
            # Tie-break on id so pagination is stable when timestamps collide.
            .order_by(order, Enquiry.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )

    return PaginatedResponse[EnquiryResponse](
        items=[EnquiryResponse.model_validate(row) for row in rows],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, ceil(total / page_size)),
    )


@router.get("/{enquiry_id}", response_model=EnquiryResponse)
def get_enquiry(enquiry_id: int, db: DbSession, _user: CurrentUser) -> Enquiry:
    enquiry = db.get(Enquiry, enquiry_id)
    if enquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found.")
    return enquiry


@router.patch("/{enquiry_id}", response_model=EnquiryResponse)
def update_enquiry(
    enquiry_id: int,
    payload: EnquiryUpdate,
    db: DbSession,
    user: CurrentUser,
) -> Enquiry:
    enquiry = db.get(Enquiry, enquiry_id)
    if enquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found.")

    # exclude_unset so a PATCH omitting a field leaves it alone rather than
    # overwriting it with the schema default.
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(enquiry, field, value)

    db.commit()
    db.refresh(enquiry)
    logger.info("Enquiry %s updated by user %s: %s", enquiry_id, user.id, sorted(changes))
    return enquiry


@router.delete("/{enquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enquiry(enquiry_id: int, db: DbSession, user: CurrentUser) -> Response:
    """Permanently delete an enquiry.

    The dashboard uses archiving for routine tidy-up; this exists for genuine
    deletion requests, which are irreversible.
    """
    enquiry = db.get(Enquiry, enquiry_id)
    if enquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found.")

    db.delete(enquiry)
    db.commit()
    logger.warning("Enquiry %s permanently deleted by user %s", enquiry_id, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
