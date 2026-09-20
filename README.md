# ShriDev

Official website for **ShriDev** — Software Engineering & AI Solutions.

A production-ready marketing site with a CMS-backed portfolio and insights
section, a working project-enquiry pipeline, and a secure internal dashboard
for managing leads and content.

```
Next.js 16 (App Router)  ->  FastAPI  ->  PostgreSQL
```

---

## Contents

- [What this is](#what-this-is)
- [Stack](#stack)
- [Repository layout](#repository-layout)
- [Local development](#local-development)
- [Running with Docker](#running-with-docker)
- [Environment variables](#environment-variables)
- [Creating an admin account](#creating-an-admin-account)
- [Database and migrations](#database-and-migrations)
- [Testing and checks](#testing-and-checks)
- [Deployment](#deployment)
- [Content and editorial rules](#content-and-editorial-rules)
- [Before going live](#before-going-live)
- [Further documentation](#further-documentation)

---

## What this is

| Area | Detail |
| --- | --- |
| Public site | Home, Services (+8 detail pages), Solutions, Projects, Case studies, About, Team, Insights, Articles, Contact, Start a Project, Privacy, Terms, custom 404 |
| Enquiry pipeline | Validated form → Next route handler → FastAPI → PostgreSQL, with honeypot and rate limiting |
| Admin dashboard | Session auth, lead management, project CMS, article CMS, team management, password change |
| SEO | Per-page metadata, canonical URLs, OpenGraph, generated OG image, sitemap, robots.txt, JSON-LD |
| Accessibility | Zero axe violations across all public and admin routes (WCAG 2.1 A/AA + best practice) |

---

## Stack

**Frontend** — Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS v4,
Framer Motion, Lucide icons, Zod, Radix primitives for the accordion and dialog.

**Backend** — FastAPI, SQLAlchemy 2, Alembic, PostgreSQL 16, PyJWT, bcrypt.

Full reasoning behind these choices is in [`docs/architecture.md`](docs/architecture.md).

---

## Repository layout

```
shridev/
├── frontend/                 Next.js application
│   ├── src/app/
│   │   ├── (site)/           Public pages (navbar + footer chrome)
│   │   ├── (admin)/          Admin dashboard (no public chrome)
│   │   ├── api/              Route handlers: enquiry proxy, admin session
│   │   ├── layout.tsx        Document shell, fonts, analytics, JSON-LD
│   │   ├── sitemap.ts        Generated from content modules + API
│   │   └── robots.ts
│   ├── src/components/       ui/, layout/, sections/, visuals/, admin/
│   ├── src/content/          Typed content: services, company, navigation, site config
│   ├── src/lib/              api client, session, seo, markdown, utils, server actions
│   └── src/types/            Shared API contract (mirrors backend schemas)
│
├── backend/                  FastAPI application
│   ├── app/
│   │   ├── models/           SQLAlchemy models
│   │   ├── schemas/          Pydantic request/response schemas
│   │   ├── routers/          auth, enquiries, projects, team, posts, admin
│   │   ├── services/         Domain helpers (slug generation)
│   │   ├── config.py         Environment-driven settings
│   │   ├── security.py       bcrypt hashing, JWT issue/verify
│   │   ├── rate_limit.py     Sliding-window limiter
│   │   └── main.py           App, middleware, error handlers
│   ├── alembic/              Migrations
│   ├── scripts/              create_admin.py, seed.py
│   └── tests/                65 tests against real PostgreSQL
│
├── docs/                     Architecture, API, database, deployment, admin, design
├── docker-compose.yml
└── .env.example
```

---

## Local development

**Prerequisites:** Node.js 20+, Python 3.11+, PostgreSQL 14+.

### 1. Database

```bash
createdb shridev
createdb shridev_test          # only needed to run the test suite
createuser shridev --pwprompt
psql -c "GRANT ALL PRIVILEGES ON DATABASE shridev TO shridev;"
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt

cp .env.example .env
# Set DATABASE_URL, then generate a key:
python -c "import secrets; print(secrets.token_urlsafe(48))"   # -> SECRET_KEY

alembic upgrade head
python -m scripts.create_admin --email you@yourdomain.com --name "Your Name"
python -m scripts.seed          # optional: clearly-marked example content

uvicorn app.main:app --reload --port 8000
```

API on <http://localhost:8000>, interactive docs on <http://localhost:8000/docs>
(disabled automatically when `ENVIRONMENT=production`).

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # API_URL already points at localhost:8000
npm run dev
```

Site on <http://localhost:3000>, dashboard on <http://localhost:3000/admin>.

> **Note on `npm start`.** The session cookie is marked `Secure` whenever
> `NODE_ENV=production`, which `next start` sets. Browsers reject `Secure`
> cookies over plain HTTP, so admin sign-in will not work when testing a
> production build locally over `http://`. Use `npm run dev` for admin work, or
> put a TLS proxy in front. In real deployments the site is served over HTTPS,
> so this does not apply.

---

## Running with Docker

```bash
cp .env.example .env            # set POSTGRES_PASSWORD and SECRET_KEY
docker compose up --build
```

Then, in another terminal:

```bash
docker compose exec api alembic upgrade head
docker compose exec -it api python -m scripts.create_admin --email you@yourdomain.com
```

---

## Environment variables

Three files, each documenting its own scope:

| File | Scope |
| --- | --- |
| `.env.example` | Complete reference, and what `docker compose` reads |
| `backend/.env.example` | Backend only |
| `frontend/.env.example` | Frontend only |

Two rules worth stating explicitly:

1. **`NEXT_PUBLIC_*` values are public.** They are inlined into the browser
   bundle at build time. Never put a secret behind that prefix.
2. **Unset business details are omitted, not faked.** Leaving
   `NEXT_PUBLIC_CONTACT_EMAIL`, a social URL or an analytics ID blank removes
   that element from the UI entirely rather than rendering a placeholder a
   visitor could mistake for real information.

---

## Creating an admin account

There is no self-service registration, by design. Accounts are created on the
server:

```bash
cd backend
python -m scripts.create_admin --email colleague@yourdomain.com --name "Full Name"
python -m scripts.create_admin --email colleague@yourdomain.com --superuser
```

The password is prompted for without echo, so it never reaches shell history or
the process list. Running the script for an existing email resets that
account's password. The first account created is automatically a superuser.

> Email addresses on reserved TLDs (`.local`, `.test`, `.invalid`) are rejected
> by validation — use a real, deliverable domain.

---

## Database and migrations

```bash
cd backend
alembic upgrade head                              # apply
alembic revision --autogenerate -m "description"  # create (review before committing)
alembic downgrade -1                              # roll back one
alembic upgrade head --sql                        # print SQL without applying
```

Tables: `users`, `enquiries`, `projects`, `project_images`, `team_members`,
`blog_posts`. Schema details in [`docs/database.md`](docs/database.md).

---

## Testing and checks

```bash
# Backend — 65 tests against a real PostgreSQL database
cd backend
DATABASE_URL=$TEST_DATABASE_URL pytest -q
pytest --cov=app --cov-report=term-missing

# Frontend
cd frontend
npm run check        # typecheck + lint + build
```

The backend suite runs against PostgreSQL rather than SQLite because the schema
uses `ARRAY` columns and native enums that SQLite cannot represent — testing
against a different engine than production would prove little.

---

## Deployment

Frontend on Vercel, backend on Render/Railway or any container host, database
on managed PostgreSQL. Step-by-step instructions, including the horizontal
scaling caveat for rate limiting, are in
[`docs/deployment.md`](docs/deployment.md).

---

## Content and editorial rules

This codebase deliberately avoids putting unverifiable claims on a live
company website. These rules are enforced in code, not just in guidance:

- **No invented business data.** Contact details, social profiles, analytics
  IDs and legal entity details come from configuration. Unset means the UI
  omits that element.
- **No fabricated metrics.** A case study's `outcome` field is nullable, and
  the Results section is omitted entirely when it is empty. The seed script
  never populates it.
- **Example content is labelled.** Seeded articles carry `is_placeholder`,
  which renders a visible notice, excludes them from `sitemap.xml` and sets
  `noindex`.
- **No invented people.** No team members are seeded. Until real ones are
  added, the team page shows the roles an engagement draws on, described as
  functions rather than as staff.
- **Seeded projects are drafts.** They are unpublished and contain bracketed
  prompts describing what to write.

---

## Before going live

- [ ] Set `SECRET_KEY` to a freshly generated value
- [ ] Set `ENVIRONMENT=production` (this enforces the checks above and disables `/docs`)
- [ ] Set `CORS_ORIGINS` to your real domains only
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS URL
- [ ] Fill in the contact, social and legal `NEXT_PUBLIC_*` values you want shown
- [ ] Replace or unpublish the seeded example articles
- [ ] Complete the AgriGuru AI draft with accurate detail, or delete it
- [ ] Add real team members, or leave the roles view in place
- [ ] Have `privacy-policy` and `terms` reviewed and fill in their bracketed placeholders
- [ ] Add your image CDN host to `images.remotePatterns` in `next.config.ts`
- [ ] Verify a database backup restores
- [ ] Submit `sitemap.xml` to Google Search Console

---

## Further documentation

| Document | Contents |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | System design and the reasoning behind each decision |
| [`docs/api.md`](docs/api.md) | Endpoint reference with request and response shapes |
| [`docs/database.md`](docs/database.md) | Schema, indexes, migrations, backup and restore |
| [`docs/deployment.md`](docs/deployment.md) | Vercel, Render and managed PostgreSQL, step by step |
| [`docs/admin.md`](docs/admin.md) | Using the dashboard and managing content |
| [`docs/design-system.md`](docs/design-system.md) | Tokens, components and the rules that keep them consistent |

---

© ShriDev. All rights reserved.
