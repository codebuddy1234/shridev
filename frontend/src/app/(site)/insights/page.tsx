import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { PostCard } from "@/components/ui/post-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/states";
import { FormMessage } from "@/components/ui/field";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { getPosts } from "@/lib/api";

export const metadata = pageMetadata({
  title: "Insights",
  description:
    "Writing on AI, web development, software engineering, data and business technology from the ShriDev team.",
  path: "/insights",
});

export const revalidate = 120;

/** Editorial categories. Kept in sync with the admin form's category list. */
const categories = [
  "AI",
  "Web Development",
  "Software Engineering",
  "Data",
  "Business Technology",
  "Tutorials",
  "Company News",
];

export default async function InsightsPage() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;

  const hasPlaceholders = posts.some((post) => post.is_placeholder);
  const activeCategories = categories.filter((category) =>
    posts.some((post) => post.category === category),
  );

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Notes from the work."
        description="Writing on the decisions that come up repeatedly in building software: when a model is worth it, what production readiness actually requires, and how scope conversations go wrong."
        crumbs={[{ label: "Insights" }]}
      />

      <Section tight className="border-t border-hairline">
        <Shell>
          {hasPlaceholders ? (
            <FormMessage
              tone="info"
              title="Some articles below are example content"
              className="mb-10 max-w-3xl"
            >
              Articles marked &ldquo;Example&rdquo; were seeded with the initial
              installation to demonstrate the layout. They are not editorial
              published by ShriDev. Replace or unpublish them from the admin
              dashboard before launch.
            </FormMessage>
          ) : null}

          {posts.length === 0 ? (
            <EmptyState
              icon="FileText"
              title="No articles published yet"
              description="Articles are written and published through the admin dashboard. They will appear here as soon as the first one goes live."
              action={
                <ButtonLink href="/start-project" size="sm">
                  Start a Project
                  <Icon name="ArrowRight" size={15} className="btn-arrow" />
                </ButtonLink>
              }
            />
          ) : (
            <>
              {activeCategories.length > 1 ? (
                <ul className="mb-10 flex flex-wrap gap-2">
                  {activeCategories.map((category) => (
                    <li key={category}>
                      <Badge variant="default" size="md">
                        {category}
                        <span className="text-ink-faint">
                          {posts.filter((post) => post.category === category).length}
                        </span>
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* Lead article gets a wider treatment. */}
              {lead ? (
                <RevealItem className="mb-5 flex">
                  <PostCard post={lead} featured />
                </RevealItem>
              ) : null}

              {rest.length ? (
                <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <RevealItem as="li" key={post.id} className="flex">
                      <PostCard post={post} />
                    </RevealItem>
                  ))}
                </RevealGroup>
              ) : null}
            </>
          )}
        </Shell>
      </Section>

      <CtaBand
        title="Working on something similar?"
        description="If a piece here is relevant to a decision you are making, we are happy to talk it through — with no expectation of a project at the end of it."
        primaryLabel="Start a Project"
        secondaryLabel="Contact ShriDev"
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
        ])}
      />
    </>
  );
}
