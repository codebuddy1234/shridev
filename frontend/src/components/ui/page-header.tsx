import Link from "next/link";
import { Shell } from "@/components/ui/shell";
import { Eyebrow } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Standard page header for every interior route.
 *
 * Carries the H1, breadcrumb trail and optional actions, so the top of each
 * page is structurally identical and the heading hierarchy stays predictable.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14", className)}>
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 -z-10"
        style={{
          maskImage: "radial-gradient(60% 70% at 30% 0%, black, transparent)",
          WebkitMaskImage: "radial-gradient(60% 70% at 30% 0%, black, transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/4 -z-10 h-80 w-[40rem] rounded-full opacity-50 blur-[110px]"
        style={{
          background: "radial-gradient(50% 50% at 50% 50%, rgba(109,93,251,0.22), transparent 70%)",
        }}
      />

      <Shell>
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
              <li>
                <Link href="/" className="transition-colors hover:text-ink-muted">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <li key={crumb.label} className="flex items-center gap-1.5">
                    <Icon name="ChevronRight" size={12} className="opacity-50" />
                    {crumb.href && !isLast ? (
                      <Link href={crumb.href} className="transition-colors hover:text-ink-muted">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span aria-current={isLast ? "page" : undefined} className="text-ink-muted">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16">
          <div className="max-w-3xl">
            {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
            <Reveal>
              <h1 className="text-display-1 text-ink">{title}</h1>
            </Reveal>
            {description ? (
              <Reveal delay={0.06}>
                <div className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
                  {description}
                </div>
              </Reveal>
            ) : null}
            {actions ? (
              <Reveal delay={0.12}>
                <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
              </Reveal>
            ) : null}
          </div>

          {children ? (
            <Reveal delay={0.1} className="lg:justify-self-end">
              {children}
            </Reveal>
          ) : null}
        </div>
      </Shell>
    </section>
  );
}
