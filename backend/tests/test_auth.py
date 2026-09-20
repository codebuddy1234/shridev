"""Authentication and authorisation."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.models.user import User
from app.security import create_access_token, decode_access_token, verify_password


def test_login_returns_token(client: TestClient, admin_user: User) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": admin_user.email, "password": "CorrectHorseBattery1"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert decode_access_token(body["access_token"])["sub"] == str(admin_user.id)


def test_login_rejects_wrong_password(client: TestClient, admin_user: User) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": admin_user.email, "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_login_does_not_reveal_whether_account_exists(
    client: TestClient, admin_user: User
) -> None:
    """Both failure modes must return an identical body, or the endpoint
    becomes an account-enumeration oracle."""
    unknown = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "whatever-value"},
    )
    wrong = client.post(
        "/api/auth/login",
        json={"email": admin_user.email, "password": "whatever-value"},
    )
    assert unknown.status_code == wrong.status_code == 401
    assert unknown.json() == wrong.json()


def test_inactive_user_cannot_log_in(client: TestClient, admin_user: User, db) -> None:
    admin_user.is_active = False
    db.add(admin_user)
    db.commit()

    response = client.post(
        "/api/auth/login",
        json={"email": admin_user.email, "password": "CorrectHorseBattery1"},
    )
    assert response.status_code == 401


def test_deactivating_a_user_invalidates_an_issued_token(
    client: TestClient, admin_user: User, auth_headers: dict, db
) -> None:
    """The account is re-read per request, so revocation is immediate rather
    than deferred until the token expires."""
    assert client.get("/api/auth/me", headers=auth_headers).status_code == 200

    admin_user.is_active = False
    db.add(admin_user)
    db.commit()

    assert client.get("/api/auth/me", headers=auth_headers).status_code == 401


def test_me_requires_authentication(client: TestClient) -> None:
    assert client.get("/api/auth/me").status_code == 401


def test_malformed_and_foreign_tokens_are_rejected(client: TestClient) -> None:
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-jwt"}).status_code == 401

    # Correctly signed, but minted for a different purpose.
    import jwt

    from app.config import settings

    foreign = jwt.encode(
        {"sub": "1", "exp": 9999999999, "type": "refresh"},
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    assert client.get("/api/auth/me", headers={"Authorization": f"Bearer {foreign}"}).status_code == 401


def test_token_for_deleted_user_is_rejected(client: TestClient) -> None:
    token = create_access_token(999_999)
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_change_password(client: TestClient, admin_user: User, auth_headers: dict, db) -> None:
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "CorrectHorseBattery1",
            "new_password": "AnEntirelyNewPassword9",
        },
    )
    assert response.status_code == 200

    db.refresh(admin_user)
    assert verify_password("AnEntirelyNewPassword9", admin_user.hashed_password)
    assert not verify_password("CorrectHorseBattery1", admin_user.hashed_password)


def test_change_password_requires_the_current_one(
    client: TestClient, auth_headers: dict
) -> None:
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "not-it", "new_password": "AnEntirelyNewPassword9"},
    )
    assert response.status_code == 400


def test_change_password_enforces_minimum_length(
    client: TestClient, auth_headers: dict
) -> None:
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "CorrectHorseBattery1", "new_password": "short"},
    )
    assert response.status_code == 422


def test_password_hash_is_salted(admin_user: User) -> None:
    """Two users with the same password must not share a digest."""
    from app.security import hash_password

    first = hash_password("identical-password")
    second = hash_password("identical-password")
    assert first != second
    assert verify_password("identical-password", first)
    assert verify_password("identical-password", second)


def test_login_is_rate_limited(client: TestClient, admin_user: User) -> None:
    from app.config import settings

    statuses = [
        client.post(
            "/api/auth/login",
            json={"email": admin_user.email, "password": "wrong"},
        ).status_code
        for _ in range(settings.LOGIN_RATE_LIMIT + 3)
    ]
    assert 429 in statuses, "Repeated failed logins should eventually be throttled."
