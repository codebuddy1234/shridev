import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin route protection.
 *
 * This is a redirect for user experience, not the security boundary: it only
 * checks that a session cookie is present, so an unauthenticated visitor lands
 * on the login screen rather than a broken page.
 *
 * The real authorisation happens on every API call — FastAPI validates the
 * token signature and expiry and re-reads the account from the database. A
 * forged cookie gets past this middleware and then fails at the API, which is
 * where it matters.
 */

const SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "shridev_admin_session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isLoginRoute = pathname === "/admin/login";
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && !isLoginRoute) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();
  // The admin interface must never be indexed or framed.
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
