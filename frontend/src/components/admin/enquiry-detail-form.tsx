"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/states";
import { ENQUIRY_STATUSES } from "@/components/admin/status-badge";
import { updateEnquiry, type ActionResult } from "@/lib/actions/admin";
import type { Enquiry } from "@/types/api";

/**
 * Internal fields on an enquiry: status, assignee and notes.
 *
 * The details submitted by the enquirer are deliberately read-only — an
 * internal edit to someone's stated budget or requirement would quietly
 * rewrite the record of what they actually asked for.
 */
export function EnquiryDetailForm({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const outcome = await updateEnquiry(enquiry.id, formData);

    setResult(outcome);
    setSaving(false);
    if (outcome.ok) router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-hairline bg-surface/40 p-6">
      <h2 className="font-display text-base font-medium text-ink">Internal</h2>
      <p className="mt-1 text-xs text-ink-faint">
        Visible only in this dashboard. Never shown to the enquirer.
      </p>

      {result?.message ? (
        <FormMessage
          tone={result.ok ? "success" : "error"}
          title={result.message}
          className="mt-5"
        />
      ) : null}

      <div className="mt-6 space-y-5">
        <Field label="Status">
          {({ id }) => (
            <Select id={id} name="status" defaultValue={enquiry.status} disabled={saving}>
              {ENQUIRY_STATUSES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field
          label="Assigned to"
          hint="Free text — a name or a role."
          error={result?.errors?.assigned_to}
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="assigned_to"
              defaultValue={enquiry.assigned_to ?? ""}
              placeholder="e.g. Technical Lead"
              aria-describedby={describedBy}
              invalid={invalid}
              disabled={saving}
            />
          )}
        </Field>

        <Field
          label="Notes"
          hint="Call summaries, next steps, anything the team needs."
          error={result?.errors?.admin_notes}
        >
          {({ id, describedBy, invalid }) => (
            <Textarea
              id={id}
              name="admin_notes"
              rows={8}
              defaultValue={enquiry.admin_notes ?? ""}
              placeholder="Add a note…"
              aria-describedby={describedBy}
              invalid={invalid}
              disabled={saving}
            />
          )}
        </Field>

        <Field label="Archived">
          {({ id }) => (
            <Select
              id={id}
              name="archived"
              defaultValue={String(enquiry.archived)}
              disabled={saving}
            >
              <option value="false">Active</option>
              <option value="true">Archived</option>
            </Select>
          )}
        </Field>
      </div>

      <Button type="submit" full className="mt-7" disabled={saving}>
        {saving ? (
          <>
            <Spinner size={16} />
            Saving…
          </>
        ) : (
          <>
            <Icon name="Save" size={16} />
            Save changes
          </>
        )}
      </Button>
    </form>
  );
}
