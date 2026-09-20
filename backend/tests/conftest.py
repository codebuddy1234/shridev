"""Test fixtures.

The suite runs against a real PostgreSQL database (``shridev_test`` by
default) rather than SQLite, because the schema uses PostgreSQL-specific types
— ARRAY columns and native ENUMs — that SQLite cannot represent. Testing
against a different engine than production would not prove much.

Each test gets a clean schema: tables are dropped and recreated per test
function, which is fast enough at this size and removes ordering dependencies.
"""

from __future__ import annotations

import os
import sys
from collections.abc import Iterator
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Configure the environment before app modules read their settings.
os.environ.setdefault(
    "DATABASE_URL",
    os.environ.get(
        "TEST_DATABASE_URL",
        "postgresql+psycopg://shridev:shridev_dev_password@127.0.0.1:5432/shridev_test",
    ),
)
os.environ["ENVIRONMENT"] = "development"
os.environ["SECRET_KEY"] = "test-secret-key-not-used-anywhere-real"
# Lowest permitted bcrypt cost: the suite hashes on almost every test and the
# work factor is a production concern, not a correctness one.
os.environ["BCRYPT_ROUNDS"] = "4"
os.environ["RATE_LIMIT_ENABLED"] = "true"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models.user import User  # noqa: E402
from app.rate_limit import limiter  # noqa: E402
from app.security import hash_password  # noqa: E402


@pytest.fixture(autouse=True)
def fresh_schema() -> Iterator[None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    # Counters are process-global, so a burst in one test would otherwise
    # trip the limiter in the next.
    limiter.reset()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def admin_user(db: Session) -> User:
    user = User(
        email="admin@example.com",
        full_name="Test Admin",
        hashed_password=hash_password("CorrectHorseBattery1"),
        is_active=True,
        is_superuser=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(client: TestClient, admin_user: User) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"email": admin_user.email, "password": "CorrectHorseBattery1"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture
def valid_enquiry() -> dict:
    return {
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "phone": "+91 98765 43210",
        "company": "Example Retail",
        "service": "web-development",
        "project_type": "New build",
        "budget": "₹2,00,000 – ₹5,00,000",
        "timeline": "1-3 months",
        "message": "We need a customer portal replacing our current spreadsheet process.",
        "contact_method": "EMAIL",
        "referral_source": "Search",
    }
