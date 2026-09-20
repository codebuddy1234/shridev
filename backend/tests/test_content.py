"""Projects, articles, team members and the dashboard aggregates."""

from __future__ import annotations

from fastapi.testclient import TestClient

PROJECT = {
    "title": "Customer Portal Rebuild",
    "summary": "A customer-facing portal replacing a spreadsheet-driven process.",
    "category": "Web / Business Platform",
    "technologies": ["Next.js", "FastAPI", "PostgreSQL"],
    "features": ["Authenticated accounts", "Document self-service"],
    "published": True,
}

POST = {
    "title": "How we scope a discovery engagement",
    "excerpt": "What a short, paid discovery produces and why it saves money.",
    "content": "A discovery engagement produces a requirement summary, an architecture outline and an estimate.",
    "category": "Business Technology",
    "published": True,
}

MEMBER = {"name": "A. Engineer", "role": "Full-Stack Engineer", "published": True}


# --------------------------------------------------------------------------
# Projects
# --------------------------------------------------------------------------


def test_creating_a_project_requires_authentication(client: TestClient) -> None:
    assert client.post("/api/projects", json=PROJECT).status_code == 401


def test_slug_is_derived_from_the_title(client: TestClient, auth_headers: dict) -> None:
    body = client.post("/api/projects", headers=auth_headers, json=PROJECT).json()
    assert body["slug"] == "customer-portal-rebuild"


def test_duplicate_titles_get_distinct_slugs(client: TestClient, auth_headers: dict) -> None:
    first = client.post("/api/projects", headers=auth_headers, json=PROJECT).json()
    second = client.post("/api/projects", headers=auth_headers, json=PROJECT).json()
    assert first["slug"] == "customer-portal-rebuild"
    assert second["slug"] == "customer-portal-rebuild-2"


def test_public_list_excludes_unpublished_projects(
    client: TestClient, auth_headers: dict
) -> None:
    client.post("/api/projects", headers=auth_headers, json={**PROJECT, "published": False})
    assert client.get("/api/projects").json() == []


def test_unpublished_project_is_a_404_for_the_public(
    client: TestClient, auth_headers: dict
) -> None:
    """Not a 403 — an unreleased case study's existence is not disclosed."""
    created = client.post(
        "/api/projects", headers=auth_headers, json={**PROJECT, "published": False}
    ).json()

    assert client.get(f"/api/projects/{created['slug']}").status_code == 404
    assert (
        client.get(f"/api/projects/{created['slug']}", headers=auth_headers).status_code == 200
    )


def test_include_unpublished_is_ignored_without_a_token(
    client: TestClient, auth_headers: dict
) -> None:
    client.post("/api/projects", headers=auth_headers, json={**PROJECT, "published": False})

    assert client.get("/api/projects?include_unpublished=true").json() == []
    assert (
        len(client.get("/api/projects?include_unpublished=true", headers=auth_headers).json()) == 1
    )


def test_featured_filter(client: TestClient, auth_headers: dict) -> None:
    client.post("/api/projects", headers=auth_headers, json={**PROJECT, "featured": True})
    client.post(
        "/api/projects",
        headers=auth_headers,
        json={**PROJECT, "title": "Another Build", "featured": False},
    )

    assert len(client.get("/api/projects?featured=true").json()) == 1
    assert len(client.get("/api/projects").json()) == 2


def test_malformed_urls_are_rejected(client: TestClient, auth_headers: dict) -> None:
    response = client.post(
        "/api/projects", headers=auth_headers, json={**PROJECT, "live_url": "not a url"}
    )
    assert response.status_code == 422


def test_gallery_images_round_trip_in_order(client: TestClient, auth_headers: dict) -> None:
    created = client.post(
        "/api/projects",
        headers=auth_headers,
        json={
            **PROJECT,
            "images": [
                {"url": "https://cdn.example.com/b.png", "caption": "Second", "sort_order": 2},
                {"url": "https://cdn.example.com/a.png", "caption": "First", "sort_order": 1},
            ],
        },
    ).json()

    captions = [image["caption"] for image in created["images"]]
    assert captions == ["First", "Second"]


def test_updating_images_replaces_the_gallery(client: TestClient, auth_headers: dict) -> None:
    created = client.post(
        "/api/projects",
        headers=auth_headers,
        json={**PROJECT, "images": [{"url": "https://cdn.example.com/old.png"}]},
    ).json()

    updated = client.patch(
        f"/api/projects/{created['id']}",
        headers=auth_headers,
        json={"images": [{"url": "https://cdn.example.com/new.png"}]},
    ).json()

    assert [image["url"] for image in updated["images"]] == ["https://cdn.example.com/new.png"]


def test_patch_does_not_clear_unmentioned_fields(
    client: TestClient, auth_headers: dict
) -> None:
    created = client.post(
        "/api/projects", headers=auth_headers, json={**PROJECT, "challenge": "Keep me"}
    ).json()

    updated = client.patch(
        f"/api/projects/{created['id']}", headers=auth_headers, json={"featured": True}
    ).json()

    assert updated["challenge"] == "Keep me"
    assert updated["featured"] is True


def test_outcome_stays_null_when_not_supplied(client: TestClient, auth_headers: dict) -> None:
    """A case study with no measured result must not invent one."""
    created = client.post("/api/projects", headers=auth_headers, json=PROJECT).json()
    assert created["outcome"] is None


def test_deleting_a_project_removes_its_images(
    client: TestClient, auth_headers: dict, db
) -> None:
    from app.models.project import ProjectImage

    created = client.post(
        "/api/projects",
        headers=auth_headers,
        json={**PROJECT, "images": [{"url": "https://cdn.example.com/x.png"}]},
    ).json()

    assert db.query(ProjectImage).count() == 1
    assert client.delete(f"/api/projects/{created['id']}", headers=auth_headers).status_code == 204
    assert db.query(ProjectImage).count() == 0


# --------------------------------------------------------------------------
# Articles
# --------------------------------------------------------------------------


def test_publishing_stamps_a_date(client: TestClient, auth_headers: dict) -> None:
    created = client.post("/api/posts", headers=auth_headers, json=POST).json()
    assert created["published_at"] is not None


def test_draft_article_has_no_publish_date_and_is_hidden(
    client: TestClient, auth_headers: dict
) -> None:
    created = client.post(
        "/api/posts", headers=auth_headers, json={**POST, "published": False}
    ).json()

    assert created["published_at"] is None
    assert client.get("/api/posts").json() == []
    assert client.get(f"/api/posts/{created['slug']}").status_code == 404


def test_placeholder_flag_is_preserved(client: TestClient, auth_headers: dict) -> None:
    """The public site relies on this flag to label example content."""
    created = client.post(
        "/api/posts", headers=auth_headers, json={**POST, "is_placeholder": True}
    ).json()
    assert created["is_placeholder"] is True

    listed = client.get("/api/posts").json()
    assert listed[0]["is_placeholder"] is True


def test_articles_filter_by_category(client: TestClient, auth_headers: dict) -> None:
    client.post("/api/posts", headers=auth_headers, json=POST)
    client.post(
        "/api/posts",
        headers=auth_headers,
        json={**POST, "title": "A different piece", "category": "AI"},
    )

    assert len(client.get("/api/posts?category=AI").json()) == 1
    assert len(client.get("/api/posts").json()) == 2


def test_article_writes_require_authentication(client: TestClient) -> None:
    assert client.post("/api/posts", json=POST).status_code == 401


# --------------------------------------------------------------------------
# Team
# --------------------------------------------------------------------------


def test_team_is_empty_by_default(client: TestClient) -> None:
    """Nothing is seeded, so the public page shows its honest empty state."""
    assert client.get("/api/team").json() == []


def test_unpublished_member_is_hidden_from_the_public(
    client: TestClient, auth_headers: dict
) -> None:
    client.post("/api/team", headers=auth_headers, json={**MEMBER, "published": False})
    assert client.get("/api/team").json() == []
    assert len(client.get("/api/team?include_unpublished=true", headers=auth_headers).json()) == 1


def test_team_members_respect_sort_order(client: TestClient, auth_headers: dict) -> None:
    client.post("/api/team", headers=auth_headers, json={**MEMBER, "name": "Second", "sort_order": 2})
    client.post("/api/team", headers=auth_headers, json={**MEMBER, "name": "First", "sort_order": 1})

    assert [member["name"] for member in client.get("/api/team").json()] == ["First", "Second"]


def test_team_writes_require_authentication(client: TestClient) -> None:
    assert client.post("/api/team", json=MEMBER).status_code == 401


# --------------------------------------------------------------------------
# Dashboard aggregates
# --------------------------------------------------------------------------


def test_stats_require_authentication(client: TestClient) -> None:
    assert client.get("/api/admin/stats").status_code == 401


def test_stats_reflect_stored_records(
    client: TestClient, auth_headers: dict, valid_enquiry: dict
) -> None:
    from app.rate_limit import limiter

    first = client.post("/api/enquiries", json=valid_enquiry).json()["id"]
    limiter.reset()
    client.post("/api/enquiries", json=valid_enquiry)

    client.patch(f"/api/enquiries/{first}", headers=auth_headers, json={"status": "IN_PROGRESS"})
    client.post("/api/projects", headers=auth_headers, json=PROJECT)
    client.post("/api/posts", headers=auth_headers, json=POST)
    client.post("/api/team", headers=auth_headers, json=MEMBER)

    stats = client.get("/api/admin/stats", headers=auth_headers).json()

    assert stats["total_enquiries"] == 2
    assert stats["new_enquiries"] == 1
    assert stats["active_projects"] == 1
    assert stats["published_projects"] == 1
    assert stats["published_posts"] == 1
    assert stats["team_members"] == 1
    assert stats["status_breakdown"]["IN_PROGRESS"] == 1


def test_archived_enquiries_are_excluded_from_stats(
    client: TestClient, auth_headers: dict, valid_enquiry: dict
) -> None:
    enquiry_id = client.post("/api/enquiries", json=valid_enquiry).json()["id"]
    client.patch(f"/api/enquiries/{enquiry_id}", headers=auth_headers, json={"archived": True})

    stats = client.get("/api/admin/stats", headers=auth_headers).json()
    assert stats["total_enquiries"] == 0


# --------------------------------------------------------------------------
# System
# --------------------------------------------------------------------------


def test_health_reports_database_connectivity(client: TestClient) -> None:
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"


def test_security_headers_are_present(client: TestClient) -> None:
    headers = client.get("/health").headers
    assert headers["X-Content-Type-Options"] == "nosniff"
    assert headers["X-Frame-Options"] == "DENY"
    assert headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
