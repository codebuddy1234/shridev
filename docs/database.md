# Database

PostgreSQL 16, accessed through SQLAlchemy 2 and psycopg 3, with the schema
managed by Alembic.

---

## Why PostgreSQL specifically

The schema uses two PostgreSQL features that shaped the choice:

- **`ARRAY` columns** for `features`, `technologies` and `tags`. These are
  short, unordered-but-display-ordered string lists read as a unit and never
  queried across rows. A join table would add two queries and a migration
  burden for no gain.
- **Native enums** for `enquiry_status` and `contact_method`, so an invalid
  status cannot reach the table even if application validation were bypassed.

The test suite therefore runs against real PostgreSQL rather than SQLite —
testing against an engine that cannot represent the production schema would
prove very little.

---

## Tables

### `users`

Admin accounts. There is no public registration, so there is no self-service
signup path to secure.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | serial PK | |
| `email` | varchar(255) | unique, indexed, lowercased on write |
| `full_name` | varchar(160) | |
| `hashed_password` | varchar(255) | bcrypt digest; plaintext is never stored or logged |
| `is_active` | boolean | `false` blocks login and invalidates issued tokens immediately |
| `is_superuser` | boolean | Required to manage other accounts |
| `created_at` / `updated_at` | timestamptz | Database-maintained |

### `enquiries`

Submissions from the public form, plus the internal fields the team manages.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | serial PK | Rendered as `SD-0042` |
| `name` | varchar(160) | |
| `email` | varchar(255) | indexed, lowercased |
| `phone` | varchar(40) | nullable |
| `company` | varchar(160) | nullable |
| `service` | varchar(80) | indexed; service slug or `other` |
| `project_type` / `budget` / `timeline` | varchar | nullable |
| `message` | text | 20–5000 characters |
| `contact_method` | enum | `EMAIL` · `PHONE` · `WHATSAPP` · `ANY` |
| `referral_source` | varchar(160) | nullable |
| `status` | enum | Default `NEW` |
| `assigned_to` | varchar(160) | nullable, free text |
| `admin_notes` | text | nullable, internal only |
| `archived` | boolean | Default `false` |

Blank optional fields are stored as `NULL`, never as `''` — otherwise every
downstream query would have to distinguish the two.

**Status lifecycle:** `NEW` → `CONTACTED` → `DISCOVERY` → `PROPOSAL` →
`IN_PROGRESS` → `COMPLETED`, plus `CLOSED` as a terminal state from anywhere.

**Indexes.** Beyond the single-column indexes on `email`, `service` and
`status`, two composites cover the dashboard's actual access patterns:

```sql
ix_enquiries_status_created    (status, created_at)
ix_enquiries_archived_created  (archived, created_at)
```

The default admin view filters on `archived` and sorts by `created_at`; the
filtered views add `status`. Pagination also orders by `id` as a tie-break so
results stay stable when timestamps collide.

### `projects`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | serial PK | |
| `slug` | varchar(160) | unique, indexed; generated from the title, de-duplicated with `-2`, `-3` |
| `title` / `summary` / `category` | | `category` indexed |
| `thumbnail_url` / `cover_url` | varchar(500) | nullable; null renders a generated abstract placeholder |
| `challenge`, `solution`, `architecture`, `development_process` | text | nullable; omitted from the page when empty |
| `outcome` | text | **nullable by design** — see below |
| `features` / `technologies` | text[] | default `{}` |
| `live_url` / `github_url` | varchar(500) | nullable, URL-validated on write |
| `featured` / `published` | boolean | both indexed |
| `sort_order` | integer | Lower first |

> **`outcome` is nullable deliberately.** A case study with no measured result
> omits the Results section entirely rather than publishing an invented figure.
> The seed script never populates it, and the admin form says so in its hint.

### `project_images`

| Column | Type | Notes |
| --- | --- | --- |
| `project_id` | FK → `projects.id` | `ON DELETE CASCADE`, indexed |
| `url` | varchar(500) | |
| `caption` | varchar(300) | nullable |
| `sort_order` | integer | Display order |

The gallery is replaced wholesale on update — the admin form submits the full
ordered list, so reconciling row by row would add complexity without changing
the result.

### `team_members`

| Column | Type | Notes |
| --- | --- | --- |
| `name` / `role` | varchar(160) | |
| `bio` | text | nullable |
| `photo_url` | varchar(500) | nullable; null renders an initials avatar |
| `github_url` / `linkedin_url` | varchar(500) | nullable |
| `sort_order` | integer | |
| `published` | boolean | indexed |

**Nothing is seeded here.** Until real people are added, the public team page
shows the roles an engagement draws on, described as functions rather than as
invented staff.

### `blog_posts`

| Column | Type | Notes |
| --- | --- | --- |
| `slug` | varchar(180) | unique, indexed |
| `title` / `excerpt` / `content` | | `content` is a Markdown subset |
| `category` | varchar(80) | indexed |
| `cover_url` / `author_name` | | nullable |
| `tags` | text[] | default `{}` |
| `is_placeholder` | boolean | **Marks example content** |
| `featured` / `published` | boolean | `published` indexed |
| `published_at` | timestamptz | Stamped automatically on first publish |

> **`is_placeholder` is editorial policy in a column.** When true the article
> renders a visible "example content" notice, is excluded from `sitemap.xml`,
> and sets `noindex` — so seeded demo content can never be mistaken for
> something ShriDev published.

---

## Migrations

The database URL comes from application settings (and therefore the
environment), never from `alembic.ini`, so no credentials are committed.

```bash
cd backend

alembic upgrade head                              # apply everything pending
alembic revision --autogenerate -m "add X"        # generate from model changes
alembic downgrade -1                              # roll back one revision
alembic current                                   # what is applied
alembic history --verbose                         # full history
alembic upgrade head --sql                        # print SQL without applying
```

**Always read an autogenerated migration before committing it.** Autogenerate
detects added and removed columns and type changes reliably; it does not infer
intent. A rename looks identical to a drop plus an add, which would destroy
data. Rewrite those as `op.alter_column(..., new_column_name=...)`.

Revision files are timestamped (`20260920_0844_initial_schema.py`) so they sort
chronologically regardless of hash.

In the Docker image, migrations run on container start, so a deploy never
serves against an older schema.

---

## Local setup

```bash
createdb shridev
createdb shridev_test
createuser shridev --pwprompt
psql -c "GRANT ALL PRIVILEGES ON DATABASE shridev TO shridev;"

cd backend
alembic upgrade head
python -m scripts.create_admin --email you@yourdomain.com --name "Your Name"
python -m scripts.seed          # optional, clearly-marked example content
```

`scripts/seed.py --wipe` removes previously seeded rows before inserting, so it
is safe to re-run.

---

## Backup and restore

A backup nobody has restored from is a hypothesis, not a backup. Test it.

```bash
# Backup — custom format, compressed, restorable selectively
pg_dump "$DATABASE_URL" --format=custom --file=shridev-$(date +%F).dump

# Schema only / data only
pg_dump "$DATABASE_URL" --schema-only --file=schema.sql
pg_dump "$DATABASE_URL" --data-only --format=custom --file=data.dump

# Restore into a fresh database
createdb shridev_restore_test
pg_restore --dbname=shridev_restore_test --clean --if-exists shridev-2026-09-20.dump

# Verify, then drop the test copy
psql -d shridev_restore_test -c "SELECT count(*) FROM enquiries;"
dropdb shridev_restore_test
```

Managed providers (Render, Railway, Neon, Supabase) take automated daily
backups. Confirm the retention window matches what you actually need, and
rehearse a restore at least once — ideally before you need it.

---

## Operational queries

```sql
-- Pipeline snapshot
SELECT status, count(*) FROM enquiries WHERE NOT archived GROUP BY status ORDER BY count DESC;

-- Enquiries per service this month
SELECT service, count(*) FROM enquiries
WHERE created_at >= date_trunc('month', now())
GROUP BY service ORDER BY count DESC;

-- Leads with no owner, oldest first
SELECT id, name, email, created_at FROM enquiries
WHERE assigned_to IS NULL AND status = 'NEW' AND NOT archived
ORDER BY created_at;

-- Example content still live (should be empty before launch)
SELECT slug, title FROM blog_posts WHERE is_placeholder AND published;

-- Draft projects still holding seed placeholders
SELECT slug, title FROM projects WHERE NOT published;

-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;
```
