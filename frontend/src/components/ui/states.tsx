import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";

/**
 * Shared loading, empty and error states.
 *
 * Every data-backed surface on the site renders one of these rather than a
 * blank area, so a slow API or an unpopulated table is always explained.
 */

export function Spinner({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <Icon
      name="Loader2"
      size={size}
      className={cn("animate-spin motion-reduce:animate-none", className)}
    />
  );
}

export function LoadingState({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center gap-3 py-16 text-sm text-ink-muted", className)}
    >
      <Spinner />
      {label}
    </div>
  );
}

/** Shimmer placeholder for card and table skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/[0.05] motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function EmptyState({
  icon = "Inbox",
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-hairline-strong px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full border border-hairline bg-white/[0.03] text-ink-faint">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this content. Please try again in a moment.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-danger/25 bg-danger/[0.06] px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full border border-danger/30 bg-danger/10 text-danger">
        <Icon name="AlertCircle" size={22} />
      </span>
      <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{description}</p>
      {onRetry ? (
        <div className="mt-6">{onRetry}</div>
      ) : (
        <div className="mt-6">
          <ButtonLink href="/contact" variant="secondary" size="sm">
            Contact us
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
