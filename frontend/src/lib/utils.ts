import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, taught about this project's custom theme.
 *
 * Without this, `cn("text-display-2", "text-ink")` collapses to `text-ink`:
 * tailwind-merge cannot tell a custom font-size token from a custom colour
 * token, so it assumes both belong to the same class group and keeps only the
 * last one. That silently removed the size from every section heading.
 *
 * Registering the custom scales here means each token is classified into the
 * right group, so a size and a colour coexist and a genuine conflict (two
 * sizes) still resolves to the last one.
 */

const brandShades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
const accentShades = ["300", "400", "500", "600", "700"];

const customColors = [
  "canvas",
  "surface",
  "surface-2",
  "surface-3",
  "ink",
  "ink-muted",
  "ink-faint",
  "positive",
  "warning",
  "danger",
  "info",
  "hairline",
  "hairline-strong",
  ...brandShades.map((shade) => `brand-${shade}`),
  ...accentShades.map((shade) => `accent-${shade}`),
];

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      // Matches the --text-* tokens in globals.css.
      text: ["display-1", "display-2", "display-3"],
      // Matches the --color-* tokens.
      color: customColors,
      // Matches the --radius-* tokens.
      radius: ["card", "panel"],
      // Matches the --shadow-* tokens.
      shadow: ["soft", "lift", "glow"],
      // Matches --container-shell.
      container: ["shell"],
    },
  },
});

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date for display, e.g. "12 March 2026". */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Format an ISO timestamp including the time, for admin tables. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Derive initials for avatar placeholders when no photograph exists. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Rough reading time from plain-text body content. */
export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

/** Clamp a string for meta descriptions and card excerpts. */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}
