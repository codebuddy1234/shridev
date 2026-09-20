import Link from "next/link";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { StatTile } from "@/components/admin/stat-tile";
import { ENQUIRY_STATUSES, StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { formatDateTime } from "@/lib/utils";
import { getAdminEnquiries, getAdminStats } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { AdminStats, Enquiry } from "@/types/api";

export const metadata = { title: "Dashboard" };

/**
 * Dashboard overview.
 *
 * Counts come from a single aggregate endpoint rather than one query per
 * tile. A backend failure renders an error state instead of an error boundary,
 * so the sidebar and navigation stay usable.
 */
export default async function AdminDashboardPage() {
  const { token, user } = await requireAdmin("/admin");

  let stats: AdminStats | null = null;
  let recent: Enquiry[] = [];
  let failed = false;

  try {
    const [statsResult, enquiriesResult] = await Promise.all([
      getAdminStats(token),
      getAdminEnquiries(token, { page_size: 6, sort: "-created_at" }),
    ]);
    stats = statsResult;
    recent = enquiriesResult.items;
  } catch (error) {
    console.error("[admin-dashboard] load failed:", error);
    failed = true;
  }

  const firstName = user.full_name.split(" ")[0];

  return (
    <div className="space-y-8">
      <AdminPageHeading
        title={`Welcome back, ${firstName}`}
        description="Live figures from the database. Nothing on this screen is illustrative."
        actions={
          <>
            <ButtonLink href="/admin/enquiries" size="sm" variant="secondary">
              <Icon name="Inbox" size={15} />
              All Enquiries
            </ButtonLink>
            <ButtonLink href="/admin/projects/new" size="sm">
              <Icon name="Plus" size={15} />
              New Project
            </ButtonLink>
          </>
        }
      />

      {failed || !stats ? (
        <ErrorState
          title="Could not load dashboard data"
          description="The API did not respond. Check that the backend is running and reachable, then reload this page."
          onRetry={
            <ButtonLink href="/admin" size="sm" variant="secondary">
              <Icon name="RefreshCw" size={15} />
              Reload
            </ButtonLink>
          }
        />
      ) : (
        <>
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">
              Key figures
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatTile
                label="Total enquiries"
                value={stats.total_enquiries}
                icon="Inbox"
                href="/admin/enquiries"
                tone="brand"
                hint="Excluding archived"
              />
              <StatTile
                label="New enquiries"
                value={stats.new_enquiries}
                icon="Sparkles"
                href="/admin/enquiries?status=NEW"
                tone="accent"
                hint="Awaiting first contact"
              />
              <StatTile
                label="Active projects"
                value={stats.active_projects}
                icon="Activity"
                href="/admin/enquiries?status=IN_PROGRESS"
                hint="Discovery, proposal or in progress"
              />
              <StatTile
                label="Completed"
                value={stats.completed_projects}
                icon="CheckCircle2"
                href="/admin/enquiries?status=COMPLETED"
                tone="positive"
              />
              <StatTile
                label="Published projects"
                value={stats.published_projects}
                icon="FolderKanban"
                href="/admin/projects"
              />
              <StatTile
                label="Team members"
                value={stats.team_members}
                icon="Users"
                href="/admin/team"
              />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* ---- Recent enquiries ---- */}
            <section
              aria-labelledby="recent-heading"
              className="rounded-card border border-hairline bg-surface/40"
            >
              <div className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-4">
                <h2 id="recent-heading" className="font-display text-base font-medium text-ink">
                  Recent enquiries
                </h2>
                <Link
                  href="/admin/enquiries"
                  className="inline-flex items-center gap-1.5 text-xs text-accent-400 transition-colors hover:text-accent-300"
                >
                  View all
                  <Icon name="ArrowRight" size={13} />
                </Link>
              </div>

              {recent.length === 0 ? (
                <EmptyState
                  className="m-5 border-0"
                  icon="Inbox"
                  title="No enquiries yet"
                  description="Submissions from the Start a Project form appear here as soon as they arrive."
                />
              ) : (
                <ul className="divide-y divide-hairline">
                  {recent.map((enquiry) => (
                    <li key={enquiry.id}>
                      <Link
                        href={`/admin/enquiries/${enquiry.id}`}
                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">
                            {enquiry.name}
                            {enquiry.company ? (
                              <span className="font-normal text-ink-faint"> · {enquiry.company}</span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-ink-muted">
                            {enquiry.service}
                            {enquiry.budget ? ` · ${enquiry.budget}` : ""}
                          </span>
                        </span>
                        <StatusBadge status={enquiry.status} />
                        <span className="hidden shrink-0 text-xs tabular-nums text-ink-faint sm:block">
                          {formatDateTime(enquiry.created_at)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* ---- Pipeline ---- */}
            <section
              aria-labelledby="pipeline-heading"
              className="rounded-card border border-hairline bg-surface/40"
            >
              <div className="border-b border-hairline px-5 py-4">
                <h2 id="pipeline-heading" className="font-display text-base font-medium text-ink">
                  Pipeline
                </h2>
              </div>

              <ul className="divide-y divide-hairline">
                {ENQUIRY_STATUSES.map((entry) => {
                  const count = stats.status_breakdown[entry.value] ?? 0;
                  const share =
                    stats.total_enquiries > 0
                      ? Math.round((count / stats.total_enquiries) * 100)
                      : 0;

                  return (
                    <li key={entry.value} className="px-5 py-3.5">
                      <Link
                        href={`/admin/enquiries?status=${entry.value}`}
                        className="group flex items-center gap-4"
                      >
                        <span className="flex-1 text-sm text-ink-muted transition-colors group-hover:text-ink">
                          {entry.label}
                        </span>

                        {/* Proportion bar — derived from the live counts. */}
                        <span
                          aria-hidden="true"
                          className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.06] sm:block"
                        >
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                            style={{ width: `${share}%` }}
                          />
                        </span>

                        <span className="w-8 text-right text-sm font-medium tabular-nums text-ink">
                          {count}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-hairline px-5 py-4">
                <p className="text-xs leading-relaxed text-ink-faint">
                  {stats.published_posts} published article
                  {stats.published_posts === 1 ? "" : "s"} · {stats.published_projects} published
                  project{stats.published_projects === 1 ? "" : "s"}
                </p>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
