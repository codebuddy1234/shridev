# API reference

Base URL: `http://localhost:8000` in development.
All endpoints are prefixed with `/api` except `/health`.

Interactive docs are at `/docs` and `/redoc` — both are disabled automatically
when `ENVIRONMENT=production`.

---

## Authentication

Admin endpoints use a bearer token:

```
Authorization: Bearer <access_token>
```

Tokens are issued by `POST /api/auth/login` and expire after
`ACCESS_TOKEN_EXPIRE_MINUTES` (default 8 hours). The account is re-read from
the database on every request, so deactivating a user takes effect immediately
rather than when their token expires.

In the web application the token is never handled by the browser: a Next.js
route handler stores it in an `HttpOnly` cookie and attaches it server-side.

---

## Conventions

| Status | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 204 | Deleted, no body |
| 401 | Missing, invalid or expired token |
| 403 | Authenticated but not permitted |
| 404 | Not found, or unpublished and requested anonymously |
| 409 | Conflicts with an existing record |
| 422 | Validation failed — see `errors[]` |
| 429 | Rate limited — see the `Retry-After` header |
| 503 | Database unavailable |

A 422 response carries field-level detail the form maps back onto its inputs:

```json
{
  "detail": "Validation failed.",
  "errors": [
    { "field": "email", "message": "value is not a valid email address", "type": "value_error" }
  ]
}
```

**Unpublished content returns 404, not 403**, when requested without a token.
Its existence is not disclosed before it is ready.

---

## System

### `GET /health`

Liveness plus a database round-trip. Used by platform health checks.

```json
{ "status": "ok", "service": "ShriDev API", "environment": "production", "database": "ok" }
```

Returns `"status": "degraded"` with `"database": "unavailable"` if the
connection fails. The endpoint itself still answers 200 so the platform can
distinguish a dead process from a database problem.

---

## Auth

### `POST /api/auth/login`

Public. Rate limited (`LOGIN_RATE_LIMIT`, default 8 per 15 minutes per IP).

```json
{ "email": "admin@yourdomain.com", "password": "..." }
```

```json
{ "access_token": "eyJ...", "token_type": "bearer", "expires_in": 28800 }
```

Returns an identical 401 body for an unknown email and a wrong password, and
performs a bcrypt comparison in both cases so timing does not reveal which
accounts exist.

> Email addresses on reserved TLDs (`.local`, `.test`, `.invalid`) fail
> validation with 422.

### `GET /api/auth/me`

Requires auth. Returns the signed-in account — used to validate a stored session.

### `POST /api/auth/change-password`

Requires auth. Body: `current_password`, `new_password` (12–72 characters).

The 72-byte ceiling is bcrypt's input limit; longer passwords would be silently
truncated, making two different passwords interchangeable.

---

## Enquiries

### `POST /api/enquiries`

**Public.** Rate limited (`ENQUIRY_RATE_LIMIT`, default 5 per 15 minutes per IP).

```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+91 98765 43210",
  "company": "Example Retail",
  "service": "web-development",
  "project_type": "New product or system",
  "budget": "₹3,00,000 – ₹6,00,000",
  "timeline": "1–3 months",
  "message": "At least 20 characters describing the requirement.",
  "contact_method": "EMAIL",
  "referral_source": "Search"
}
```

```json
{ "id": 42, "reference": "SD-0042", "message": "Thank you. Your project enquiry has been received." }
```

Notes:

- Response is deliberately minimal — an anonymous caller gets a receipt, not
  the stored record.
- `status` and `admin_notes` in the request body are ignored; a crafted payload
  cannot set its own status.
- Blank optional fields are stored as `NULL`, not as empty strings.
- `email` is lowercased on write.
- A `website` field is a honeypot. Submissions carrying it receive a
  success-shaped response and are discarded — a visible rejection would just
  teach a bot to omit the field.

Validation: `name` 2–160, `message` 20–5000, `email` must be deliverable,
`phone` may contain only digits, spaces and `+ - ( )`.

### `GET /api/enquiries`

Requires auth. Paginated, filtered and sorted server-side.

| Parameter | Default | Notes |
| --- | --- | --- |
| `page` | 1 | |
| `page_size` | 20 | max 100 |
| `status` | — | One of the seven statuses |
| `service` | — | Service slug |
| `search` | — | Case-insensitive across name, email, company, message |
| `archived` | `false` | `true` returns only archived records |
| `sort` | `-created_at` | `created_at`, `name`, `status`, each with a `-` prefix |

```json
{ "items": [ ... ], "total": 57, "page": 1, "page_size": 20, "pages": 3 }
```

Search uses bound parameters throughout; there is a test asserting that a SQL
injection payload returns no rows and leaves the table intact.

### `GET /api/enquiries/{id}` · `PATCH /api/enquiries/{id}` · `DELETE /api/enquiries/{id}`

Require auth. `PATCH` accepts `status`, `assigned_to`, `admin_notes` and
`archived`; fields omitted from the body are left unchanged. The details
submitted by the enquirer are not editable — an internal edit to someone's
stated budget would quietly rewrite the record of what they asked for.

`DELETE` is permanent and returns 204. The dashboard uses archiving for routine
tidy-up.

**Statuses:** `NEW` → `CONTACTED` → `DISCOVERY` → `PROPOSAL` → `IN_PROGRESS` →
`COMPLETED`, plus `CLOSED`.

---

## Projects

### `GET /api/projects`

Public. Returns published projects, ordered by `sort_order` then newest.

| Parameter | Notes |
| --- | --- |
| `featured` | `true` restricts to featured projects |
| `category` | Exact match |
| `limit` | 1–100 |
| `include_unpublished` | Admin only; **ignored** without a valid token |

### `GET /api/projects/{slug}`

Public for published projects; 404 otherwise unless authenticated.

### `POST /api/projects` · `PATCH /api/projects/{id}` · `DELETE /api/projects/{id}`

Require auth.

- `slug` is generated from the title when omitted, and de-duplicated with a
  numeric suffix (`customer-portal`, `customer-portal-2`).
- `live_url` and `github_url` are validated as URLs.
- `images` replaces the gallery wholesale; deleting a project cascades to its
  images.
- **`outcome` should stay `null` unless a result has genuinely been measured.**
  The published case study omits the Results section entirely when it is empty.

---

## Team

### `GET /api/team`

Public. Published members, ordered by `sort_order`. `include_unpublished=true`
requires auth.

### `POST /api/team` · `PATCH /api/team/{id}` · `DELETE /api/team/{id}`

Require auth.

---

## Insights

### `GET /api/posts`

Public. Published articles, newest first. Filters: `category`, `featured`,
`limit`, `include_unpublished` (admin only).

### `GET /api/posts/{slug}`

Public for published articles; 404 otherwise unless authenticated.

### `POST /api/posts` · `PATCH /api/posts/{id}` · `DELETE /api/posts/{id}`

Require auth.

- Publishing without an explicit `published_at` stamps the current time.
- `content` is a Markdown subset: `##`/`###` headings, paragraphs, ordered and
  unordered lists, `>` quotes, fenced code, and inline `**bold**`, `*italic*`,
  `` `code` ``, `[text](url)`.
- **Set `is_placeholder: true` for example content.** The public article then
  carries a visible notice, is excluded from `sitemap.xml`, and sets `noindex`.

---

## Admin

### `GET /api/admin/stats`

Requires auth. Aggregates for the dashboard, computed with grouped queries
rather than one query per tile.

```json
{
  "total_enquiries": 57, "new_enquiries": 6,
  "active_projects": 4, "completed_projects": 12,
  "published_projects": 8, "team_members": 5, "published_posts": 9,
  "status_breakdown": { "NEW": 6, "CONTACTED": 11, "DISCOVERY": 3,
                        "PROPOSAL": 1, "IN_PROGRESS": 0, "COMPLETED": 12, "CLOSED": 24 }
}
```

Archived enquiries are excluded from every count.

---

## Security headers

Every response carries `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY` and `Referrer-Policy: strict-origin-when-cross-origin`.
In production, `Strict-Transport-Security` is added.

CORS is an explicit origin allow-list — never `*`, because admin requests carry
credentials.
