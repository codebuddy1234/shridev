import Link from "next/link";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { ProjectActions } from "@/components/admin/project-actions";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { formatDateTime, truncate } from "@/lib/utils";
import { getAdminProjects } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { Project } from "@/types/api";

export const metadata = { title: "Projects" };

/** Project CMS index — published and draft case studies. */
export default async function AdminProjectsPage() {
  const { token } = await requireAdmin("/admin/projects");

  let projects: Project[] = [];
  let failed = false;

  try {
    projects = await getAdminProjects(token);
  } catch (error) {
    console.error("[admin-projects] load failed:", error);
    failed = true;
  }

  const published = projects.filter((project) => project.published).length;
  const drafts = projects.length - published;

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Projects"
        description="Case studies shown on the public website. Published projects appear immediately; drafts stay private."
        actions={
          <ButtonLink href="/admin/projects/new" size="sm">
            <Icon name="Plus" size={15} />
            New Project
          </ButtonLink>
        }
      />

      {failed ? (
        <ErrorState
          title="Could not load projects"
          description="The API did not respond. Check that the backend is running, then reload."
          onRetry={
            <ButtonLink href="/admin/projects" size="sm" variant="secondary">
              <Icon name="RefreshCw" size={15} />
              Reload
            </ButtonLink>
          }
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon="FolderKanban"
          title="No projects yet"
          description="Add a case study and it appears on the public projects page as soon as you publish it. No code change or deployment is needed."
          action={
            <ButtonLink href="/admin/projects/new" size="sm">
              <Icon name="Plus" size={15} />
              Add the first project
            </ButtonLink>
          }
        />
      ) : (
        <>
          <p className="text-xs text-ink-faint">
            {published} published · {drafts} draft{drafts === 1 ? "" : "s"}
          </p>

          <ul className="space-y-3">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-card border border-hairline bg-surface/40 p-5 transition-colors hover:border-hairline-strong"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-display text-base font-medium text-ink hover:text-accent-400"
                      >
                        {project.title}
                      </Link>
                      {project.published ? (
                        <Badge variant="positive" size="sm">Published</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Draft</Badge>
                      )}
                      {project.featured ? <Badge variant="brand" size="sm">Featured</Badge> : null}
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {truncate(project.summary, 170)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-faint">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="Tag" size={12} />
                        {project.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="Hash" size={12} />
                        {project.slug}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="Clock" size={12} />
                        {formatDateTime(project.updated_at)}
                      </span>
                      {project.images.length ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="Blocks" size={12} />
                          {project.images.length} image{project.images.length === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <ProjectActions project={project} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
