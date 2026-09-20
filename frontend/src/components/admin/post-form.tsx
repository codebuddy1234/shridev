"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/states";
import { Checkbox } from "@/components/admin/project-form";
import { createPost, updatePost, type ActionResult } from "@/lib/actions/admin";
import type { BlogPost } from "@/types/api";

const categories = [
  "AI",
  "Web Development",
  "Software Engineering",
  "Data",
  "Business Technology",
  "Tutorials",
  "Company News",
];

/** Article editor. Body content is Markdown, rendered safely as React nodes. */
export function PostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  const isEdit = Boolean(post);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const outcome = post ? await updatePost(post.id, formData) : await createPost(formData);

    setResult(outcome);
    setSaving(false);

    if (outcome.ok) {
      router.refresh();
      if (!isEdit) router.push("/admin/posts");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {result?.message ? (
        <FormMessage tone={result.ok ? "success" : "error"} title={result.message} />
      ) : null}

      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Article</h2>

        <div className="mt-6 space-y-5">
          <Field label="Title" required error={result?.errors?.title}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="title"
                defaultValue={post?.title}
                required
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Slug" hint="Generated from the title when blank.">
              {({ id }) => (
                <Input id={id} name="slug" defaultValue={post?.slug} disabled={saving} />
              )}
            </Field>

            <Field label="Category" required error={result?.errors?.category}>
              {({ id, describedBy, invalid }) => (
                <Select
                  id={id}
                  name="category"
                  defaultValue={post?.category ?? categories[0]}
                  required
                  aria-describedby={describedBy}
                  invalid={invalid}
                  disabled={saving}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field
            label="Excerpt"
            required
            hint="One or two sentences. Used on cards and as the meta description."
            error={result?.errors?.excerpt}
          >
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                name="excerpt"
                rows={3}
                defaultValue={post?.excerpt}
                required
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>

          <Field
            label="Content"
            required
            hint="Markdown: ## headings, lists, **bold**, `code`, > quotes and links."
            error={result?.errors?.content}
          >
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                name="content"
                rows={20}
                defaultValue={post?.content}
                required
                className="font-mono text-sm"
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>
        </div>
      </section>

      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Metadata</h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Author name" hint="Leave blank to attribute to ShriDev.">
            {({ id }) => (
              <Input
                id={id}
                name="author_name"
                defaultValue={post?.author_name ?? ""}
                disabled={saving}
              />
            )}
          </Field>

          <Field label="Cover image URL" error={result?.errors?.cover_url}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                name="cover_url"
                type="url"
                defaultValue={post?.cover_url ?? ""}
                aria-describedby={describedBy}
                invalid={invalid}
                disabled={saving}
              />
            )}
          </Field>
        </div>

        <Field label="Tags" className="mt-5" hint="One per line.">
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              name="tags"
              rows={4}
              defaultValue={post?.tags.join("\n") ?? ""}
              aria-describedby={describedBy}
              disabled={saving}
            />
          )}
        </Field>
      </section>

      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Publishing</h2>

        <div className="mt-5 space-y-3.5">
          <Checkbox
            name="published"
            label="Published"
            hint="Visible on the public insights page."
            defaultChecked={post?.published ?? false}
            disabled={saving}
          />
          <Checkbox
            name="featured"
            label="Featured"
            defaultChecked={post?.featured ?? false}
            disabled={saving}
          />
          <Checkbox
            name="is_placeholder"
            label="Mark as example content"
            hint="Adds a visible notice on the article and excludes it from search indexing. Use this for demo content so it cannot be mistaken for ShriDev editorial."
            defaultChecked={post?.is_placeholder ?? false}
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
              {isEdit ? "Save article" : "Create article"}
            </>
          )}
        </Button>

        <ButtonLink href="/admin/posts" variant="ghost" size="lg">
          Cancel
        </ButtonLink>

        {post?.published ? (
          <ButtonLink
            href={`/insights/${post.slug}`}
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
