/**
 * Shared API contract.
 *
 * These types mirror the Pydantic response schemas in `backend/app/schemas`.
 * Changing one side means changing the other — the contract is documented in
 * `docs/api.md`.
 */

export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "DISCOVERY"
  | "PROPOSAL"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CLOSED";

export type ContactMethod = "EMAIL" | "PHONE" | "WHATSAPP" | "ANY";

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string;
  project_type: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  contact_method: ContactMethod;
  referral_source: string | null;
  status: EnquiryStatus;
  assigned_to: string | null;
  admin_notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnquiryListResponse {
  items: Enquiry[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ProjectImage {
  id: number;
  url: string;
  caption: string | null;
  sort_order: number;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  summary: string;
  category: string;
  /** Card image. Null renders the generated abstract placeholder instead. */
  thumbnail_url: string | null;
  cover_url: string | null;
  challenge: string | null;
  solution: string | null;
  features: string[];
  architecture: string | null;
  development_process: string | null;
  /**
   * Outcome narrative. Left null when we have no measured results — the case
   * study then omits the section rather than inventing metrics.
   */
  outcome: string | null;
  technologies: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  images: ProjectImage[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown-subset body, rendered by `lib/markdown.tsx`. */
  content: string;
  category: string;
  cover_url: string | null;
  author_name: string | null;
  tags: string[];
  /**
   * True for seeded example articles. The UI renders a visible notice so
   * demo content is never mistaken for something ShriDev published.
   */
  is_placeholder: boolean;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_enquiries: number;
  new_enquiries: number;
  active_projects: number;
  completed_projects: number;
  published_projects: number;
  team_members: number;
  published_posts: number;
  status_breakdown: Record<EnquiryStatus, number>;
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_superuser: boolean;
  created_at: string;
}

/** Shape of a FastAPI validation failure, surfaced field-by-field in forms. */
export interface ApiErrorBody {
  detail:
    | string
    | { loc: (string | number)[]; msg: string; type: string }[];
}
