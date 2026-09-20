"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/states";
import type { ActionResult } from "@/lib/actions/admin";

/**
 * Publish toggle and delete confirmation, shared by the project, article and
 * team screens.
 *
 * Deletion always goes through a dialog that names the record — these are
 * permanent operations with no undo, so the extra step is the point.
 */
export function RecordActions({
  recordLabel,
  published,
  onTogglePublished,
  onDelete,
  editHref,
  viewHref,
}: {
  recordLabel: string;
  published?: boolean;
  onTogglePublished?: (next: boolean) => Promise<ActionResult>;
  onDelete: () => Promise<ActionResult>;
  editHref?: string;
  viewHref?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function togglePublished() {
    if (!onTogglePublished) return;
    setError(null);
    startTransition(async () => {
      const result = await onTogglePublished(!published);
      if (!result.ok) setError(result.message ?? "Update failed.");
      router.refresh();
    });
  }

  async function confirmDelete() {
    setDeleting(true);
    const result = await onDelete();
    setDeleting(false);
    setConfirmOpen(false);
    if (!result.ok) setError(result.message ?? "Delete failed.");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {error ? (
        <span role="alert" className="mr-1 text-xs text-danger">
          {error}
        </span>
      ) : null}

      {onTogglePublished ? (
        <button
          type="button"
          onClick={togglePublished}
          disabled={pending}
          title={published ? "Unpublish" : "Publish"}
          aria-label={published ? `Unpublish ${recordLabel}` : `Publish ${recordLabel}`}
          className={`inline-flex size-9 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
            published
              ? "border-positive/30 bg-positive/10 text-positive hover:bg-positive/15"
              : "border-hairline text-ink-faint hover:border-hairline-strong hover:text-ink"
          }`}
        >
          {pending ? <Spinner size={14} /> : <Icon name={published ? "Eye" : "EyeOff"} size={15} />}
        </button>
      ) : null}

      {viewHref ? (
        <a
          href={viewHref}
          target="_blank"
          rel="noopener noreferrer"
          title="View on the public site"
          aria-label={`View ${recordLabel} on the public site`}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-hairline-strong hover:text-ink"
        >
          <Icon name="ExternalLink" size={15} />
        </a>
      ) : null}

      {editHref ? (
        <a
          href={editHref}
          title="Edit"
          aria-label={`Edit ${recordLabel}`}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-brand-400/40 hover:text-ink"
        >
          <Icon name="Pencil" size={15} />
        </a>
      ) : null}

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={pending}
        title="Delete"
        aria-label={`Delete ${recordLabel}`}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
      >
        <Icon name="Trash2" size={15} />
      </button>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this record?"
        description="This cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Spinner size={15} />
                  Deleting…
                </>
              ) : (
                <>
                  <Icon name="Trash2" size={15} />
                  Delete permanently
                </>
              )}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          You are about to permanently delete{" "}
          <strong className="text-ink">{recordLabel}</strong>. If you only want to take it off the
          public site, unpublish it instead.
        </p>
      </Modal>
    </div>
  );
}
