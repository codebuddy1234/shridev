# Deployment

Target topology: **frontend on Vercel**, **backend on Render** (or any
container host), **database on managed PostgreSQL**.

Nothing in the codebase is tied to these providers — the backend ships a
Dockerfile and runs anywhere that runs a container.

---

## Order of operations

Deploy in this order, because each step needs values from the one before:

1. Database — produces `DATABASE_URL`
2. Backend — needs `DATABASE_URL`, produces the API URL
3. Frontend — needs the API URL
4. Return to the backend and set `CORS_ORIGINS` to the real frontend domain

---

## 1. Database

Provision managed PostgreSQL 14+ (Render, Railway, Neon, Supabase, RDS).

- Pick the region closest to where the **backend** runs, not where you are.
  Every request pays that latency.
- Copy the **internal** connection string if the provider offers one — it
  avoids egress charges and keeps traffic off the public internet.
- Confirm automated backups are on and check the retention window.

`postgres://` and `postgresql://` URLs are both accepted; the application
normalises them to the psycopg 3 driver automatically, so paste the provider's
string unchanged.

---

## 2. Backend

### Render (or an equivalent container host)

| Setting | Value |
| --- | --- |
| Environment | Docker |
| Root directory | `backend` |
| Dockerfile path | `backend/Dockerfile` |
| Health check path | `/health` |

The image runs `alembic upgrade head` before starting uvicorn, so a deploy can
never serve against an older schema.

Without Docker, use a Python environment with:

```
Build:  pip install -r requirements.txt
Start:  alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips='*'
```

`--proxy-headers` matters: rate limiting keys on the client IP, and without it
every request appears to come from the load balancer.

### Environment variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/shridev
SECRET_KEY=<generate, see below>
ENVIRONMENT=production
CORS_ORIGINS=https://shridev.com,https://www.shridev.com
ACCESS_TOKEN_EXPIRE_MINUTES=480
BCRYPT_ROUNDS=12
RATE_LIMIT_ENABLED=true
```

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

`ENVIRONMENT=production` is not cosmetic. It makes the application refuse to
start if `SECRET_KEY` is unset, if `DATABASE_URL` still points at localhost, or
if `CORS_ORIGINS` still contains a localhost origin — and it disables `/docs`,
`/redoc` and `/openapi.json`.

### First admin account

Once the service is live, open a shell on it:

```bash
python -m scripts.create_admin --email you@yourdomain.com --name "Your Name"
```

The password is prompted for without echo, so it never reaches shell history
or the process list. The first account created is automatically a superuser.

> Reserved TLDs (`.local`, `.test`, `.invalid`) fail email validation. Use a
> real, deliverable domain.

### Verify

```bash
curl https://api.shridev.com/health
# {"status":"ok","service":"ShriDev API","environment":"production","database":"ok"}

curl -I https://api.shridev.com/docs   # expect 404 in production
```

---

## 3. Frontend

### Vercel

| Setting | Value |
| --- | --- |
| Framework | Next.js (detected) |
| Root directory | `frontend` |
| Build command | `npm run build` (default) |

### Environment variables

```bash
API_URL=https://api.shridev.com
NEXT_PUBLIC_SITE_URL=https://shridev.com
ADMIN_SESSION_COOKIE=shridev_admin_session

# Business details — blank entries are omitted from the UI, not faked
NEXT_PUBLIC_CONTACT_EMAIL=hello@shridev.com
NEXT_PUBLIC_CONTACT_PHONE=+91 XXXXX XXXXX
NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
NEXT_PUBLIC_LOCATION=Pune, Maharashtra, India
NEXT_PUBLIC_LEGAL_NAME=
NEXT_PUBLIC_FOUNDING_YEAR=

NEXT_PUBLIC_SOCIAL_LINKEDIN=
NEXT_PUBLIC_SOCIAL_GITHUB=
NEXT_PUBLIC_SOCIAL_INSTAGRAM=

NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

Two things worth repeating:

- **`API_URL` has no `NEXT_PUBLIC_` prefix, deliberately.** It is used only by
  Server Components and route handlers. The browser never calls the API
  directly, so its location is not published in the client bundle.
- **`NEXT_PUBLIC_*` values are inlined into the browser bundle at build
  time.** Changing one requires a rebuild, not just a restart — and a secret
  behind that prefix is a public secret.

### Domains

Add both apex and `www` in Vercel and pick one as canonical (Vercel redirects
the other). `NEXT_PUBLIC_SITE_URL` must match the canonical choice, or
canonical tags and the sitemap will disagree with what is actually served.

---

## 4. Close the CORS loop

Return to the backend and set `CORS_ORIGINS` to the real frontend domains,
then redeploy. The allow-list is exact-match and never `*` — admin requests
carry credentials, and a wildcard would make them readable from any site.

---

## Rate limiting and horizontal scaling

The limiter (`backend/app/rate_limit.py`) keeps counters **in the worker
process**. With one instance and one worker, the configured limits are the
real limits. With `N` workers or instances, the effective limit is roughly
`N ×` the configured value, because each process counts independently.

That is acceptable for its purpose — blunting automated form submission and
password guessing — and it is why the default deployment is a single instance.

**Before scaling horizontally**, move the counters to Redis. Only
`SlidingWindowLimiter` changes; `enquiry_rate_limit` and `login_rate_limit`
keep the same signatures, so no call site moves. Alternatively, apply rate
limiting at the edge (Cloudflare, or your platform's WAF) and set
`RATE_LIMIT_ENABLED=false`.

---

## Security checklist

- [ ] `SECRET_KEY` generated fresh, never reused from development
- [ ] `ENVIRONMENT=production` (enforces the startup checks, disables `/docs`)
- [ ] `CORS_ORIGINS` lists only real domains
- [ ] Database not publicly reachable, or restricted by IP allow-list
- [ ] HTTPS enforced on both services (both platforms do this by default)
- [ ] Admin password at least 12 characters, stored in a password manager
- [ ] No `.env` file committed — verify with `git log --all --full-history -- '**/.env'`
- [ ] Add your image CDN host to `images.remotePatterns` in `next.config.ts`;
      unlisted hosts are rejected rather than proxied
- [ ] Backup restore rehearsed at least once

---

## Post-deployment

```bash
# Health
curl https://api.shridev.com/health

# Security headers
curl -I https://shridev.com | grep -iE 'content-security-policy|strict-transport|x-frame|x-content-type'

# SEO artefacts
curl https://shridev.com/robots.txt
curl -s https://shridev.com/sitemap.xml | grep -c '<loc>'

# Admin must not be indexable
curl -I https://shridev.com/admin | grep -i x-robots-tag

# End-to-end: submit a test enquiry, then confirm it appears in the dashboard
```

Then submit `sitemap.xml` to Google Search Console and, if you set
`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, complete verification.

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Public pages render empty states | Backend unreachable. `lib/api.ts` degrades gracefully by design — check `API_URL` and `/health`. The server log records the failure. |
| Enquiry form returns 502 | The Next server cannot reach the API. Check `API_URL` and whether the API is on a private network Vercel cannot see. |
| Admin login succeeds then bounces back | Cookie rejected. The session cookie is `Secure` in production, so the site must be served over HTTPS. |
| 429 during testing | Rate limiter doing its job. Wait out `*_RATE_WINDOW_SECONDS`, or restart the API to clear in-process counters. |
| Images fail with "hostname not configured" | Add the host to `images.remotePatterns` in `next.config.ts` and redeploy. |
| Backend refuses to start | `ENVIRONMENT=production` with `SECRET_KEY` unset, or a localhost `DATABASE_URL`/`CORS_ORIGINS`. The error names which. |
| Login returns 500, log shows `InvalidKeyError: HMAC key must not be empty` | `SECRET_KEY` resolved to an empty string. Fixed in config — a blank key now generates a temporary one in development (with a warning) and is refused in production. If you see this, you are on an older revision. |
| Admin sessions end on every backend restart | `SECRET_KEY` is blank, so a new temporary key is generated each start. Set a real one in `backend/.env`. |
| Content edits do not appear | ISR caching (60–120s). Admin writes call `revalidatePath`, so this should self-resolve; a hard refresh confirms. |
