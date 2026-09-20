import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProjectCard } from "@/components/ui/project-card";
import { EmptyState } from "@/components/ui/states";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { getProjects } from "@/lib/api";

/**
 * Selected work.
 *
 * Reads featured projects from the CMS. When none are published — a fresh
 * install, or the API being unavailable — an explanatory empty state is shown
 * rather than a broken grid or fabricated sample work.
 */
export async function FeaturedProjects() {
  const projects = await getProjects({ featured: true, limit: 3 });

  return (
    <Section id="work">
      <Shell>
        <SectionHeader
          eyebrow="Selected work"
          title="Projects, described honestly."
          description="Each case study covers the problem, the approach, the architecture and what was actually delivered. Where results have not been measured, we say so rather than publishing a number."
          action={
            <ButtonLink href="/projects" variant="secondary">
              All Projects
              <Icon name="ArrowRight" size={16} className="btn-arrow" />
            </ButtonLink>
          }
        />

        {projects.length === 0 ? (
          <EmptyState
            className="mt-14"
            as="h3"
            icon="FolderKanban"
            title="No featured projects published yet"
            description="Case studies are managed through the admin dashboard and appear here as soon as they are marked featured and published."
            action={
              <ButtonLink href="/start-project" size="sm">
                Start a Project
                <Icon name="ArrowRight" size={15} className="btn-arrow" />
              </ButtonLink>
            }
          />
        ) : (
          <RevealGroup as="ul" className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <RevealItem as="li" key={project.id} className="flex">
                <ProjectCard project={project} priority={index === 0} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Shell>
    </Section>
  );
}
