import Link from "next/link";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { EnquiryFilters } from "@/components/admin/enquiry-filters";
import { EnquiryRowActions } from "@/components/admin/enquiry-row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { formatDateTime, truncate } from "@/lib/utils";
import { getAdminEnquiries } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { EnquiryListResponse } from "@/types/api";

export const metadata = { title: "Enquiries" };

/**
 * Lead management.
 *
 * Filtering, search, sorting and pagination are all server-side and expressed
 * in the URL, so the query runs against indexed columns rather than loading
 * every row into the browser to filter it there.
 */
export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await requireAdmin("/admin/enquiries");
  const params = await searchParams;

  const single = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const page = Math.max(1, Number(single("page") ?? 1) || 1);
  const archived = single("archived") === "true";

  let data: EnquiryListResponse | null = null;
  let failed = false;

  try {
    data = await getAdminEnquiries(token, {
      page,
      page_size: 20,
      status: single("status"),
      service: single("service"),
      search: single("search"),
      sort: single("sort") ?? "-created_at",
      archived,
    });
  } catch (error) {
    console.error("[admin-enquiries] load failed:", error);
    failed = true;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title={archived ? "Archived enquiries" : "Enquiries"}
        description={
          archived
            ? "Enquiries removed from the active list. They remain searchable and can be restored."
            : "Every submission from the Start a Project form, newest first."
        }
        actions={
          data ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-2 px-3.5 py-2 text-xs text-ink-muted">
              <Icon name="Inbox" size={14} className="text-accent-400" />
              {data.total} {data.total === 1 ? "record" : "records"}
            </span>
          ) : undefined
        }
      />

      <EnquiryFilters />

      {failed || !data ? (
        <ErrorState
          title="Could not load enquiries"
          description="The API did not respond. Check that the backend is running, then reload."
          onRetry={
            <ButtonLink href="/admin/enquiries" size="sm" variant="secondary">
              <Icon name="RefreshCw" size={15} />
              Reload
            </ButtonLink>
          }
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="Inbox"
          title={archived ? "Nothing archived" : "No enquiries match"}
          description={
            archived
              ? "Archived enquiries will appear here."
              : "Either no enquiries have arrived yet, or no records match the current filters. Try clearing them."
          }
          action={
            <ButtonLink href="/admin/enquiries" size="sm" variant="secondary">
              Clear filters
            </ButtonLink>
          }
        />
      ) : (
        <>
          {/* ---- Desktop table ---- */}
          <div className="hidden overflow-hidden rounded-card border border-hairline bg-surface/40 xl:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Project enquiries, showing client, service, budget, timeline, status and creation
                date
              </caption>
              <thead className="border-b border-hairline text-xs uppercase tracking-[0.1em] text-ink-faint">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-medium">Client</th>
                  <th scope="col" className="px-4 py-3.5 font-medium">Service</th>
                  <th scope="col" className="px-4 py-3.5 font-medium">Budget</th>
                  <th scope="col" className="px-4 py-3.5 font-medium">Timeline</th>
                  <th scope="col" className="px-4 py-3.5 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3.5 font-medium">Created</th>
                  <th scope="col" className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {data.items.map((enquiry) => (
                  <tr key={enquiry.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/enquiries/${enquiry.id}`}
                        className="block max-w-[15rem] font-medium text-ink hover:text-accent-400"
                      >
                        {enquiry.name}
                      </Link>
                      <span className="mt-0.5 block max-w-[15rem] truncate text-xs text-ink-faint">
                        {enquiry.company ? `${enquiry.company} · ` : ""}
                        {enquiry.email}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="default" size="sm">
                        {enquiry.service}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-ink-muted">{enquiry.budget ?? "—"}</td>
                    <td className="px-4 py-4 text-ink-muted">{enquiry.timeline ?? "—"}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={enquiry.status} />
                    </td>
                    <td className="px-4 py-4 text-xs tabular-nums text-ink-faint">
                      {formatDateTime(enquiry.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <EnquiryRowActions enquiry={enquiry} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---- Mobile and tablet cards ---- */}
          <ul className="space-y-3 xl:hidden">
            {data.items.map((enquiry) => (
              <li
                key={enquiry.id}
                className="rounded-card border border-hairline bg-surface/40 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/admin/enquiries/${enquiry.id}`} className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink">{enquiry.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-ink-faint">
                      {enquiry.company ? `${enquiry.company} · ` : ""}
                      {enquiry.email}
                    </span>
                  </Link>
                  <StatusBadge status={enquiry.status} />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {truncate(enquiry.message, 130)}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-ink-faint">Service</dt>
                    <dd className="mt-0.5 text-ink-muted">{enquiry.service}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Budget</dt>
                    <dd className="mt-0.5 text-ink-muted">{enquiry.budget ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Timeline</dt>
                    <dd className="mt-0.5 text-ink-muted">{enquiry.timeline ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Received</dt>
                    <dd className="mt-0.5 tabular-nums text-ink-muted">
                      {formatDateTime(enquiry.created_at)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 border-t border-hairline pt-4">
                  <EnquiryRowActions enquiry={enquiry} />
                </div>
              </li>
            ))}
          </ul>

          {/* ---- Pagination ---- */}
          {data.pages > 1 ? (
            <nav
              aria-label="Enquiry pages"
              className="flex items-center justify-between gap-4 rounded-card border border-hairline bg-surface/40 px-5 py-4"
            >
              <p className="text-xs text-ink-faint">
                Page {data.page} of {data.pages}
              </p>
              <div className="flex gap-2">
                <PageLink params={params} page={data.page - 1} disabled={data.page <= 1}>
                  <Icon name="ChevronLeft" size={15} />
                  Previous
                </PageLink>
                <PageLink
                  params={params}
                  page={data.page + 1}
                  disabled={data.page >= data.pages}
                >
                  Next
                  <Icon name="ChevronRight" size={15} />
                </PageLink>
              </div>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

function PageLink({
  params,
  page,
  disabled,
  children,
}: {
  params: Record<string, string | string[] | undefined>;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    const single = Array.isArray(value) ? value[0] : value;
    if (single) search.set(key, single);
  }
  search.set("page", String(page));

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3.5 py-2 text-xs text-ink-faint opacity-40"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={`/admin/enquiries?${search.toString()}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3.5 py-2 text-xs text-ink-muted transition-colors hover:border-hairline-strong hover:text-ink"
    >
      {children}
    </Link>
  );
}
