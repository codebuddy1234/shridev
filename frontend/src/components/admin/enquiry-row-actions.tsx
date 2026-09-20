"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/states";
import { ENQUIRY_STATUSES } from "@/components/admin/status-badge";
import { deleteEnquiry, setEnquiryArchived, setEnquiryStatus } from "@/lib/actions/admin";
import type { Enquiry } from "@/types/api";

/**
 * Inline row actions: change status, archive or restore, and delete.
 *
 * Status changes apply immediately — they are trivially reversible. Deletion
 * is permanent, so it goes through a confirmation dialog that names the
 * record and says the action cannot be undone.
 */
export function EnquiryRowActions({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function changeStatus(status: string) {
    setError(null);
    startTransition(async () => {
      const result = await setEnquiryStatus(enquiry.id, status);
      if (!result.ok) setError(result.message ?? "Update failed.");
      router.refresh();
    });
  }

  function toggleArchive() {
    setError(null);
    startTransition(async () => {
      const result = await setEnquiryArchived(enquiry.id, !enquiry.archived);
      if (!result.ok) setError(result.message ?? "Update failed.");
      router.refresh();
    });
  }

  async function confirmDelete() {
    setDeleting(true);
    const result = await deleteEnquiry(enquiry.id);
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

      <Select
        value={enquiry.status}
        onChange={(event) => changeStatus(event.target.value)}
        aria-label={`Change status for ${enquiry.name}`}
        disabled={pending}
        className="h-9 w-36 text-xs"
      >
        {ENQUIRY_STATUSES.map((entry) => (
          <option key={entry.value} value={entry.value}>
            {entry.label}
          </option>
        ))}
      </Select>

      <button
        type="button"
        onClick={toggleArchive}
        disabled={pending}
        title={enquiry.archived ? "Restore to the active list" : "Archive"}
        aria-label={enquiry.archived ? `Restore ${enquiry.name}` : `Archive ${enquiry.name}`}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-hairline-strong hover:text-ink disabled:opacity-50"
      >
        {pending ? <Spinner size={14} /> : <Icon name={enquiry.archived ? "RefreshCw" : "Archive"} size={15} />}
      </button>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={pending}
        title="Delete permanently"
        aria-label={`Delete ${enquiry.name} permanently`}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
      >
        <Icon name="Trash2" size={15} />
      </button>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this enquiry?"
        description="This permanently removes the record. It cannot be undone."
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
        <div className="space-y-3 text-sm text-ink-muted">
          <p>
            You are about to delete the enquiry from{" "}
            <strong className="text-ink">{enquiry.name}</strong>
            {enquiry.company ? ` at ${enquiry.company}` : ""} ({enquiry.email}).
          </p>
          <p>
            If you only want it out of the active list, archive it instead —
            archived enquiries stay searchable and can be restored.
          </p>
        </div>
      </Modal>
    </div>
  );
}
