import type { Metadata } from "next";

/**
 * Admin route group.
 *
 * Renders without the public navbar or footer, and marks every page under it
 * as non-indexable. The middleware sets the matching X-Robots-Tag header, so
 * the exclusion holds even for responses a crawler reaches directly.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-canvas">{children}</div>;
}
