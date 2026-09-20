import { AdminPageHeading } from "@/components/admin/page-heading";
import { PasswordForm } from "@/components/admin/password-form";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatDateTime } from "@/lib/utils";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Account" };

export default async function AdminAccountPage() {
  const { user } = await requireAdmin("/admin/account");

  return (
    <div className="max-w-3xl space-y-6">
      <AdminPageHeading title="Account" description="Your admin account and security settings." />

      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Details</h2>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Name
            </dt>
            <dd className="mt-1.5 text-sm text-ink-muted">{user.full_name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Email
            </dt>
            <dd className="mt-1.5 text-sm text-ink-muted">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Role
            </dt>
            <dd className="mt-1.5">
              <Badge variant={user.is_superuser ? "brand" : "default"} size="sm">
                {user.is_superuser ? "Superuser" : "Administrator"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Created
            </dt>
            <dd className="mt-1.5 text-sm tabular-nums text-ink-muted">
              {formatDateTime(user.created_at)}
            </dd>
          </div>
        </dl>
      </section>

      <PasswordForm />

      <section className="rounded-card border border-hairline bg-surface/40 p-6">
        <h2 className="font-display text-base font-medium text-ink">Managing accounts</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          There is no self-service registration — admin accounts are created on
          the server, deliberately, so the dashboard cannot be opened up by
          someone who reaches the login page.
        </p>

        <pre className="mt-5 overflow-x-auto rounded-xl border border-hairline bg-canvas p-4 font-mono text-xs leading-relaxed text-ink-muted">
          <code>{`cd backend
python -m scripts.create_admin --email colleague@shridev.com --name "Full Name"`}</code>
        </pre>

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-faint">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          The script prompts for the password without echoing it, so it never
          reaches your shell history or the process list. Running it for an
          existing email resets that account&apos;s password.
        </p>
      </section>
    </div>
  );
}
