"use client";

import { RecordActions } from "@/components/admin/record-actions";
import { deleteProject, toggleProjectPublished } from "@/lib/actions/admin";
import type { Project } from "@/types/api";

/** Binds the shared record actions to the project server actions. */
export function ProjectActions({ project }: { project: Project }) {
  return (
    <RecordActions
      recordLabel={project.title}
      published={project.published}
      onTogglePublished={(next) => toggleProjectPublished(project.id, next)}
      onDelete={() => deleteProject(project.id)}
      editHref={`/admin/projects/${project.id}`}
      viewHref={project.published ? `/projects/${project.slug}` : undefined}
    />
  );
}
