import "server-only";
import type {
  AdminStats,
  BlogPost,
  Enquiry,
  EnquiryListResponse,
  Project,
  TeamMember,
} from "@/types/api";

/**
 * Server-side API client for the FastAPI backend.
 *
 * Marked `server-only` so a bundler error is raised if it is ever imported
 * into a client component — the admin token must never reach the browser.
 *
 * Public reads degrade gracefully: if the backend is unreachable the helpers
 * return `null` or an empty list and the calling page renders its empty or
 * error state. A marketing page should not 500 because an API is restarting.
 */

const API_BASE = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);

/** Abort slow upstream calls rather than holding a request open. */
const DEFAULT_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Bearer token for admin endpoints, read from the HttpOnly session cookie. */
  token?: string;
  /** Seconds of ISR caching. Omit for always-fresh (admin) reads. */
  revalidate?: number;
  timeoutMs?: number;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, revalidate, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(revalidate !== undefined ? { next: { revalidate } } : { cache: "no-store" as const }),
    });

    if (!response.ok) {
      let parsed: unknown;
      try {
        parsed = await response.json();
      } catch {
        parsed = await response.text().catch(() => undefined);
      }
      throw new ApiError(
        `Request to ${path} failed with ${response.status}`,
        response.status,
        parsed,
      );
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wraps a public read so an unavailable backend degrades to a fallback value
 * instead of throwing. The failure is logged server-side for diagnosis.
 */
async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[api] ${label} failed:`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

/* ------------------------------------------------------------------ */
/* Public reads                                                        */
/* ------------------------------------------------------------------ */

export function getProjects(params?: { featured?: boolean; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.featured) query.set("featured", "true");
  if (params?.limit) query.set("limit", String(params.limit));
  const suffix = query.toString() ? `?${query}` : "";

  return safe<Project[]>(
    "getProjects",
    () => apiRequest<Project[]>(`/api/projects${suffix}`, { revalidate: 60 }),
    [],
  );
}

export function getProject(slug: string) {
  return safe<Project | null>(
    `getProject(${slug})`,
    () => apiRequest<Project>(`/api/projects/${encodeURIComponent(slug)}`, { revalidate: 60 }),
    null,
  );
}

export function getPosts(params?: { category?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.limit) query.set("limit", String(params.limit));
  const suffix = query.toString() ? `?${query}` : "";

  return safe<BlogPost[]>(
    "getPosts",
    () => apiRequest<BlogPost[]>(`/api/posts${suffix}`, { revalidate: 120 }),
    [],
  );
}

export function getPost(slug: string) {
  return safe<BlogPost | null>(
    `getPost(${slug})`,
    () => apiRequest<BlogPost>(`/api/posts/${encodeURIComponent(slug)}`, { revalidate: 120 }),
    null,
  );
}

export function getTeam() {
  return safe<TeamMember[]>(
    "getTeam",
    () => apiRequest<TeamMember[]>("/api/team", { revalidate: 300 }),
    [],
  );
}

/* ------------------------------------------------------------------ */
/* Admin reads — always fresh, always authenticated                    */
/* ------------------------------------------------------------------ */

export function getAdminStats(token: string) {
  return apiRequest<AdminStats>("/api/admin/stats", { token });
}

export function getAdminEnquiries(
  token: string,
  params: {
    page?: number;
    page_size?: number;
    status?: string;
    service?: string;
    search?: string;
    archived?: boolean;
    sort?: string;
  } = {},
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const suffix = query.toString() ? `?${query}` : "";
  return apiRequest<EnquiryListResponse>(`/api/enquiries${suffix}`, { token });
}

export function getAdminEnquiry(token: string, id: number) {
  return apiRequest<Enquiry>(`/api/enquiries/${id}`, { token });
}

export function getAdminProjects(token: string) {
  return apiRequest<Project[]>("/api/projects?include_unpublished=true", { token });
}

export function getAdminTeam(token: string) {
  return apiRequest<TeamMember[]>("/api/team?include_unpublished=true", { token });
}

export function getAdminPosts(token: string) {
  return apiRequest<BlogPost[]>("/api/posts?include_unpublished=true", { token });
}

export { API_BASE };
