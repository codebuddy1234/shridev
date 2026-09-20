import { NextResponse } from "next/server";
import { ApiError, apiRequest } from "@/lib/api";
import { collectErrors, enquirySchema } from "@/lib/enquiry-schema";
import type { EnquiryErrors } from "@/lib/enquiry-schema";

/**
 * Enquiry submission proxy.
 *
 * The browser posts here rather than directly to FastAPI, which means:
 *   - the API's location stays server-side (no NEXT_PUBLIC_ URL, no CORS
 *     preflight from the public form),
 *   - validation failures from either layer are normalised into one shape the
 *     form can map onto its inputs,
 *   - the upstream rate-limit response is passed through with Retry-After.
 *
 * The backend independently revalidates everything; the check here is for
 * feedback quality, not security.
 */

interface UpstreamValidationError {
  detail?: string;
  errors?: { field: string; message: string }[];
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "We could not read that submission. Please try again." },
      { status: 400 },
    );
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please correct the highlighted fields.", errors: collectErrors(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const result = await apiRequest<{ id: number; reference: string; message: string }>(
      "/api/enquiries",
      {
        method: "POST",
        body: parsed.data,
        // Pass the caller's address through so the backend rate-limits the
        // real client rather than this server's own IP.
        headers: forwardedFor(request),
      },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return NextResponse.json(
          {
            message:
              "You have sent several enquiries in a short time. Please wait a few minutes and try again.",
          },
          { status: 429 },
        );
      }

      if (error.status === 422) {
        const body = error.body as UpstreamValidationError | undefined;
        const errors: EnquiryErrors = {};
        for (const item of body?.errors ?? []) {
          const field = item.field as keyof EnquiryErrors;
          if (field && !errors[field]) errors[field] = item.message;
        }
        return NextResponse.json(
          { message: "Please correct the highlighted fields.", errors },
          { status: 422 },
        );
      }
    }

    // Log the detail server-side; the visitor gets a message they can act on.
    console.error("[enquiries] submission failed:", error);
    return NextResponse.json(
      {
        message:
          "We could not submit the enquiry right now. Please try again in a moment, or contact us directly.",
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
