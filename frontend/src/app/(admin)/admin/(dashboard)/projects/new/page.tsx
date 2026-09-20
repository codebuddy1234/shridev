import Link from "next/link";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { ProjectForm } from "@/components/admin/project-form";
import { Icon } from "@/components/ui/icon";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin("/admin/projects/new");

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
        title="New project"
        description="Only publish what the project actually does. Leave the results section blank unless an outcome has genuinely been measured."
      />

      <ProjectForm />
    </div>
  );
}
