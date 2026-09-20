import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ProjectThumb } from "@/components/ui/project-thumb";
import { ProjectCard } from "@/components/ui/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { Markdown } from "@/lib/markdown";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/content/site";
import { getProject, getProjects } from "@/lib/api";
import { truncate } from "@/lib/utils";

/**
 * Case study page.
 *
 * Sections render only when the corresponding field has content, so a project
 * without a measured outcome simply has no Results section — it never shows an
 * empty heading or an invented figure.
 */

export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };

  return pageMetadata({
    title: project.title,
    description: truncate(project.summary, 158),
    path: `/projects/${project.slug}`,
    image: project.cover_url ?? project.thumbnail_url ?? undefined,
    keywords: [project.title, project.category, ...project.technologies],
  });
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const others = (await getProjects({ limit: 4 }))
    .filter((item) => item.slug !== project.slug)
    .slice(0, 3);

  const hasNarrative = Boolean(
    project.challenge || project.solution || project.architecture || project.development_process,
  );

  return (
    <>
      <PageHeader
        eyebrow={project.category}
        title={project.title}
        description={project.summary}
        crumbs={[{ label: "Projects", href: "/projects" }, { label: project.title }]}
        actions={
          <>
            {project.live_url ? (
              <ButtonLink href={project.live_url} external>
                Live Project
                <Icon name="ExternalLink" size={16} />
              </ButtonLink>
            ) : null}
            {project.github_url ? (
              <ButtonLink href={project.github_url} external variant="secondary">
                View Repository
                <Icon name="Code2" size={16} />
              </ButtonLink>
            ) : null}
            {!project.live_url && !project.github_url ? (
              <ButtonLink href="/start-project">
                Start a Project
                <Icon name="ArrowRight" size={16} className="btn-arrow" />
              </ButtonLink>
            ) : null}
          </>
        }
      />

      {/* ---- Cover ---- */}
      <Section tight>
        <Shell>
          <Reveal className="overflow-hidden rounded-panel border border-hairline">
            <ProjectThumb
              src={project.cover_url ?? project.thumbnail_url}
              alt={`${project.title} — project cover`}
              slug={project.slug}
              priority
              sizes="(max-width: 1280px) 100vw, 1216px"
              className="aspect-[21/9] w-full"
            />
          </Reveal>
        </Shell>
      </Section>

      <Section tight className="border-t border-hairline">
        <Shell>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
            {/* ---- Narrative ---- */}
            <div>
              <section aria-labelledby="overview-heading">
                <h2 id="overview-heading" className="text-display-3 text-ink">
                  Project overview
                </h2>
                <p className="mt-5 text-[1.0625rem] leading-[1.75] text-ink-muted">
                  {project.summary}
                </p>
              </section>

              {project.challenge ? (
                <Reveal as="section" className="mt-16" aria-labelledby="challenge-heading">
                  <h2 id="challenge-heading" className="text-display-3 text-ink">
                    The challenge
                  </h2>
                  <Markdown content={project.challenge} className="mt-5" />
                </Reveal>
              ) : null}

              {project.solution ? (
                <Reveal as="section" className="mt-16" aria-labelledby="solution-heading">
                  <h2 id="solution-heading" className="text-display-3 text-ink">
                    The solution
                  </h2>
                  <Markdown content={project.solution} className="mt-5" />
                </Reveal>
              ) : null}

              {project.features.length ? (
                <Reveal as="section" className="mt-16" aria-labelledby="features-heading">
                  <h2 id="features-heading" className="text-display-3 text-ink">
                    Key features
                  </h2>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {project.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 rounded-card border border-hairline bg-surface/60 p-4 text-sm leading-relaxed text-ink-muted"
                      >
                        <Icon name="Check" size={15} className="mt-0.5 shrink-0 text-accent-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {project.architecture ? (
                <Reveal as="section" className="mt-16" aria-labelledby="architecture-heading">
                  <h2 id="architecture-heading" className="text-display-3 text-ink">
                    Architecture
                  </h2>
                  <Markdown content={project.architecture} className="mt-5" />
                </Reveal>
              ) : null}

              {project.development_process ? (
                <Reveal as="section" className="mt-16" aria-labelledby="process-heading">
                  <h2 id="process-heading" className="text-display-3 text-ink">
                    Development process
                  </h2>
                  <Markdown content={project.development_process} className="mt-5" />
                </Reveal>
              ) : null}

              {/* Rendered only when a measured outcome exists. */}
              {project.outcome ? (
                <Reveal as="section" className="mt-16" aria-labelledby="outcome-heading">
                  <h2 id="outcome-heading" className="text-display-3 text-ink">
                    Results
                  </h2>
                  <Markdown content={project.outcome} className="mt-5" />
                </Reveal>
              ) : null}

              {/* ---- Gallery ---- */}
              {project.images.length ? (
                <Reveal as="section" className="mt-16" aria-labelledby="screenshots-heading">
                  <h2 id="screenshots-heading" className="text-display-3 text-ink">
                    Screenshots
                  </h2>
                  <ul className="mt-6 space-y-6">
                    {project.images.map((image) => (
                      <li key={image.id}>
                        <figure>
                          <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-hairline bg-surface-2">
                            <Image
                              src={image.url}
                              alt={image.caption ?? `${project.title} screenshot`}
                              fill
                              sizes="(max-width: 1024px) 100vw, 760px"
                              loading="lazy"
                              className="object-cover"
                            />
                          </div>
                          {image.caption ? (
                            <figcaption className="mt-3 text-sm text-ink-faint">
                              {image.caption}
                            </figcaption>
                          ) : null}
                        </figure>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {!hasNarrative ? (
                <p className="mt-12 rounded-card border border-dashed border-hairline-strong p-6 text-sm leading-relaxed text-ink-faint">
                  A fuller write-up of this project is being prepared. In the
                  meantime, ask us directly and we will walk you through the
                  problem, the approach and the architecture.
                </p>
              ) : null}
            </div>

            {/* ---- Sticky facts panel ---- */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Card className="p-7">
                <h2 className="font-display text-base font-medium text-ink">Project details</h2>

                <dl className="mt-6 space-y-5 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                      Category
                    </dt>
                    <dd className="mt-1.5 text-ink-muted">{project.category}</dd>
                  </div>

                  {project.technologies.length ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                        Technology stack
                      </dt>
                      <dd className="mt-2.5">
                        <ul className="flex flex-wrap gap-1.5">
                          {project.technologies.map((tech) => (
                            <li key={tech}>
                              <Badge variant="tech" size="sm">
                                {tech}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}
                </dl>

                {project.live_url || project.github_url ? (
                  <ul className="mt-7 space-y-2.5 border-t border-hairline pt-6">
                    {project.live_url ? (
                      <li>
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between gap-3 text-sm text-accent-400 transition-colors hover:text-accent-300"
                        >
                          Live project
                          <Icon name="ArrowUpRight" size={15} />
                        </a>
                      </li>
                    ) : null}
                    {project.github_url ? (
                      <li>
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between gap-3 text-sm text-accent-400 transition-colors hover:text-accent-300"
                        >
                          Source repository
                          <Icon name="ArrowUpRight" size={15} />
                        </a>
                      </li>
                    ) : null}
                  </ul>
                ) : null}

                <div className="mt-7 border-t border-hairline pt-6">
                  <ButtonLink href="/start-project" size="sm" full>
                    Discuss a Similar Project
                    <Icon name="ArrowRight" size={15} className="btn-arrow" />
                  </ButtonLink>
                  <Link
                    href="/projects"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink-muted"
                  >
                    <Icon name="ArrowLeft" size={13} />
                    All projects
                  </Link>
                </div>
              </Card>
            </aside>
          </div>
        </Shell>
      </Section>

      {others.length ? (
        <Section tight className="border-t border-hairline">
          <Shell>
            <SectionHeader eyebrow="More work" title="Other projects" titleClassName="text-display-3" />
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <li key={item.id} className="flex">
                  <ProjectCard project={item} />
                </li>
              ))}
            </ul>
          </Shell>
        </Section>
      ) : null}

      <CtaBand />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          url: absoluteUrl(`/projects/${project.slug}`),
          ...(project.cover_url ? { image: project.cover_url } : {}),
          about: project.category,
          keywords: project.technologies.join(", "),
          creator: { "@id": absoluteUrl("/#organization") },
          dateModified: project.updated_at,
        }}
      />
    </>
  );
}
