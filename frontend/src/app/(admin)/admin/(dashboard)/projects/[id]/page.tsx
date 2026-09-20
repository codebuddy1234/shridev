import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { ProjectForm } from "@/components/admin/project-form";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { getAdminProjects } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();

  const { token } = await requireAdmin(`/admin/projects/${id}`);

  // The admin list includes drafts, which the public single-project endpoint
  // would not return without a token; reusing it keeps one code path.
  const projects = await getAdminProjects(token);
  const project = projects.find((item) => item.id === numericId);
  if (!project) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink-muted"
      >
        <Icon name="ArrowLeft" size={13} />
        All projects
      </Link>

      <AdminPageHeading
        title={project.title}
        description={`/projects/${project.slug}`}
        actions={
          project.published ? (
            <Badge variant="positive" size="md">Published</Badge>
          ) : (
            <Badge variant="neutral" size="md">Draft</Badge>
          )
        }
      />

      <ProjectForm project={project} />
    </div>
  );
}
