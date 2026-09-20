"""Create or update an admin account.

Usage
-----
    python -m scripts.create_admin                       # reads FIRST_ADMIN_* from the environment
    python -m scripts.create_admin --email a@b.com       # prompts for the password
    python -m scripts.create_admin --email a@b.com --superuser

The password is never taken from a command-line argument: arguments are
visible in the process list and in shell history. It is either read from the
environment or prompted for without echo.
"""

from __future__ import annotations

import argparse
import getpass
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select  # noqa: E402

from app.config import settings  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402
from app.security import PasswordTooLongError, hash_password  # noqa: E402

MIN_PASSWORD_LENGTH = 12
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_password(password: str) -> list[str]:
    """Return a list of problems; empty means acceptable."""
    problems: list[str] = []
    if len(password) < MIN_PASSWORD_LENGTH:
        problems.append(f"must be at least {MIN_PASSWORD_LENGTH} characters")
    if len(password.encode("utf-8")) > 72:
        problems.append("must be at most 72 bytes (a bcrypt limit)")
    if not re.search(r"[A-Za-z]", password):
        problems.append("must contain a letter")
    if not re.search(r"\d", password):
        problems.append("must contain a digit")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description="Create or update a ShriDev admin account.")
    parser.add_argument("--email", help="Admin email address.")
    parser.add_argument("--name", help="Full name shown in the dashboard.")
    parser.add_argument(
        "--superuser",
        action="store_true",
        help="Grant superuser rights (required to manage other admin accounts).",
    )
    args = parser.parse_args()

    email = (args.email or settings.FIRST_ADMIN_EMAIL or "").strip().lower()
    if not email:
        email = input("Admin email: ").strip().lower()

    if not EMAIL_PATTERN.match(email):
        print(f"error: '{email}' is not a valid email address.", file=sys.stderr)
        return 2

    full_name = args.name or settings.FIRST_ADMIN_NAME

    password = settings.FIRST_ADMIN_PASSWORD
    if not password:
        password = getpass.getpass("Password: ")
        confirmation = getpass.getpass("Confirm password: ")
        if password != confirmation:
            print("error: passwords do not match.", file=sys.stderr)
            return 2

    problems = validate_password(password)
    if problems:
        print("error: password " + "; ".join(problems) + ".", file=sys.stderr)
        return 2

    try:
        hashed = hash_password(password)
    except PasswordTooLongError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    with SessionLocal() as db:
        existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()

        if existing is not None:
            existing.hashed_password = hashed
            existing.full_name = full_name
            existing.is_active = True
            if args.superuser:
                existing.is_superuser = True
            db.commit()
            print(f"Updated existing admin account: {email}")
            return 0

        # The first account created is always a superuser — otherwise there
        # would be nobody able to manage accounts.
        is_first = db.execute(select(User.id).limit(1)).first() is None

        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hashed,
            is_active=True,
            is_superuser=args.superuser or is_first,
        )
        db.add(user)
        db.commit()
        print(f"Created admin account: {email} (superuser={user.is_superuser})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
