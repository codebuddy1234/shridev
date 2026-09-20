import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/content/site";

/**
 * ShriDev logo lockup.
 *
 * A text-based mark by design, so it stays crisp at any size and can be
 * swapped for a commissioned asset later without touching layout code. The
 * glyph is an abstract build/deploy chevron pair — deliberately geometric and
 * technical rather than decorative.
 */

export function LogoMark({ className, size = 30 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="shridev-mark" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-brand-400)" />
          <stop offset="1" stopColor="var(--color-accent-500)" />
        </linearGradient>
      </defs>
      {/* Rounded container */}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="9"
        stroke="url(#shridev-mark)"
        strokeWidth="1.6"
        opacity="0.55"
      />
      {/* Ascending chevron: source moving forward to production */}
      <path
        d="M10.5 11.5 15 16l-4.5 4.5"
        stroke="url(#shridev-mark)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Baseline: the shipped result */}
      <path
        d="M17 20.5h5"
        stroke="var(--color-accent-500)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  markSize = 30,
  showDescriptor = false,
  href = "/",
}: {
  className?: string;
  markSize?: number;
  showDescriptor?: boolean;
  href?: string | null;
}) {
  const content = (
    <>
      <LogoMark size={markSize} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.3rem] tracking-[-0.03em]">
          <span className="font-bold text-ink">{siteConfig.logo.strong}</span>
          <span className="font-normal text-ink-muted">{siteConfig.logo.light}</span>
        </span>
        {showDescriptor ? (
          <span className="mt-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
            {siteConfig.descriptor}
          </span>
        ) : null}
      </span>
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-2.5 rounded-lg transition-opacity duration-200 hover:opacity-85",
    className,
  );

  if (!href) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link href={href} className={classes} aria-label={`${siteConfig.name} — home`}>
      {content}
    </Link>
  );
}
