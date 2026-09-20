import { Section, Shell } from "@/components/ui/shell";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";

/**
 * Closing call to action.
 *
 * One primary action and one supporting link — never a row of competing
 * buttons. Reused at the foot of most pages with a tailored heading.
 */
export function CtaBand({
  title = "Let's build something useful.",
  description = "Tell us about the idea, the business requirement or the system you already have. We will review it and come back with an honest view of what the work involves.",
  primaryLabel = "Start a Project",
  primaryHref = "/start-project",
  secondaryLabel = "Contact ShriDev",
  secondaryHref = "/contact",
}: {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Section tight className="relative">
      <Shell>
        <Reveal className="relative overflow-hidden rounded-panel border border-hairline-strong bg-surface p-8 sm:p-12 lg:p-16">
          {/* Brand wash and grid, kept low-contrast so the copy stays dominant. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 120% at 12% 10%, rgba(109,93,251,0.22), transparent 62%), radial-gradient(60% 110% at 92% 90%, rgba(34,211,197,0.14), transparent 60%)",
            }}
          />
          <div
            aria-hidden="true"
            className="bg-grid pointer-events-none absolute inset-0 opacity-50"
            style={{
              maskImage: "radial-gradient(70% 80% at 50% 50%, black, transparent)",
              WebkitMaskImage: "radial-gradient(70% 80% at 50% 50%, black, transparent)",
            }}
          />

          <div className="relative max-w-2xl">
            <h2 className="text-display-3 text-ink">{title}</h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
              {description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <ButtonLink href={primaryHref} size="lg">
                {primaryLabel}
                <Icon name="ArrowRight" size={17} className="btn-arrow" />
              </ButtonLink>
              <ButtonLink href={secondaryHref} variant="ghost" size="lg">
                {secondaryLabel}
                <Icon name="ArrowRight" size={17} className="btn-arrow" />
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Shell>
    </Section>
  );
}
