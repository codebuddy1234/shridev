"""SQLAlchemy models.

Importing this package registers every model on the shared ``Base.metadata``,
which is what Alembic autogenerate reflects against.
"""

from app.models.enquiry import ContactMethod, Enquiry, EnquiryStatus
from app.models.post import BlogPost
from app.models.project import Project, ProjectImage
from app.models.team import TeamMember
from app.models.user import User

__all__ = [
    "BlogPost",
    "ContactMethod",
    "Enquiry",
    "EnquiryStatus",
    "Project",
    "ProjectImage",
    "TeamMember",
    "User",
]
