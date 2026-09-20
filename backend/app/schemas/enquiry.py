"""Enquiry schemas.

Validation here is the authoritative check. The browser form validates the
same rules for a better experience, but nothing reaching the database relies
on that having happened.
"""

from __future__ import annotations

import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.enquiry import ContactMethod, EnquiryStatus
from app.schemas.common import strip_or_none

# Permissive on formatting, strict on character set: international numbers vary
# far too much to pin down a single pattern, but letters never belong in one.
PHONE_PATTERN = re.compile(r"^[+()\d][\d\s\-().]{5,29}$")


class EnquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=160)
    service: str = Field(min_length=1, max_length=80)
    project_type: str | None = Field(default=None, max_length=120)
    budget: str | None = Field(default=None, max_length=80)
    timeline: str | None = Field(default=None, max_length=80)
    message: str = Field(min_length=20, max_length=5000)
    contact_method: ContactMethod = ContactMethod.EMAIL
    referral_source: str | None = Field(default=None, max_length=160)

    # Honeypot. Real users never see this field, so anything in it is a bot.
    # Named innocuously so a scripted filler is tempted to populate it.
    website: str | None = Field(default=None, exclude=True, max_length=200)

    @field_validator("name", "message")
    @classmethod
    def _require_content(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field cannot be blank.")
        return cleaned

    @field_validator("company", "project_type", "budget", "timeline", "referral_source")
    @classmethod
    def _normalise_optional(cls, value: str | None) -> str | None:
        return strip_or_none(value)

    @field_validator("phone")
    @classmethod
    def _validate_phone(cls, value: str | None) -> str | None:
        cleaned = strip_or_none(value)
        if cleaned is None:
            return None
        if not PHONE_PATTERN.match(cleaned):
            raise ValueError(
                "Enter a valid phone number using digits, spaces and the characters + - ( )."
            )
        return cleaned


class EnquiryUpdate(BaseModel):
    """Admin-only mutation. Every field is optional — a PATCH updates only
    what it names, and the contact details submitted by the enquirer are
    deliberately not editable here."""

    status: EnquiryStatus | None = None
    assigned_to: str | None = Field(default=None, max_length=160)
    admin_notes: str | None = Field(default=None, max_length=8000)
    archived: bool | None = None

    @field_validator("assigned_to")
    @classmethod
    def _normalise_assignee(cls, value: str | None) -> str | None:
        return strip_or_none(value)


class EnquiryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str | None
    company: str | None
    service: str
    project_type: str | None
    budget: str | None
    timeline: str | None
    message: str
    contact_method: ContactMethod
    referral_source: str | None
    status: EnquiryStatus
    assigned_to: str | None
    admin_notes: str | None
    archived: bool
    created_at: datetime
    updated_at: datetime


class EnquiryCreatedResponse(BaseModel):
    """Returned to the public form.

    Intentionally minimal: the reference lets us quote it back in a follow-up,
    but nothing about the record's internal state is exposed to an anonymous
    caller.
    """

    id: int
    reference: str
    message: str
