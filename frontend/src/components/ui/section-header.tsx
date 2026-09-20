import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** CTA or supporting element rendered beside the heading on wide screens. */
  action?: React.ReactNode;
  align?: "left" | "center";
  /** Heading level — keeps the document outline correct on every page. */
  as?: "h1" | "h2" | "h3";
  className?: string;
  titleClassName?: string;
}

/**
 * The heading block used above every major section: eyebrow, title, support
 * copy and an optional action. Using it everywhere is what keeps the vertical
 * rhythm and type hierarchy consistent across ~25 pages.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  as: Heading = "h2",
  className,
  titleClassName,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6",
        action && !centered && "lg:flex-row lg:items-end lg:justify-between lg:gap-12",
        className,
      )}
    >
      <div className={cn("max-w-3xl", centered && "mx-auto text-center")}>
        {eyebrow ? (
          <Eyebrow className={cn("mb-5", centered && "justify-center")}>{eyebrow}</Eyebrow>
        ) : null}
        <Heading
          className={cn(
            Heading === "h1" ? "text-display-1" : "text-display-2",
            "text-ink",
            titleClassName,
          )}
        >
          {title}
        </Heading>
        {description ? (
          <div
            className={cn(
              "mt-5 text-base leading-relaxed text-ink-muted sm:text-lg",
              centered && "mx-auto",
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      {action ? (
        <div className={cn("shrink-0", centered && "mx-auto")}>{action}</div>
      ) : null}
    </Reveal>
  );
}
