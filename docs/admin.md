# Admin dashboard

Internal interface at `/admin` for managing enquiries and site content.

---

## Access

Sign in at `/admin/login`. There is no self-service registration — accounts are
created on the server:

```bash
cd backend
python -m scripts.create_admin --email colleague@yourdomain.com --name "Full Name"
python -m scripts.create_admin --email colleague@yourdomain.com --superuser
```

The password is prompted for without echo, so it never reaches shell history or
the process list. Running the script for an existing address resets that
account's password. The first account created is automatically a superuser.

> Addresses on reserved TLDs (`.local`, `.test`, `.invalid`) are rejected by
> validation. Use a real, deliverable domain.

**How the session works.** Signing in exchanges credentials for a token that a
route handler stores in an `HttpOnly` cookie — the browser never sees it, so it
cannot be read by JavaScript. Admin pages are Server Components that read the
cookie and call the API server-side.

The session lasts `ACCESS_TOKEN_EXPIRE_MINUTES` (default 8 hours). Setting an
account inactive takes effect on the next request, not whenever their token
happens to expire.

---

## Dashboard

Six live counts, all computed from the database — nothing on this screen is
illustrative:

| Tile | Meaning |
| --- | --- |
| Total enquiries | All non-archived enquiries |
| New enquiries | Status `NEW` — awaiting first contact |
| Active projects | `DISCOVERY` + `PROPOSAL` + `IN_PROGRESS` |
| Completed | Status `COMPLETED` |
| Published projects | Case studies live on the site |
| Team members | Published team profiles |

Alongside: the six most recent enquiries, and a pipeline breakdown by status
with proportion bars. Every tile and row links into the filtered list.

---

## Enquiries

### The list

Search, filtering, sorting and pagination all run **server-side** against
indexed columns, and the state lives in the URL — so a filtered view is
bookmarkable and the back button behaves.

| Control | Notes |
| --- | --- |
| Search | Name, email, company and message body; debounced |
| Status | Any of the seven statuses |
| Service | The service selected on the form |
| Sort | Newest, oldest, name A–Z/Z–A, status |
| Archived | Toggles to the archived view |

Below `xl` the table becomes cards, so the view stays usable on a phone.

### Status lifecycle

```
NEW → CONTACTED → DISCOVERY → PROPOSAL → IN_PROGRESS → COMPLETED
                                                    ↘
                                                     CLOSED
```

| Status | Use when |
| --- | --- |
| `NEW` | Just arrived, nobody has replied |
| `CONTACTED` | First reply sent |
| `DISCOVERY` | Actively scoping the requirement |
| `PROPOSAL` | Proposal or estimate sent |
| `IN_PROGRESS` | Work under way |
| `COMPLETED` | Delivered |
| `CLOSED` | Not proceeding, from any stage |

Status can be changed inline from the list, or on the detail page.

### The detail page

The left column is **exactly what the enquirer submitted**, read-only. That is
deliberate: editing someone's stated budget or requirement internally would
quietly rewrite the record of what they actually asked for.

The right column holds the internal fields — status, assignee, notes and the
archive flag. None of it is ever visible outside this dashboard.

### Archive vs delete

**Archive** removes an enquiry from the active list. It stays searchable and
can be restored. Use it for routine tidy-up.

**Delete** is permanent, with no undo, and requires confirming a dialog that
names the record. Reserve it for genuine deletion requests — for example
someone exercising a data-protection right.

---

## Projects

Adding a case study is an admin action, not a deployment.

### Fields

| Field | Notes |
| --- | --- |
| Title | Required |
| Slug | Generated from the title when blank; de-duplicated automatically |
| Category | Groups the project on the public index |
| Summary | Required; used on cards and as the meta description |
| Challenge / Solution / Architecture / Process | Markdown; **omitted from the page when blank** |
| Results | **Leave blank unless a result has genuinely been measured** |
| Key features | One per line; only implemented features |
| Technologies | One per line |
| Thumbnail / Cover | URLs on an allowed host; blank uses a generated abstract placeholder |
| Live / Repository URL | Validated as URLs |
| Gallery | One URL per line, in order; replaces the existing gallery on save |
| Published | Visible on the public site |
| Featured | Also appears in Selected work on the homepage |

> **On the Results field.** The public case study omits the section entirely
> when this is empty, rather than rendering an empty heading. That is the
> correct outcome when nothing has been measured — do not fill it with an
> estimate to make the page look complete.

Image URLs must be on a host listed in `images.remotePatterns` in
`next.config.ts`. An unlisted host is rejected rather than proxied.

### Publishing

The eye icon toggles published state from the list without opening the editor.
Changes appear on the public site within the ISR window (about a minute), and
the relevant paths are revalidated immediately on save.

---

## Insights

Same shape as projects, with two additions:

- **Content** is a Markdown subset: `##`/`###` headings, paragraphs, ordered
  and unordered lists, `>` quotes, fenced code, and inline `**bold**`,
  `*italic*`, `` `code` `` and `[links](https://…)`.
- **Mark as example content** sets `is_placeholder`. The public article then
  carries a visible notice, is excluded from `sitemap.xml`, and sets
  `noindex` — so demo content can never be mistaken for ShriDev editorial.

Publishing without an explicit date stamps the current time.

The installation seeds two example articles. The Insights admin screen shows a
banner while any are still live. **Replace or unpublish them before launch.**

---

## Team

Name, role, bio, photograph and profile links, with a sort order and a
visibility toggle. A member without a photograph renders an initials avatar
rather than a broken image.

**Nothing is seeded.** Until real people are added, the public team page shows
the roles an engagement draws on — described as functions, not as invented
staff. That is a reasonable state to launch in.

---

## Account

Shows your details and lets you change your own password (minimum 12
characters; 72 bytes is bcrypt's hard limit).

Changing a password does **not** sign out sessions elsewhere. If you suspect a
compromise, rotate the server's `SECRET_KEY` as well — that invalidates every
issued token immediately.

---

## Security notes

- The middleware redirect on `/admin` is **user experience, not the security
  boundary**. It only checks that a cookie is present. Real authorisation
  happens at the API, which verifies the token signature and re-reads the
  account on every request — a forged cookie gets past the middleware and then
  fails at the API.
- Login responses are identical for an unknown email and a wrong password, and
  both paths perform a bcrypt comparison, so neither the body nor the response
  timing reveals which accounts exist.
- Login is rate limited (default 8 attempts per 15 minutes per IP).
- The whole dashboard is `noindex, nofollow, noarchive` and `no-store`, set
  both in metadata and as response headers.
- Article and case-study bodies are rendered as React elements, never as raw
  HTML, so a compromised admin account cannot turn stored content into XSS
  against visitors.

---

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Bounced back to login immediately | Session expired, or the cookie was rejected. In production the cookie is `Secure`, so the site must be served over HTTPS. |
| "Too many attempts" | Login rate limit. Wait out the window, or restart the API to clear in-process counters. |
| Cannot sign in on a local production build | `next start` sets `NODE_ENV=production`, which marks the cookie `Secure`; browsers reject that over plain HTTP. Use `npm run dev`. |
| "Could not load …" on a dashboard screen | The API did not respond. Check the backend and `/health`. |
| Saved content is not on the public site | Confirm Published is ticked. Otherwise wait out the ISR window (~60s) and hard refresh. |
| Image shows as broken | Its host is not in `images.remotePatterns` in `next.config.ts`. |
