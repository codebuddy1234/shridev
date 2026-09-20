import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import type { AdminUser } from "@/types/api";

/**
 * Admin session handling.
 *
 * The access token is held in an HttpOnly cookie set by a route handler, so it
 * is never readable from JavaScript and never serialised into the page. Admin
 * pages are Server Components that read the cookie and call the API on the
 * server; the browser never sees or sends the bearer token itself.
 *
 * The cookie is the transport. Authorisation itself is enforced by FastAPI on
 * every request — the middleware redirect and the checks here are convenience,
 * not the security boundary.
 */

export const SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "shridev_admin_session";

/** Read the raw token, or null when there is no session cookie. */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Resolve the signed-in admin by validating the token against the API.
 * Returns null for no session, an expired token or a deactivated account.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    return await apiRequest<AdminUser>("/api/auth/me", { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    // A backend outage should not silently log the admin out, but it also
    // cannot be treated as a valid session.
    console.error("[session] could not validate session:", error);
    return null;
  }
}

/**
 * Guard for admin pages and server actions. Redirects to the login screen,
 * preserving the requested path so the admin lands where they intended.
 */
export async function requireAdmin(returnTo?: string): Promise<{
  token: string;
  user: AdminUser;
}> {
  const token = await getSessionToken();
  const user = token ? await getCurrentAdmin() : null;

  if (!token || !user) {
    const target = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
    redirect(`/admin/login${target}`);
  }

  return { token, user };
}

/** Cookie attributes. Secure is enabled outside development only so the
 *  cookie still works over plain HTTP on localhost. */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
