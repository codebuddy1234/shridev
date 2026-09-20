"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/states";
import { createProject, updateProject, type ActionResult } from "@/lib/actions/admin";
import type { Project } from "@/types/api";

/**
 * Project editor.
 *
 * Covers every field the public case study renders, so a project can be added
 * or changed entirely from the dashboard — adding work to the portfolio is
 * never a code change or a deployment.
 *
 * Lists (features, technologies, gallery URLs) are entered one per line, which
 * avoids a fiddly repeater UI for what is nearly always a paste.
 */
export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const isEdit = Boolean(project);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const outcome = project
      ? await updateProject(project.id, formData)
      : await createProject(formData);

    setResult(outcome);
    setSaving(false);

    if (outcome.ok) {
      router.refresh();
      if (!isEdit) router.push("/admin/projects");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {result?.message ? (
        <FormMessage tone={result.ok ? "success" : "error"} title={result.message} />
      ) : null}

      {/* ---- Basics ---- */}
      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Basics</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Title" required error={result?.errors?.title}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="title"
                defaultValue={project?.title}
                required
                placeholder="Customer Portal Rebuild"
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <Field
            label="Slug"
            hint="Leave blank to generate one from the title."
            error={result?.errors?.slug}
          >
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="slug"
                defaultValue={project?.slug}
                placeholder="customer-portal-rebuild"
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <Field label="Category" required error={result?.errors?.category}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="category"
                defaultValue={project?.category}
                required
                placeholder="AI / Agriculture / Decision Support"
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <Field label="Sort order" hint="Lower numbers appear first.">
            {({ id }) => (
              <Input
                id={id}
                name="sort_order"
                type="number"
                defaultValue={project?.sort_order ?? 0}
                disabled={saving}
              />
            )}
          </Field>
        </div>

        <Field
          label="Summary"
          required
          className="mt-5"
          hint="One or two sentences. Used on cards and as the meta description."
          error={result?.errors?.summary}
        >
          {({ id, describedBy, invalid }) => (
            <Textarea
              id={id}
              name="summary"
              rows={3}
              defaultValue={project?.summary}
              required
              aria-describedby={describedBy}
              invalid={invalid}
              disabled={saving}
            />
          )}
        </Field>
      </section>

      {/* ---- Case study ---- */}
      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Case study</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-faint">
          Markdown is supported: <code className="font-mono">##</code> headings, lists,{" "}
          <code className="font-mono">**bold**</code>, links. Any section left blank is omitted from
          the published page rather than rendered empty.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="The challenge">
            {({ id }) => (
              <Textarea
                id={id}
                name="challenge"
                rows={5}
                defaultValue={project?.challenge ?? ""}
                placeholder="What problem did this set out to solve?"
                disabled={saving}
              />
            )}
          </Field>

          <Field label="The solution">
            {({ id }) => (
              <Textarea
                id={id}
                name="solution"
                rows={5}
                defaultValue={project?.solution ?? ""}
                placeholder="What was actually built?"
                disabled={saving}
              />
            )}
          </Field>

          <Field label="Architecture">
            {({ id }) => (
              <Textarea
                id={id}
                name="architecture"
                rows={4}
                defaultValue={project?.architecture ?? ""}
                placeholder="Services, data flow, hosting."
                disabled={saving}
              />
            )}
          </Field>

          <Field label="Development process">
            {({ id }) => (
              <Textarea
                id={id}
                name="development_process"
                rows={4}
                defaultValue={project?.development_process ?? ""}
                placeholder="How the work was sequenced."
                disabled={saving}
              />
            )}
          </Field>

          <Field
            label="Results / outcome"
            hint="Leave blank if no result has been measured — the section is then omitted entirely rather than filled with an estimate."
          >
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                name="outcome"
                rows={4}
                defaultValue={project?.outcome ?? ""}
                placeholder="Only measured outcomes. No projections."
                aria-describedby={describedBy}
                disabled={saving}
              />
            )}
          </Field>
        </div>
      </section>

      {/* ---- Lists ---- */}
      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Features and technology</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Key features" hint="One per line. Only implemented features.">
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                name="features"
                rows={7}
                defaultValue={project?.features.join("\n") ?? ""}
                placeholder={"Authenticated accounts\nDocument self-service"}
                aria-describedby={describedBy}
                disabled={saving}
              />
            )}
          </Field>

          <Field label="Technologies" hint="One per line.">
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                name="technologies"
                rows={7}
                defaultValue={project?.technologies.join("\n") ?? ""}
                placeholder={"Next.js\nFastAPI\nPostgreSQL"}
                aria-describedby={describedBy}
                disabled={saving}
              />
            )}
          </Field>
        </div>
      </section>

      {/* ---- Media and links ---- */}
      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Media and links</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-faint">
          Image URLs must be on a host allowed in <code className="font-mono">next.config.ts</code>.
          Leave the thumbnail blank to use the generated abstract placeholder.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Thumbnail URL" error={result?.errors?.thumbnail_url}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="thumbnail_url"
                type="url"
                defaultValue={project?.thumbnail_url ?? ""}
                placeholder="https://…"
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <Field label="Cover URL" error={result?.errors?.cover_url}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="cover_url"
                type="url"
                defaultValue={project?.cover_url ?? ""}
                placeholder="https://…"
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <Field label="Live project URL" error={result?.errors?.live_url}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="live_url"
                type="url"
                defaultValue={project?.live_url ?? ""}
                placeholder="https://…"
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <Field label="Repository URL" error={result?.errors?.github_url}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="github_url"
                type="url"
                defaultValue={project?.github_url ?? ""}
                placeholder="https://github.com/…"
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>
        </div>

        <Field
          label="Gallery image URLs"
          className="mt-5"
          hint="One per line, in display order. Replaces the existing gallery on save."
        >
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              name="image_urls"
              rows={4}
              defaultValue={project?.images.map((image) => image.url).join("\n") ?? ""}
              placeholder="https://…"
              aria-describedby={describedBy}
              disabled={saving}
            />
          )}
        </Field>
      </section>

      {/* ---- Publishing ---- */}
      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Publishing</h2>

        <div className="mt-5 space-y-3.5">
          <Checkbox
            name="published"
            label="Published"
            hint="Visible on the public website."
            defaultChecked={project?.published ?? false}
            disabled={saving}
          />
          <Checkbox
            name="featured"
            label="Featured"
            hint="Also shown in the Selected work section on the homepage."
            defaultChecked={project?.featured ?? false}
            disabled={saving}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? (
            <>
              <Spinner size={17} />
              Saving…
            </>
          ) : (
            <>
              <Icon name="Save" size={17} />
              {isEdit ? "Save project" : "Create project"}
            </>
          )}
        </Button>

        <ButtonLink href="/admin/projects" variant="ghost" size="lg">
          Cancel
        </ButtonLink>

        {project?.published ? (
          <ButtonLink
            href={`/projects/${project.slug}`}
            external
            variant="secondary"
            size="lg"
            className="ml-auto"
          >
            <Icon name="ExternalLink" size={16} />
            View live
          </ButtonLink>
        ) : null}
      </div>
    </form>
  );
}

/** Checkbox with a label and hint, wired for keyboard and screen reader use. */
export function Checkbox({
  name,
  label,
  hint,
  defaultChecked,
  disabled,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  const id = `checkbox-${name}`;
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-hairline-strong bg-surface-2 accent-brand-500"
      />
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-ink-faint">{hint}</span> : null}
      </label>
    </div>
  );
}
