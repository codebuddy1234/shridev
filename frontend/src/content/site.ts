/**
 * Central, editable configuration for ShriDev.
 *
 * Everything in this file is real-world business information. Values that are
 * not yet confirmed are left as `null` and every consumer is written to hide
 * the corresponding UI rather than render a placeholder that looks factual.
 * Replace a `null` with a real value and the site surfaces it automatically.
 *
 * Nothing here should ever contain invented clients, awards, metrics,
 * certifications, office addresses or headcount.
 */

export const siteConfig = {
  name: "ShriDev",
  /** Rendered as two weights in the logo lockup: "Shri" + "Dev". */
  logo: { strong: "Shri", light: "Dev" },
  descriptor: "Software Engineering & AI Solutions",
  statement:
    "We design, build and deploy modern digital products, business applications and AI-powered solutions.",
  supportingLine:
    "Engineering digital products for businesses, startups and ambitious ideas.",
  /**
   * Public base URL. Set NEXT_PUBLIC_SITE_URL in the deployment environment;
   * the localhost fallback only applies during local development.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
  locale: "en_IN",

  /**
   * Contact details. `null` means "not confirmed yet" — the contact page and
   * footer omit the row entirely rather than printing a fake value.
   */
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null,
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? null,
    /** Digits only, international format, e.g. "919876543210". */
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? null,
    /** Free-text locality, e.g. "Pune, Maharashtra, India". */
    location: process.env.NEXT_PUBLIC_LOCATION ?? null,
    /** Shown on the contact page when no street address is published. */
    reach: "Based in India, building for businesses and teams wherever they are.",
  },

  /** Social profiles. Only non-null entries are rendered. */
  social: {
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? null,
    github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB ?? null,
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? null,
    x: process.env.NEXT_PUBLIC_SOCIAL_X ?? null,
  },

  /** Analytics IDs come from the environment; never hardcode them. */
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null,
    googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? null,
    clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? null,
  },

  /**
   * Legal entity details used by Organization JSON-LD. Left null until the
   * registered details are supplied, so the structured data stays truthful.
   */
  legal: {
    registeredName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? null,
    foundingYear: process.env.NEXT_PUBLIC_FOUNDING_YEAR ?? null,
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute URL helper for canonical links, sitemaps and OpenGraph tags. */
export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Social links as a rendered list, skipping anything not configured. */
export function activeSocialLinks() {
  const { social } = siteConfig;
  return (
    [
      { key: "linkedin", label: "LinkedIn", href: social.linkedin },
      { key: "github", label: "GitHub", href: social.github },
      { key: "instagram", label: "Instagram", href: social.instagram },
      { key: "x", label: "X", href: social.x },
    ] as const
  ).filter((entry): entry is typeof entry & { href: string } => Boolean(entry.href));
}

/** WhatsApp deep link, or null when no number is configured. */
export function whatsappLink(message?: string): string | null {
  const number = siteConfig.contact.whatsapp;
  if (!number) return null;
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}
