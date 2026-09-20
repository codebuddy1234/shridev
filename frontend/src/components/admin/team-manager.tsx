"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { Spinner, EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/admin/project-form";
import { RecordActions } from "@/components/admin/record-actions";
import {
  createTeamMember,
  deleteTeamMember,
  updateTeamMember,
  type ActionResult,
} from "@/lib/actions/admin";
import { initials } from "@/lib/utils";
import type { TeamMember } from "@/types/api";

/**
 * Team management.
 *
 * Add and edit run through a dialog rather than a separate route — the record
 * is small enough that a full page would be more navigation than editing.
 */
export function TeamManager({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const open = creating || editing !== null;

  function close() {
    setCreating(false);
    setEditing(null);
    setResult(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const outcome = editing
      ? await updateTeamMember(editing.id, formData)
      : await createTeamMember(formData);

    setSaving(false);
    setResult(outcome);

    if (outcome.ok) {
      close();
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Icon name="Plus" size={15} />
          Add Team Member
        </Button>
      </div>

      {members.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon="Users"
          title="No team members added"
          description="Until real people are added here, the public team page shows the roles an engagement draws on rather than invented profiles."
          action={
            <Button size="sm" onClick={() => setCreating(true)}>
              <Icon name="Plus" size={15} />
              Add the first member
            </Button>
          }
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-4 rounded-card border border-hairline bg-surface/40 p-5"
            >
              {member.photo_url ? (
                // Arbitrary external avatar host; a plain img avoids requiring
                // every contributor's CDN in next.config.ts.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_url}
                  alt=""
                  className="size-11 shrink-0 rounded-full border border-hairline object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-400/25 bg-brand-500/15 font-display text-sm font-semibold text-ink"
                >
                  {initials(member.name)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{member.name}</span>
                  {member.published ? (
                    <Badge variant="positive" size="sm">Visible</Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">Hidden</Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-accent-400">{member.role}</p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(member)}
                aria-label={`Edit ${member.name}`}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-brand-400/40 hover:text-ink"
              >
                <Icon name="Pencil" size={15} />
              </button>

              <RecordActions
                recordLabel={member.name}
                onDelete={() => deleteTeamMember(member.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onOpenChange={(next) => (next ? null : close())}
        title={editing ? `Edit ${editing.name}` : "Add team member"}
        description="Use real names and roles. Nothing here should be a placeholder on a live site."
        size="lg"
      >
        <form id="team-form" onSubmit={handleSubmit} className="space-y-5">
          {result?.message && !result.ok ? (
            <FormMessage tone="error" title={result.message} />
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" required error={result?.errors?.name}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  name="name"
                  defaultValue={editing?.name}
                  required
                  aria-describedby={describedBy}
                  invalid={invalid}
                  disabled={saving}
                />
              )}
            </Field>

            <Field label="Role" required error={result?.errors?.role}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  name="role"
                  defaultValue={editing?.role}
                  required
                  placeholder="Full-Stack Engineer"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  disabled={saving}
                />
              )}
            </Field>
          </div>

          <Field label="Short bio" error={result?.errors?.bio}>
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                name="bio"
                rows={3}
                defaultValue={editing?.bio ?? ""}
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <Field
            label="Photograph URL"
            hint="Leave blank to use an initials avatar."
            error={result?.errors?.photo_url}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="photo_url"
                type="url"
                defaultValue={editing?.photo_url ?? ""}
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="LinkedIn URL" error={result?.errors?.linkedin_url}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  name="linkedin_url"
                  type="url"
                  defaultValue={editing?.linkedin_url ?? ""}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  disabled={saving}
                />
              )}
            </Field>

            <Field label="GitHub URL" error={result?.errors?.github_url}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  name="github_url"
                  type="url"
                  defaultValue={editing?.github_url ?? ""}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  disabled={saving}
                />
              )}
            </Field>
          </div>

          <Field label="Sort order" hint="Lower numbers appear first.">
            {({ id }) => (
              <Input
                id={id}
                name="sort_order"
                type="number"
                defaultValue={editing?.sort_order ?? 0}
                disabled={saving}
              />
            )}
          </Field>

          <Checkbox
            name="published"
            label="Visible on the public team page"
            defaultChecked={editing?.published ?? true}
            disabled={saving}
          />

          <div className="flex justify-end gap-3 border-t border-hairline pt-5">
            <Button type="button" variant="ghost" onClick={close} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size={15} />
                  Saving…
                </>
              ) : (
                <>
                  <Icon name="Save" size={15} />
                  {editing ? "Save" : "Add member"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
