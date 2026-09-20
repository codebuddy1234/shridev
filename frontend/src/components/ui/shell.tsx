import { cn } from "@/lib/utils";

/**
 * Page container. Every full-width section places its content inside a Shell
 * so the measure and gutters stay identical site-wide.
 */
export function Shell({
  className,
  as: Component = "div",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { as?: React.ElementType }) {
  return <Component className={cn("shell", className)} {...props} />;
}

/** Full-width band with the standard vertical rhythm. */
export function Section({
  className,
  tight,
  as: Component = "section",
  ...props
}: React.HTMLAttributes<HTMLElement> & { tight?: boolean; as?: React.ElementType }) {
  return <Component className={cn(tight ? "section-tight" : "section", className)} {...props} />;
}

/** Thin gradient rule used to separate major bands. */
export function Divider({ className }: { className?: string }) {
  return <div role="presentation" className={cn("rule-glow", className)} />;
}
