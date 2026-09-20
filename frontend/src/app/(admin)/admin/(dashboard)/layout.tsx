import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/session";

/**
 * Dashboard layout.
 *
 * `requireAdmin` re-validates the session against the API on every navigation,
 * so a revoked or expired token redirects to sign-in immediately rather than
 * at the next hard refresh.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  return <AdminShell user={user}>{children}</AdminShell>;
}
