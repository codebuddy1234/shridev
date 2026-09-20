import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium leading-none",
  {
    variants: {
      variant: {
        default: "border border-hairline bg-white/[0.04] text-ink-muted",
        brand: "border border-brand-400/30 bg-brand-500/10 text-brand-200",
        accent: "border border-accent-500/30 bg-accent-500/10 text-accent-300",
        tech: "border border-hairline bg-surface-2 text-ink-muted font-mono tracking-tight",
        positive: "border border-positive/30 bg-positive/10 text-positive",
        warning: "border border-warning/30 bg-warning/10 text-warning",
        danger: "border border-danger/30 bg-danger/10 text-danger",
        info: "border border-info/30 bg-info/10 text-info",
        neutral: "border border-hairline-strong bg-white/[0.06] text-ink-faint",
      },
      size: {
        sm: "px-2 py-1 text-[0.6875rem]",
        md: "px-2.5 py-1.5 text-xs",
        lg: "px-3.5 py-2 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

/** Small uppercase label that sits above a section heading. */
export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-6 bg-accent-500/60" />
      {children}
    </span>
  );
}

export { badgeVariants };
