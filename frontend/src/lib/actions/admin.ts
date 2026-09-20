"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiError, apiRequest } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

/**
 * Admin mutations, implemented as Server Actions.
 *
 * Each action re-checks the session on the server before doing anything — the
 * client cannot call these with a token of its own choosing, and the bearer
 * token is read from the HttpOnly cookie rather than passed in. The API
 * enforces authorisation again on the other side, so a bug here still cannot
 * grant unauthorised access.
 *
 * Every action returns a serialisable `ActionResult` rather than throwing, so
 * forms can render an inline error instead of hitting an error boundary.
 */

export interface ActionResult {
  ok: boolean;
  message?: string;
  /** Field-level messages, keyed by input name. */
  errors?: Record<string, string>;
}

interface UpstreamValidationBody {
  detail?: string;
  errors?: { field: string; message: string }[];
}

/** Normalise any failure into a result the UI can render. */
function toResult(error: unknown, fallback: string): ActionResult {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      const body = error.body as UpstreamValidationBody | undefined;
      const errors: Record<string, string> = {};
      for (const item of body?.errors ?? []) {
        if (item.field && !errors[item.field]) errors[item.field] = item.message;
      }
      return {
        ok: false,
        message: "Please correct the highlighted fields.",
        errors: Object.keys(errors).length ? errors : undefined,
      };
    }
    if (error.status === 409) {
      return { ok: false, message: "That conflicts with an existing record." };
    }
    if (error.status === 404) {
      return { ok: false, message: "That record no longer exists." };
    }
    if (error.status === 401) {
      return { ok: false, message: "Your session has expired. Sign in again." };
    }
  }

  console.error("[admin-action]", error);
  return { ok: false, message: fallback };
}

/** Parse a form value into a string array, one item per line. */
function linesToArray(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Read an optional text field, treating blank as absent. */
function optional(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

/* ====================================================================== */
/* Enquiries                                                              */
/* ====================================================================== */

const enquiryUpdateSchema = z.object({
  status: z
    .enum(["NEW", "CONTACTED", "DISCOVERY", "PROPOSAL", "IN_PROGRESS", "COMPLETED", "CLOSED"])
    .optional(),
  assigned_to: z.string().max(160).nullable().optional(),
  admin_notes: z.string().max(8000).nullable().optional(),
  archived: z.boolean().optional(),
});

export async function updateEnquiry(id: number, formData: FormData): Promise<ActionResult> {
  const { token } = await requireAdmin();

  const raw: Record<string, unknown> = {};
  if (formData.has("status")) raw.status = formData.get("status");
  if (formData.has("assigned_to")) raw.assigned_to = optional(formData.get("assigned_to"));
  if (formData.has("admin_notes")) raw.admin_notes = optional(formData.get("admin_notes"));
  if (formData.has("archived")) raw.archived = formData.get("archived") === "true";

  const parsed = enquiryUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "Those values are not valid." };
  }

  try {
    await apiRequest(`/api/enquiries/${id}`, {
      method: "PATCH",
      body: parsed.data,
      token,
    });
    revalidatePath("/admin/enquiries");
    revalidatePath(`/admin/enquiries/${id}`);
    revalidatePath("/admin");
    return { ok: true, message: "Enquiry updated." };
  } catch (error) {
    return toResult(error, "Could not update the enquiry. Please try again.");
  }
}

export async function setEnquiryStatus(id: number, status: string): Promise<ActionResult> {
  const formData = new FormData();
  formData.set("status", status);
  return updateEnquiry(id, formData);
}

export async function setEnquiryArchived(id: number, archived: boolean): Promise<ActionResult> {
  const formData = new FormData();
  formData.set("archived", String(archived));
  return updateEnquiry(id, formData);
}

export async function deleteEnquiry(id: number): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    await apiRequest(`/api/enquiries/${id}`, { method: "DELETE", token });
    revalidatePath("/admin/enquiries");
    revalidatePath("/admin");
    return { ok: true, message: "Enquiry deleted." };
  } catch (error) {
    return toResult(error, "Could not delete the enquiry. Please try again.");
  }
}

/* ====================================================================== */
/* Projects                                                               */
/* ====================================================================== */

/** Build the project payload from the admin form. */
function projectPayload(formData: FormData) {
  const imageUrls = linesToArray(formData.get("image_urls"));

  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: optional(formData.get("slug")) ?? undefined,
    summary: String(formData.get("summary") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    thumbnail_url: optional(formData.get("thumbnail_url")),
    cover_url: optional(formData.get("cover_url")),
    challenge: optional(formData.get("challenge")),
    solution: optional(formData.get("solution")),
    architecture: optional(formData.get("architecture")),
    development_process: optional(formData.get("development_process")),
    outcome: optional(formData.get("outcome")),
    features: linesToArray(formData.get("features")),
    technologies: linesToArray(formData.get("technologies")),
    live_url: optional(formData.get("live_url")),
    github_url: optional(formData.get("github_url")),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    images: imageUrls.map((url, index) => ({ url, caption: null, sort_order: index })),
  };
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    const project = await apiRequest<{ slug: string }>("/api/projects", {
      method: "POST",
      body: projectPayload(formData),
      token,
    });
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    return { ok: true, message: `Project "${project.slug}" created.` };
  } catch (error) {
    return toResult(error, "Could not create the project. Please try again.");
  }
}

export async function updateProject(id: number, formData: FormData): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    const project = await apiRequest<{ slug: string }>(`/api/projects/${id}`, {
      method: "PATCH",
      body: projectPayload(formData),
      token,
    });
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    revalidatePath("/");
    return { ok: true, message: "Project saved." };
  } catch (error) {
    return toResult(error, "Could not save the project. Please try again.");
  }
}

export async function toggleProjectPublished(
  id: number,
  published: boolean,
): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    await apiRequest(`/api/projects/${id}`, { method: "PATCH", body: { published }, token });
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    return { ok: true, message: published ? "Project published." : "Project unpublished." };
  } catch (error) {
    return toResult(error, "Could not change the publish state.");
  }
}

export async function deleteProject(id: number): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    await apiRequest(`/api/projects/${id}`, { method: "DELETE", token });
    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");
    return { ok: true, message: "Project deleted." };
  } catch (error) {
    return toResult(error, "Could not delete the project.");
  }
}

/* ====================================================================== */
/* Team                                                                   */
/* ====================================================================== */

function teamPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    bio: optional(formData.get("bio")),
    photo_url: optional(formData.get("photo_url")),
    github_url: optional(formData.get("github_url")),
    linkedin_url: optional(formData.get("linkedin_url")),
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    published: formData.get("published") === "on",
  };
}

export async function createTeamMember(formData: FormData): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    await apiRequest("/api/team", { method: "POST", body: teamPayload(formData), token });
    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { ok: true, message: "Team member added." };
  } catch (error) {
    return toResult(error, "Could not add the team member.");
  }
}

export async function updateTeamMember(id: number, formData: FormData): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    await apiRequest(`/api/team/${id}`, { method: "PATCH", body: teamPayload(formData), token });
    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { ok: true, message: "Team member saved." };
  } catch (error) {
    return toResult(error, "Could not save the team member.");
  }
}

export async function deleteTeamMember(id: number): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    await apiRequest(`/api/team/${id}`, { method: "DELETE", token });
    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { ok: true, message: "Team member removed." };
  } catch (error) {
    return toResult(error, "Could not remove the team member.");
  }
}

/* ====================================================================== */
/* Insights                                                               */
/* ====================================================================== */

function postPayload(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: optional(formData.get("slug")) ?? undefined,
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    cover_url: optional(formData.get("cover_url")),
    author_name: optional(formData.get("author_name")),
    tags: linesToArray(formData.get("tags")),
    is_placeholder: formData.get("is_placeholder") === "on",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  };
}

export async function createPost(formData: FormData): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    await apiRequest("/api/posts", { method: "POST", body: postPayload(formData), token });
    revalidatePath("/admin/posts");
    revalidatePath("/insights");
    return { ok: true, message: "Article created." };
  } catch (error) {
    return toResult(error, "Could not create the article.");
  }
}

export async function updatePost(id: number, formData: FormData): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    const post = await apiRequest<{ slug: string }>(`/api/posts/${id}`, {
      method: "PATCH",
      body: postPayload(formData),
      token,
    });
    revalidatePath("/admin/posts");
    revalidatePath("/insights");
    revalidatePath(`/insights/${post.slug}`);
    return { ok: true, message: "Article saved." };
  } catch (error) {
    return toResult(error, "Could not save the article.");
  }
}

export async function togglePostPublished(id: number, published: boolean): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    await apiRequest(`/api/posts/${id}`, { method: "PATCH", body: { published }, token });
    revalidatePath("/admin/posts");
    revalidatePath("/insights");
    return { ok: true, message: published ? "Article published." : "Article unpublished." };
  } catch (error) {
    return toResult(error, "Could not change the publish state.");
  }
}

export async function deletePost(id: number): Promise<ActionResult> {
  const { token } = await requireAdmin();
  try {
    await apiRequest(`/api/posts/${id}`, { method: "DELETE", token });
    revalidatePath("/admin/posts");
    revalidatePath("/insights");
    return { ok: true, message: "Article deleted." };
  } catch (error) {
    return toResult(error, "Could not delete the article.");
  }
}

/* ====================================================================== */
/* Account                                                                */
/* ====================================================================== */

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const { token } = await requireAdmin();

  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (next !== confirm) {
    return { ok: false, errors: { confirm_password: "The passwords do not match." } };
  }
  if (next.length < 12) {
    return { ok: false, errors: { new_password: "Use at least 12 characters." } };
  }
  // bcrypt silently truncates beyond 72 bytes, so the limit is enforced here
  // as well as on the server.
  if (new TextEncoder().encode(next).length > 72) {
    return { ok: false, errors: { new_password: "Must be at most 72 bytes." } };
  }

  try {
    await apiRequest("/api/auth/change-password", {
      method: "POST",
      body: { current_password: current, new_password: next },
      token,
    });
    return { ok: true, message: "Password updated." };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { ok: false, errors: { current_password: "Current password is incorrect." } };
    }
    return toResult(error, "Could not update the password.");
  }
}
