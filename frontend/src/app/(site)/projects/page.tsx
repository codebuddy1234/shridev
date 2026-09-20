import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { ProjectCard } from "@/components/ui/project-card";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/states";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/content/site";
import { getProjects } from "@/lib/api";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Case studies covering the problem, the approach, the architecture and what was actually delivered — with no invented metrics.",
  path: "/projects",
});

/**
 * Projects index.
 *
 * Driven entirely by the CMS: adding a case study is an admin action, not a
 * deployment. Projects are grouped by category so the range of work is legible
 * without needing a filter control.
 */
export default async function ProjectsPage() {
  const projects = await getProjects();

  const categories = Array.from(new Set(projects.map((project) => project.category))).sort();

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Selected work."
        description="Each case study covers the problem, the approach, the architecture and what was delivered. Where results have not been measured, the outcome section is left out rather than filled with a number we cannot evidence."
        crumbs={[{ label: "Projects" }]}
        actions={
          <ButtonLink href="/start-project">
            Start a Project
            <Icon name="ArrowRight" size={16} className="btn-arrow" />
          </ButtonLink>
        }
      />

      <Section tight className="border-t border-hairline">
        <Shell>
          {projects.length === 0 ? (
            <EmptyState
              icon="FolderKanban"
              title="No case studies published yet"
              description="Projects are managed through the admin dashboard and appear here as soon as they are published. If you would like to see relevant work before committing to anything, ask us directly."
              action={
                <ButtonLink href="/contact" size="sm">
                  Contact ShriDev
                  <Icon name="ArrowRight" size={15} className="btn-arrow" />
                </ButtonLink>
              }
            />
          ) : (
            <div className="space-y-16">
              {categories.map((category) => {
                const grouped = projects.filter((project) => project.category === category);
                return (
                  <div key={category}>
                    <div className="flex items-center gap-4">
                      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-accent-400">
                        {category}
                      </h2>
                      <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
                      <span className="font-mono text-xs text-ink-faint">
                        {String(grouped.length).padStart(2, "0")}
                      </span>
                    </div>

                    <RevealGroup as="ul" className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {grouped.map((project, index) => (
                        <RevealItem as="li" key={project.id} className="flex">
                          <ProjectCard project={project} priority={index === 0} />
                        </RevealItem>
                      ))}
                    </RevealGroup>
                  </div>
                );
              })}
            </div>
          )}
        </Shell>
      </Section>

      <CtaBand
        title="Have a project in mind?"
        description="Tell us what you are trying to build or fix. We will come back with an honest view of the scope and the approach."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
        ])}
      />
      {projects.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "ShriDev projects",
            itemListElement: projects.map((project, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: project.title,
              url: absoluteUrl(`/projects/${project.slug}`),
            })),
          }}
        />
      ) : null}
    </>
  );
}
