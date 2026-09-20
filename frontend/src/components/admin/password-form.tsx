"use client";

import { useState } from "react";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/states";
import { changePassword, type ActionResult } from "@/lib/actions/admin";

/** Change the signed-in admin's own password. */
export function PasswordForm() {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setResult(null);

    const form = event.currentTarget;
    const outcome = await changePassword(new FormData(form));

    setResult(outcome);
    setSaving(false);
    if (outcome.ok) form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-hairline bg-surface/40 p-6">
      <h2 className="font-display text-base font-medium text-ink">Change password</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-faint">
        At least 12 characters. Existing sessions elsewhere are not signed out,
        so if you suspect a compromise, change the server&apos;s{" "}
        <code className="font-mono">SECRET_KEY</code> as well — that invalidates
        every issued token.
      </p>

      {result?.message ? (
        <FormMessage
          tone={result.ok ? "success" : "error"}
          title={result.message}
          className="mt-5"
        />
      ) : null}

      <div className="mt-6 max-w-sm space-y-5">
        <Field label="Current password" required error={result?.errors?.current_password}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="current_password"
              type="password"
              autoComplete="current-password"
              required
              aria-describedby={describedBy}
              invalid={invalid}
              disabled={saving}
            />
          )}
        </Field>

        <Field label="New password" required error={result?.errors?.new_password}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="new_password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              aria-describedby={describedBy}
              invalid={invalid}
              disabled={saving}
            />
          )}
        </Field>

        <Field label="Confirm new password" required error={result?.errors?.confirm_password}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              aria-describedby={describedBy}
              invalid={invalid}
              disabled={saving}
            />
          )}
        </Field>
      </div>

      <Button type="submit" className="mt-7" disabled={saving}>
        {saving ? (
          <>
            <Spinner size={16} />
            Updating…
          </>
        ) : (
          <>
            <Icon name="Lock" size={16} />
            Update password
          </>
        )}
      </Button>
    </form>
  );
}
