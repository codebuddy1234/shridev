"""Enquiry submission and admin lead management."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.models.enquiry import Enquiry, EnquiryStatus


def test_public_submission_creates_a_new_enquiry(
    client: TestClient, valid_enquiry: dict, db
) -> None:
    response = client.post("/api/enquiries", json=valid_enquiry)
    assert response.status_code == 201

    body = response.json()
    assert body["reference"].startswith("SD-")

    stored = db.get(Enquiry, body["id"])
    assert stored.status is EnquiryStatus.NEW
    assert stored.email == "priya@example.com"
    assert stored.archived is False


def test_submission_does_not_leak_internal_fields(
    client: TestClient, valid_enquiry: dict
) -> None:
    """An anonymous caller gets a receipt, not the record."""
    body = client.post("/api/enquiries", json=valid_enquiry).json()
    assert set(body) == {"id", "reference", "message"}


def test_email_is_normalised_to_lowercase(client: TestClient, valid_enquiry: dict, db) -> None:
    valid_enquiry["email"] = "Mixed.Case@Example.com"
    body = client.post("/api/enquiries", json=valid_enquiry).json()
    assert db.get(Enquiry, body["id"]).email == "mixed.case@example.com"


def test_blank_optional_fields_are_stored_as_null(
    client: TestClient, valid_enquiry: dict, db
) -> None:
    """Empty strings would otherwise need distinguishing from NULL everywhere."""
    valid_enquiry.update({"company": "   ", "budget": "", "project_type": None})
    body = client.post("/api/enquiries", json=valid_enquiry).json()

    stored = db.get(Enquiry, body["id"])
    assert stored.company is None
    assert stored.budget is None
    assert stored.project_type is None


def test_rejects_invalid_email(client: TestClient, valid_enquiry: dict) -> None:
    valid_enquiry["email"] = "not-an-email"
    response = client.post("/api/enquiries", json=valid_enquiry)
    assert response.status_code == 422
    assert any(error["field"] == "email" for error in response.json()["errors"])


def test_rejects_short_message(client: TestClient, valid_enquiry: dict) -> None:
    valid_enquiry["message"] = "too short"
    response = client.post("/api/enquiries", json=valid_enquiry)
    assert response.status_code == 422
    assert any(error["field"] == "message" for error in response.json()["errors"])


def test_rejects_letters_in_phone_number(client: TestClient, valid_enquiry: dict) -> None:
    valid_enquiry["phone"] = "call me maybe"
    assert client.post("/api/enquiries", json=valid_enquiry).status_code == 422


def test_accepts_international_phone_formats(client: TestClient, valid_enquiry: dict) -> None:
    for number in ["+91 98765 43210", "(020) 7946-0958", "+1 555 123 4567", "9876543210"]:
        valid_enquiry["phone"] = number
        assert client.post("/api/enquiries", json=valid_enquiry).status_code == 201, number


def test_oversized_message_is_rejected(client: TestClient, valid_enquiry: dict) -> None:
    valid_enquiry["message"] = "x" * 5001
    assert client.post("/api/enquiries", json=valid_enquiry).status_code == 422


def test_honeypot_submission_is_silently_discarded(
    client: TestClient, valid_enquiry: dict, db
) -> None:
    """The bot receives a success-shaped response, but nothing is stored —
    a visible rejection would just teach it to omit the field."""
    valid_enquiry["website"] = "http://spam.example.com"
    response = client.post("/api/enquiries", json=valid_enquiry)

    assert response.status_code == 201
    assert response.json()["id"] == 0
    assert db.query(Enquiry).count() == 0


def test_status_cannot_be_set_by_the_public_form(
    client: TestClient, valid_enquiry: dict, db
) -> None:
    """Extra fields are ignored, so a crafted payload cannot mark itself won."""
    valid_enquiry["status"] = "COMPLETED"
    valid_enquiry["admin_notes"] = "injected"
    body = client.post("/api/enquiries", json=valid_enquiry).json()

    stored = db.get(Enquiry, body["id"])
    assert stored.status is EnquiryStatus.NEW
    assert stored.admin_notes is None


def test_submissions_are_rate_limited(client: TestClient, valid_enquiry: dict) -> None:
    from app.config import settings

    statuses = [
        client.post("/api/enquiries", json=valid_enquiry).status_code
        for _ in range(settings.ENQUIRY_RATE_LIMIT + 2)
    ]
    assert statuses[0] == 201
    assert statuses[-1] == 429


# --------------------------------------------------------------------------
# Admin operations
# --------------------------------------------------------------------------


def _create(client: TestClient, payload: dict, **overrides) -> int:
    return client.post("/api/enquiries", json={**payload, **overrides}).json()["id"]


def test_listing_requires_authentication(client: TestClient) -> None:
    assert client.get("/api/enquiries").status_code == 401


def test_detail_requires_authentication(client: TestClient, valid_enquiry: dict) -> None:
    enquiry_id = _create(client, valid_enquiry)
    assert client.get(f"/api/enquiries/{enquiry_id}").status_code == 401


def test_update_requires_authentication(client: TestClient, valid_enquiry: dict) -> None:
    enquiry_id = _create(client, valid_enquiry)
    response = client.patch(f"/api/enquiries/{enquiry_id}", json={"status": "CONTACTED"})
    assert response.status_code == 401


def test_delete_requires_authentication(client: TestClient, valid_enquiry: dict) -> None:
    enquiry_id = _create(client, valid_enquiry)
    assert client.delete(f"/api/enquiries/{enquiry_id}").status_code == 401


def test_admin_can_list_with_pagination(
    client: TestClient, valid_enquiry: dict, auth_headers: dict
) -> None:
    from app.config import settings
    from app.rate_limit import limiter

    for index in range(5):
        limiter.reset()  # Seeding data, not testing the limiter here.
        _create(client, valid_enquiry, name=f"Person {index}")

    response = client.get("/api/enquiries?page=1&page_size=2", headers=auth_headers)
    assert response.status_code == 200

    body = response.json()
    assert body["total"] == 5
    assert body["pages"] == 3
    assert len(body["items"]) == 2
    assert settings.ENQUIRY_RATE_LIMIT > 0


def test_admin_can_filter_by_status_and_search(
    client: TestClient, valid_enquiry: dict, auth_headers: dict, db
) -> None:
    from app.rate_limit import limiter

    first = _create(client, valid_enquiry, name="Alpha Person")
    limiter.reset()
    _create(client, valid_enquiry, name="Beta Person")

    client.patch(f"/api/enquiries/{first}", headers=auth_headers, json={"status": "PROPOSAL"})

    by_status = client.get("/api/enquiries?status=PROPOSAL", headers=auth_headers).json()
    assert by_status["total"] == 1
    assert by_status["items"][0]["id"] == first

    by_search = client.get("/api/enquiries?search=beta", headers=auth_headers).json()
    assert by_search["total"] == 1
    assert by_search["items"][0]["name"] == "Beta Person"


def test_search_is_not_sql_injectable(
    client: TestClient, valid_enquiry: dict, auth_headers: dict
) -> None:
    _create(client, valid_enquiry)
    response = client.get(
        "/api/enquiries",
        params={"search": "'; DROP TABLE enquiries; --"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["total"] == 0

    # The table must still exist and still hold the row.
    assert client.get("/api/enquiries", headers=auth_headers).json()["total"] == 1


def test_admin_can_update_status_notes_and_assignee(
    client: TestClient, valid_enquiry: dict, auth_headers: dict
) -> None:
    enquiry_id = _create(client, valid_enquiry)
    response = client.patch(
        f"/api/enquiries/{enquiry_id}",
        headers=auth_headers,
        json={
            "status": "DISCOVERY",
            "admin_notes": "Call booked for Thursday.",
            "assigned_to": "Technical Lead",
        },
    )
    assert response.status_code == 200

    body = response.json()
    assert body["status"] == "DISCOVERY"
    assert body["admin_notes"] == "Call booked for Thursday."
    assert body["assigned_to"] == "Technical Lead"


def test_patch_leaves_omitted_fields_untouched(
    client: TestClient, valid_enquiry: dict, auth_headers: dict
) -> None:
    enquiry_id = _create(client, valid_enquiry)
    client.patch(
        f"/api/enquiries/{enquiry_id}", headers=auth_headers, json={"admin_notes": "Keep me"}
    )
    body = client.patch(
        f"/api/enquiries/{enquiry_id}", headers=auth_headers, json={"status": "CONTACTED"}
    ).json()

    assert body["admin_notes"] == "Keep me"
    assert body["status"] == "CONTACTED"


def test_archiving_removes_an_enquiry_from_the_default_list(
    client: TestClient, valid_enquiry: dict, auth_headers: dict
) -> None:
    enquiry_id = _create(client, valid_enquiry)
    client.patch(f"/api/enquiries/{enquiry_id}", headers=auth_headers, json={"archived": True})

    assert client.get("/api/enquiries", headers=auth_headers).json()["total"] == 0
    assert client.get("/api/enquiries?archived=true", headers=auth_headers).json()["total"] == 1


def test_invalid_status_value_is_rejected(
    client: TestClient, valid_enquiry: dict, auth_headers: dict
) -> None:
    enquiry_id = _create(client, valid_enquiry)
    response = client.patch(
        f"/api/enquiries/{enquiry_id}", headers=auth_headers, json={"status": "NOT_A_STATUS"}
    )
    assert response.status_code == 422


def test_admin_can_delete(client: TestClient, valid_enquiry: dict, auth_headers: dict) -> None:
    enquiry_id = _create(client, valid_enquiry)
    assert client.delete(f"/api/enquiries/{enquiry_id}", headers=auth_headers).status_code == 204
    assert client.get(f"/api/enquiries/{enquiry_id}", headers=auth_headers).status_code == 404


def test_missing_enquiry_returns_404(client: TestClient, auth_headers: dict) -> None:
    assert client.get("/api/enquiries/999999", headers=auth_headers).status_code == 404
