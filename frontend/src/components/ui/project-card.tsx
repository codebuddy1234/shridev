import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ProjectThumb } from "@/components/ui/project-thumb";
import type { Project } from "@/types/api";

/**
 * Project card.
 *
 * Leads with the problem category and a short summary rather than only an
 * image, so the grid reads as a set of case studies rather than a gallery.
 * External links sit outside the stretched card link so they remain
 * independently clickable and keyboard-reachable.
 */
export function ProjectCard({ project, priority }: { project: Project; priority?: boolean }) {
  return (
    <Card interactive className="group flex flex-col overflow-hidden">
      <ProjectThumb
        src={project.thumbnail_url}
        alt={`${project.title} — project thumbnail`}
        slug={project.slug}
        priority={priority}
        className="aspect-[16/10] w-full"
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2">
          <Badge variant="accent" size="sm">
            {project.category}
          </Badge>
          {project.featured ? (
            <Badge variant="brand" size="sm">
              Featured
            </Badge>
          ) : null}
        </div>

        <h3 className="mt-4 font-display text-lg font-medium text-ink">
          <Link href={`/projects/${project.slug}`} className="outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {project.title}
          </Link>
        </h3>

        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-muted">
          {project.summary}
        </p>

        {project.technologies.length ? (
          <ul className="mt-5 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 5).map((tech) => (
              <li key={tech}>
                <Badge variant="tech" size="sm">
                  {tech}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-hairline pt-5">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-400 transition-colors group-hover:text-accent-300">
            View Case Study
            <Icon
              name="ArrowRight"
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>

          {/* Raised above the stretched link so these stay clickable. */}
          <span className="relative z-10 flex items-center gap-1">
            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} — open live site`}
                title="Live site"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-hairline-strong hover:text-ink"
              >
                <Icon name="ExternalLink" size={14} />
              </a>
            ) : null}
            {project.github_url ? (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} — open repository`}
                title="Repository"
                className="inline-flex size-8 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-hairline-strong hover:text-ink"
              >
                <Icon name="Code2" size={14} />
              </a>
            ) : null}
          </span>
        </div>
      </div>
    </Card>
  );
}
