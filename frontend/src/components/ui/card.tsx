import { cn } from "@/lib/utils";

/**
 * Surface primitive.
 *
 * `interactive` adds the shared hover treatment — a hairline that warms toward
 * brand, a slight lift, and a soft glow — so every clickable card on the site
 * behaves identically.
 */
export function Card({
  className,
  interactive,
  as: Component = "div",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean; as?: React.ElementType }) {
  return (
    <Component
      className={cn(
        "relative rounded-card border border-hairline bg-surface/70 backdrop-blur-[2px]",
        interactive && [
          "transition-all duration-300 ease-[var(--ease-out-soft)]",
          "hover:-translate-y-1 hover:border-brand-400/40 hover:bg-surface-2/80",
          "hover:shadow-[0_24px_56px_-28px_rgba(109,93,251,0.55)]",
          "focus-within:border-brand-400/40",
        ],
        className,
      )}
      {...props}
    />
  );
}

/** Icon tile used at the top of service, solution and outcome cards. */
export function IconTile({
  className,
  children,
  tone = "brand",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "brand" | "accent" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border",
        tone === "brand" && "border-brand-400/25 bg-brand-500/10 text-brand-200",
        tone === "accent" && "border-accent-500/25 bg-accent-500/10 text-accent-300",
        tone === "neutral" && "border-hairline bg-white/[0.04] text-ink-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Inset panel used for CTA bands and highlighted callouts inside a section.
 */
export function Panel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-panel border border-hairline bg-surface p-8 sm:p-12",
        className,
      )}
      {...props}
    />
  );
}
