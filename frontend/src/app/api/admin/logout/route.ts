import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/**
 * Admin logout.
 *
 * POST only, so the session cannot be ended by a link or an embedded image
 * pointing at this route.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  // maxAge 0 expires the cookie immediately.
  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return response;
}
