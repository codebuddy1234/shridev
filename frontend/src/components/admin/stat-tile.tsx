import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/**
 * Dashboard metric tile.
 *
 * Every figure shown is a live count from the database — nothing here is a
 * placeholder or an illustrative number.
 */
export function StatTile({
  label,
  value,
  icon,
  href,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: number;
  icon: string;
  href?: string;
  tone?: "neutral" | "brand" | "accent" | "positive";
  hint?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-lg border",
            tone === "brand" && "border-brand-400/25 bg-brand-500/10 text-brand-200",
            tone === "accent" && "border-accent-500/25 bg-accent-500/10 text-accent-300",
            tone === "positive" && "border-positive/25 bg-positive/10 text-positive",
            tone === "neutral" && "border-hairline bg-white/[0.04] text-ink-muted",
          )}
        >
          <Icon name={icon} size={17} />
        </span>
        {href ? (
          <Icon
            name="ArrowUpRight"
            size={15}
            className="text-ink-faint transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        ) : null}
      </div>

      <p className="mt-5 font-display text-3xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-muted">{label}</p>
      {hint ? <p className="mt-2 text-xs text-ink-faint">{hint}</p> : null}
    </>
  );

  const classes = cn(
    "group rounded-card border border-hairline bg-surface/60 p-5 transition-all duration-300",
    href && "hover:-translate-y-0.5 hover:border-brand-400/35",
  );

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
