"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Field, FormMessage, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/states";

/**
 * Admin sign-in form.
 *
 * Posts to a route handler which sets an HttpOnly cookie; the token itself
 * never reaches this component. `next` is validated as a site-relative admin
 * path before redirecting, so the parameter cannot be used as an open
 * redirect to an external site.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function safeRedirectTarget(): string {
    const next = searchParams.get("next");
    // Only same-site admin paths. Rejects "//evil.com" and "https://evil.com".
    if (next && /^\/admin(\/|$)/.test(next) && !next.startsWith("//")) {
      return next;
    }
    return "/admin";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.message ?? "Sign in failed. Please try again.");
        setSubmitting(false);
        return;
      }

      router.replace(safeRedirectTarget());
      // Server Components must re-render with the new session cookie.
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 rounded-panel border border-hairline bg-surface/70 p-7"
    >
      {error ? <FormMessage tone="error" title={error} className="mb-6" /> : null}

      <div className="space-y-5">
        <Field label="Email" required>
          {({ id }) => (
            <Input
              id={id}
              name="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              placeholder="you@shridev.com"
              disabled={submitting}
            />
          )}
        </Field>

        <Field label="Password" required>
          {({ id }) => (
            <div className="relative">
              <Input
                id={id}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="••••••••••••"
                className="pr-11"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
              </button>
            </div>
          )}
        </Field>
      </div>

      <Button type="submit" full size="lg" className="mt-8" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner size={17} />
            Signing in…
          </>
        ) : (
          <>
            Sign In
            <Icon name="ArrowRight" size={17} className="btn-arrow" />
          </>
        )}
      </Button>

      <p className="mt-6 text-center text-xs leading-relaxed text-ink-faint">
        Accounts are created from the server with{" "}
        <code className="font-mono text-ink-muted">scripts/create_admin.py</code>.
        There is no self-service registration.
      </p>

      <Link
        href="/"
        className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink-muted"
      >
        <Icon name="ArrowLeft" size={12} />
        Back to the website
      </Link>
    </form>
  );
}
