import { NextResponse } from "next/server";
import { z } from "zod";
import { API_BASE, ApiError, apiRequest } from "@/lib/api";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/**
 * Admin login.
 *
 * Exchanges credentials for a token via the API and stores it in an HttpOnly
 * cookie. The token is never returned to the browser in the response body, so
 * it cannot be read by client-side JavaScript or leaked through XSS.
 */

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid credentials." },
      { status: 422 },
    );
  }

  try {
    const token = await apiRequest<{ access_token: string; expires_in: number }>(
      "/api/auth/login",
      {
        method: "POST",
        body: parsed.data,
        headers: forwardedFor(request),
      },
    );

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      SESSION_COOKIE,
      token.access_token,
      sessionCookieOptions(token.expires_in),
    );
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        // Mirrors the API: identical message whether the account exists or not.
        return NextResponse.json(
          { message: "Incorrect email or password." },
          { status: 401 },
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { message: "Too many attempts. Please wait a few minutes and try again." },
          { status: 429 },
        );
      }
      if (error.status === 422) {
        // The API rejected the credentials as malformed rather than wrong —
        // most often an email on a reserved domain such as .local or .test.
        // Surfacing it as a 502 would send the admin looking for an outage.
        const body = error.body as { errors?: { message: string }[] } | undefined;
        return NextResponse.json(
          {
            message:
              body?.errors?.[0]?.message ??
              "That email address is not in a valid format.",
          },
          { status: 422 },
        );
      }
    }

    console.error("[admin-login] failed:", error);

    // Anything reaching here is an upstream connectivity problem rather than a
    // credential problem — a wrong password returns 401 above. In development
    // we name the address that failed, because "could not reach the service"
    // alone sends people looking for a password fault that does not exist.
    const unreachable =
      error instanceof TypeError || (error as { name?: string })?.name === "AbortError";

    if (unreachable && process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        {
          message:
            `Cannot reach the API at ${API_BASE}. Check that the backend is ` +
            `running (uvicorn app.main:app --port 8000) and that API_URL in ` +
            `frontend/.env.local points at it.`,
        },
        { status: 502 },
      );
    }

    // Production-safe wording: names the likely cause without disclosing the
    // internal API address. Still says enough that the reader stops suspecting
    // their password, which is the wrong trail entirely.
    return NextResponse.json(
      {
        message: unreachable
          ? "The authentication service is not responding. This is a connection problem, not a password problem — check that the backend API is running."
          : "Sign in failed unexpectedly. Please try again.",
      },
      { status: 502 },
    );
  }
}

function forwardedFor(request: Request): Record<string, string> {
  const forwarded =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null;
  return forwarded ? { "X-Forwarded-For": forwarded } : {};
}
