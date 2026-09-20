"""Seed clearly-marked example content.

What this does and deliberately does not do
-------------------------------------------
ShriDev's real client work, metrics and team members are not known to this
codebase, and inventing them would put false claims on a live company website.
So the seed data is honest about its own status:

* **Projects** are created as *unpublished drafts* whose narrative fields hold
  bracketed prompts describing what to write. Nothing is visible on the public
  site until a human fills them in and ticks Published.
* **Insights articles** are created with ``is_placeholder=True``. The public
  site renders a visible "Example article" notice on anything carrying that
  flag, so demo content can never be mistaken for something ShriDev published.
* **Team members** are not seeded at all. Real names and photographs come from
  the admin interface; until then the team page shows its empty state.

Run with ``--wipe`` to remove previously seeded rows before inserting.
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select  # noqa: E402

from app.database import SessionLocal  # noqa: E402
from app.models.post import BlogPost  # noqa: E402
from app.models.project import Project  # noqa: E402

TODO = "[Replace this placeholder with the real detail before publishing.]"

DRAFT_PROJECTS = [
    {
        "slug": "agriguru-ai",
        "title": "AgriGuru AI",
        "category": "AI / Agriculture / Decision Support",
        "summary": (
            "An agricultural decision-support application combining a Python "
            "machine learning service with a web interface. "
            "[Replace with an accurate one-paragraph description of what the "
            "system actually does.]"
        ),
        "challenge": (
            f"{TODO} Describe the problem the project set out to solve — who "
            "was affected, what the existing process looked like, and why it "
            "needed software."
        ),
        "solution": (
            f"{TODO} Describe what was actually built: the interfaces, the "
            "model or models, the data sources, and how a user interacts with it."
        ),
        "architecture": (
            f"{TODO} Describe the real architecture — services, data flow, "
            "where the model runs, and how the frontend reaches it."
        ),
        "development_process": (
            f"{TODO} Describe how the work was sequenced and what was learned."
        ),
        # Left as None on purpose: no measured outcome is known, and the case
        # study template omits the Results section entirely when this is null.
        "outcome": None,
        "features": [
            f"{TODO} List only features that are actually implemented.",
        ],
        "technologies": ["Python", "FastAPI", "Next.js", "PostgreSQL", "Machine Learning"],
        "featured": True,
        "published": False,
        "sort_order": 0,
    },
]

EXAMPLE_POSTS = [
    {
        "slug": "example-choosing-between-a-model-and-a-rule",
        "title": "Choosing between a machine learning model and a rule",
        "category": "AI",
        "excerpt": (
            "Example article. Not every prediction problem needs a model — and "
            "the cheaper option is often more accurate in practice."
        ),
        "content": """## Why this question comes first

Before any model is trained, it is worth asking whether the decision could be
made by a rule that a person could read and check. Rules are cheap to build,
trivial to explain, and they do not silently degrade when the world changes.

## When a rule is enough

A rule tends to win when the logic is stable, the inputs are few, and somebody
in the business can already describe the decision in a sentence. Encoding that
sentence takes an afternoon. A model to do the same thing takes weeks, needs
labelled history, and has to be monitored afterwards.

## When a model earns its cost

A model earns its place when the relationship between inputs and outcome is
genuinely too complex to write down, when there is enough labelled history to
learn from, and when being approximately right at scale is more valuable than
being exactly right occasionally.

## A practical test

Write the rule first. Measure it. If the rule reaches most of the value, the
model has to justify the remaining gap against the cost of building,
deploying and maintaining it — not against doing nothing.

> This is example content included with the initial installation to
> demonstrate the article layout. Replace or unpublish it before launch.
""",
        "tags": ["Machine Learning", "Decision Making"],
    },
    {
        "slug": "example-what-production-ready-actually-means",
        "title": "What \"production ready\" actually means",
        "category": "Software Engineering",
        "excerpt": (
            "Example article. A working demo and a deployable system differ in "
            "ways that only become visible after launch."
        ),
        "content": """## The gap after the demo

A demo proves the happy path. Production has to survive everything else: bad
input, a slow third party, a database restart, a user who refreshes mid-submit.

## What has to exist

**Validated inputs on the server.** Browser validation improves the experience
but is trivially bypassed. Every endpoint revalidates.

**Explicit failure states.** Loading, empty, error and success are four
distinct states. A screen that only handles success will show a blank area at
the worst possible moment.

**Migrations.** Schema changes need to be repeatable and reversible, applied
the same way in every environment.

**A tested restore.** A backup nobody has restored from is a hypothesis.

**Observability.** If a failure only becomes visible when a customer reports
it, the system is not observable.

## The honest summary

Production readiness is mostly unglamorous work that nobody sees when it is
done correctly — which is exactly why it gets skipped.

> This is example content included with the initial installation to
> demonstrate the article layout. Replace or unpublish it before launch.
""",
        "tags": ["Engineering", "Deployment"],
    },
]


def seed(wipe: bool) -> int:
    now = datetime.now(timezone.utc)

    with SessionLocal() as db:
        if wipe:
            seeded_project_slugs = [item["slug"] for item in DRAFT_PROJECTS]
            seeded_post_slugs = [item["slug"] for item in EXAMPLE_POSTS]
            removed_projects = (
                db.query(Project).filter(Project.slug.in_(seeded_project_slugs)).delete(
                    synchronize_session=False
                )
            )
            removed_posts = (
                db.query(BlogPost).filter(BlogPost.slug.in_(seeded_post_slugs)).delete(
                    synchronize_session=False
                )
            )
            db.commit()
            print(f"Removed {removed_projects} seeded project(s), {removed_posts} seeded post(s).")

        created_projects = 0
        for item in DRAFT_PROJECTS:
            exists = db.execute(
                select(Project.id).where(Project.slug == item["slug"])
            ).first()
            if exists:
                print(f"  skip project '{item['slug']}' (already present)")
                continue
            db.add(Project(**item))
            created_projects += 1

        created_posts = 0
        for item in EXAMPLE_POSTS:
            exists = db.execute(
                select(BlogPost.id).where(BlogPost.slug == item["slug"])
            ).first()
            if exists:
                print(f"  skip post '{item['slug']}' (already present)")
                continue
            db.add(
                BlogPost(
                    **item,
                    author_name="ShriDev",
                    is_placeholder=True,
                    published=True,
                    published_at=now,
                )
            )
            created_posts += 1

        db.commit()

    print(
        f"Seeded {created_projects} draft project(s) and {created_posts} example article(s).\n"
        "\n"
        "Draft projects are UNPUBLISHED — fill in the bracketed placeholders in\n"
        "the admin dashboard and tick Published to make them public.\n"
        "Example articles are published but flagged, and the site labels them\n"
        "visibly as example content. Replace or unpublish them before launch.\n"
        "No team members were seeded: add real people through the dashboard."
    )
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed example content.")
    parser.add_argument(
        "--wipe",
        action="store_true",
        help="Delete previously seeded rows before inserting.",
    )
    raise SystemExit(seed(parser.parse_args().wipe))
