"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { Input, Select } from "@/components/ui/field";
import { Spinner } from "@/components/ui/states";
import { ENQUIRY_STATUSES } from "@/components/admin/status-badge";
import { serviceEnquiryOptions } from "@/content/services";

/**
 * Lead list controls.
 *
 * Filter state lives in the URL, so a filtered view is bookmarkable and the
 * browser back button behaves as expected. Search is debounced to avoid a
 * request per keystroke.
 */
export function EnquiryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const status = searchParams.get("status") ?? "";
  const service = searchParams.get("service") ?? "";
  const sort = searchParams.get("sort") ?? "-created_at";
  const archived = searchParams.get("archived") === "true";

  function apply(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    // Any filter change invalidates the current page number.
    params.delete("page");
    startTransition(() => router.push(`/admin/enquiries?${params.toString()}`));
  }

  // Debounce search so typing does not fire a request per character.
  useEffect(() => {
    if (search === (searchParams.get("search") ?? "")) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => apply({ search: search || null }), 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // `apply` closes over the current params, which is the intent here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters = Boolean(status || service || searchParams.get("search") || archived);

  return (
    <div className="flex flex-col gap-3 rounded-card border border-hairline bg-surface/40 p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1 lg:max-w-xs">
        <Icon
          name="Search"
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, company…"
          aria-label="Search enquiries"
          className="h-10 pl-10 text-sm"
        />
        {pending ? (
          <Spinner size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
        <Select
          value={status}
          onChange={(event) => apply({ status: event.target.value })}
          aria-label="Filter by status"
          className="h-10 text-sm lg:w-40"
        >
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </Select>

        <Select
          value={service}
          onChange={(event) => apply({ service: event.target.value })}
          aria-label="Filter by service"
          className="h-10 text-sm lg:w-44"
        >
          <option value="">All services</option>
          {serviceEnquiryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          value={sort}
          onChange={(event) => apply({ sort: event.target.value })}
          aria-label="Sort enquiries"
          className="h-10 text-sm lg:w-40"
        >
          <option value="-created_at">Newest first</option>
          <option value="created_at">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="-name">Name Z–A</option>
          <option value="status">Status</option>
        </Select>
      </div>

      <div className="flex items-center gap-2 lg:ml-auto">
        <button
          type="button"
          onClick={() => apply({ archived: archived ? null : "true" })}
          aria-pressed={archived}
          className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm transition-colors ${
            archived
              ? "border-brand-400/40 bg-brand-500/10 text-ink"
              : "border-hairline-strong text-ink-muted hover:text-ink"
          }`}
        >
          <Icon name="Archive" size={15} />
          Archived
        </button>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              startTransition(() => router.push("/admin/enquiries"));
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm text-ink-faint transition-colors hover:text-ink"
          >
            <Icon name="X" size={14} />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
