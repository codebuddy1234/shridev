# Architecture

How the system is put together, and why each decision was made.

---

## Overview

```
                 Browser
                    │
        ┌───────────┴───────────┐
        │   Next.js 16 server   │   Server Components, route handlers,
        │   (Vercel / Node)     │   server actions, HttpOnly session cookie
        └───────────┬───────────┘
                    │  server-to-server HTTP, bearer token
        ┌───────────┴───────────┐
        │   FastAPI (Python)    │   Validation, auth, rate limiting, CRUD
        └───────────┬───────────┘
                    │  SQLAlchemy 2 + psycopg 3
        ┌───────────┴───────────┐
        │     PostgreSQL 16     │   Alembic-managed schema
        └───────────────────────┘
```

**The browser never talks to FastAPI directly.** Every call goes through the
Next.js server, which means:

- the API's location is not published in the client bundle,
- the public form needs no CORS preflight,
- the admin bearer token stays server-side and never reaches JavaScript,
- upstream errors are normalised into one shape the UI can render.

---

## Why a separate backend

A Next.js-only build would have been simpler. The separate FastAPI service
earns its place because:

- **Python is where the AI work happens.** ShriDev's differentiator is machine
  learning, and an inference endpoint belongs in the same service as the models
  it serves. Keeping the API in Python means that is an addition, not a rewrite.
- **The API has consumers beyond this site.** A mobile app or an internal tool
  can use the same documented, validated endpoints.
- **It is the stack we sell.** The site is built the way we build client work.

Where a backend was *not* warranted, we did not add one — see *Content strategy*
below.

---

## Frontend

### Route groups

```
src/app/
├── layout.tsx        Document shell only: fonts, base metadata, analytics, JSON-LD
├── (site)/           Public chrome: skip link, sticky navbar, main, footer
├── (admin)/          Dashboard chrome: sidebar, no public navigation, noindex
├── api/              Route handlers (enquiry proxy, admin session)
├── sitemap.ts
├── robots.ts
└── not-found.tsx     Renders its own chrome, since it sits outside both groups
```

Splitting the chrome into route groups keeps the admin free of the marketing
navbar and footer without conditional rendering inside a shared layout.

### Rendering strategy

| Route | Strategy | Why |
| --- | --- | --- |
| Marketing pages | Static | Content comes from typed modules; nothing varies per request |
| `/services/[slug]` | Static, `generateStaticParams` | Eight known slugs |
| `/projects`, `/insights` and their detail pages | ISR (60–120s) | CMS-backed; new content appears without a redeploy |
| `/admin/*` | Dynamic | Per-session, never cached |
| Route handlers | Dynamic | Request-scoped by definition |

### Content strategy

Content lives in one of two places, chosen by who edits it and how often:

**Typed modules** (`src/content/`) hold services, solutions, process phases,
industries, tech stack, engagement models and FAQs. These change rarely, carry
bespoke page layouts, and benefit from type safety — `services.ts` alone drives
the mega menu, the services index, eight detail pages, the homepage grid and
the enquiry form's dropdown. Putting them in a database would create a
half-working CMS for content that is really part of the design.

**The database** holds projects, articles and team members. These change
often, are added by non-developers, and must appear without a deployment.

The dashboard's "Services" count is therefore derived from the content module,
not a table — which is why there is no `services` table. The brief asked for
tables only where functionality actually needs them.

### Graceful degradation

Public reads (`lib/api.ts`) wrap every call so an unreachable backend returns an
empty list rather than throwing. A marketing page renders its empty state
instead of a 500 while the API restarts. Admin reads deliberately do *not*
degrade — a dashboard showing zero because the API is down would be worse than
one showing an error.

### Markdown

Article and case-study bodies are parsed into React elements by a small
hand-written renderer (`lib/markdown.tsx`) rather than injected as HTML. Body
content comes from the database, so rendering it with `dangerouslySetInnerHTML`
would turn a compromised admin account into stored XSS against every visitor.
Here the worst case is that unsupported syntax renders as literal text.
`javascript:` and `data:` URLs in links fall through to plain text.

---

## Backend

### Layers

```
routers/    HTTP concerns: status codes, query parameters, auth dependencies
schemas/    Pydantic validation — the authoritative check on every input
services/   Domain logic that outlives any one endpoint (slug generation)
models/     SQLAlchemy ORM and table definitions
```

### Authentication

1. `POST /api/auth/login` verifies credentials with bcrypt and issues a
   short-lived JWT.
2. A Next.js route handler stores it in an `HttpOnly`, `SameSite=Lax`,
   `Secure`-in-production cookie.
3. Admin pages read the cookie server-side and attach it as a bearer token.
4. FastAPI verifies the signature **and re-reads the account from the
   database on every request**.

Step 4 is what makes deactivation immediate rather than deferred until a token
expires — there is a test for exactly that.

Login responses are byte-identical for an unknown email and a wrong password,
and the unknown-email path still performs a bcrypt comparison so response
timing does not leak which accounts exist.

### Defence in depth

| Layer | What it does |
| --- | --- |
| Browser | Zod validation for immediate feedback |
| Next.js middleware | Redirects unauthenticated `/admin` visits — UX, not security |
| Next.js route handler / server action | Re-validates, re-checks the session |
| FastAPI schema | Authoritative validation |
| FastAPI dependency | Verifies the token and re-reads the account |
| PostgreSQL | Constraints and foreign keys |

No single layer is trusted. The middleware in particular is explicitly *not*
the security boundary: a forged cookie gets past it and then fails at the API.

### Rate limiting

An in-process sliding window guards the public enquiry endpoint and admin
login. It is deliberately simple, with one documented limitation: counters live
in the worker process, so with several workers the effective limit is per
process. That is acceptable for blunting automated abuse on a single-instance
deployment. Moving to Redis is a change to `rate_limit.py` only — the call
sites do not change. See `docs/deployment.md`.

### Error handling

Handlers in `main.py` convert exceptions into responses that are useful to the
client without leaking internals:

- `RequestValidationError` → 422 with field-level errors the form maps onto inputs
- `IntegrityError` → 409, with the SQL logged server-side only
- `SQLAlchemyError` → 503 and a generic message, full traceback logged

---

## Data model

```
users              Admin accounts (no public registration)
enquiries          Submissions + internal status, assignee, notes, archive flag
projects           Case studies, with a nullable outcome field
  └── project_images   Ordered gallery, cascade-deleted with the project
team_members       Real people only; nothing is seeded
blog_posts         Articles, with is_placeholder marking example content
```

Two columns encode editorial policy rather than just data:

- **`projects.outcome` is nullable.** No measured result means no Results
  section on the published page, rather than an invented figure.
- **`blog_posts.is_placeholder`** marks seeded demo content. The UI renders a
  visible notice, the sitemap excludes it, and the page sets `noindex`.

---

## Design system

Tokens are defined once in `globals.css` under Tailwind v4's `@theme`, and
consumed through a small set of primitives (`Button`, `Card`, `Badge`, `Field`,
`SectionHeader`, `Shell`). Full reference in
[`design-system.md`](design-system.md).

One implementation note worth knowing: `tailwind-merge` cannot tell a custom
font-size token from a custom colour token, so `cn("text-display-2", "text-ink")`
collapsed to `text-ink` and silently removed the size from every section
heading. `lib/utils.ts` now registers the custom theme with it. If you add a
new `--color-*`, `--text-*`, `--radius-*` or `--shadow-*` token, add it there
too.

---

## Accessibility and motion

- Semantic landmarks, a skip link as the first tab stop, one `h1` per page and
  no skipped heading levels.
- A single `:focus-visible` treatment, verified as a 2px accent ring on every
  interactive element.
- Colour never carries meaning alone; status always pairs with text.
- `--color-ink-faint` was chosen to clear WCAG AA (4.5:1) against every surface
  token — it reaches 5.03:1 on the lightest.
- Framer Motion reads `useReducedMotion`, and a CSS block neutralises any
  remaining animation. Pointer-driven effects are skipped entirely.

Verified with `@axe-core/playwright` across every public and admin route:
zero violations under WCAG 2.1 A/AA plus best-practice rules.

---

## Performance

- Static rendering by default; client components only where interaction
  requires them.
- Fonts self-hosted by `next/font` at build time — no third-party request, no
  layout shift.
- Icons resolved through an explicit registry so tree-shaking works; a
  wildcard import would pull the whole icon library into the bundle.
- The hero and AI visuals are SVG, not raster: they scale from 320px to 1920px
  with no layout shift and nothing to download.
- Images sized, lazy-loaded below the fold, and served as AVIF/WebP.
