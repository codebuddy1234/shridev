"""Project enquiries submitted through the public site."""

from __future__ import annotations

import enum

from sqlalchemy import Boolean, Enum, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, TimestampMixin


class EnquiryStatus(str, enum.Enum):
    """Lifecycle of a lead, from arrival to close."""

    NEW = "NEW"
    CONTACTED = "CONTACTED"
    DISCOVERY = "DISCOVERY"
    PROPOSAL = "PROPOSAL"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CLOSED = "CLOSED"


class ContactMethod(str, enum.Enum):
    EMAIL = "EMAIL"
    PHONE = "PHONE"
    WHATSAPP = "WHATSAPP"
    ANY = "ANY"


class Enquiry(Base, TimestampMixin):
    __tablename__ = "enquiries"
    __table_args__ = (
        # The admin list is filtered by status and sorted by arrival, and the
        # archived flag partitions it; this composite covers the default view.
        Index("ix_enquiries_status_created", "status", "created_at"),
        Index("ix_enquiries_archived_created", "archived", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # --- Submitted by the enquirer -------------------------------------
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(40))
    company: Mapped[str | None] = mapped_column(String(160))
    service: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    project_type: Mapped[str | None] = mapped_column(String(120))
    budget: Mapped[str | None] = mapped_column(String(80))
    timeline: Mapped[str | None] = mapped_column(String(80))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    contact_method: Mapped[ContactMethod] = mapped_column(
        Enum(ContactMethod, name="contact_method", native_enum=True),
        default=ContactMethod.EMAIL,
        nullable=False,
    )
    referral_source: Mapped[str | None] = mapped_column(String(160))

    # --- Managed internally ---------------------------------------------
    status: Mapped[EnquiryStatus] = mapped_column(
        Enum(EnquiryStatus, name="enquiry_status", native_enum=True),
        default=EnquiryStatus.NEW,
        nullable=False,
        index=True,
    )
    assigned_to: Mapped[str | None] = mapped_column(String(160))
    admin_notes: Mapped[str | None] = mapped_column(Text)
    archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Enquiry id={self.id} email={self.email!r} status={self.status.value}>"
