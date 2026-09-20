import { Shell } from "@/components/ui/shell";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { HeroVisual } from "@/components/visuals/hero-visual";

/**
 * Homepage hero.
 *
 * Two CTAs only — one primary, one secondary — so the hierarchy stays clear.
 * The visual is decorative support for the headline, not a carrier of
 * information, and it drops below the copy on narrow screens.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-12 sm:pb-24 sm:pt-16 lg:pb-32 lg:pt-20">
      {/* Background: hairline grid, masked so it fades before the edges. */}
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 -z-20"
        style={{
          maskImage: "radial-gradient(70% 60% at 50% 30%, black, transparent)",
          WebkitMaskImage: "radial-gradient(70% 60% at 50% 30%, black, transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-20 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(109,93,251,0.26), transparent 70%)",
        }}
      />

      <Shell>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10 xl:gap-16">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-ink-muted backdrop-blur-sm">
                <Icon name="Sparkles" size={13} className="text-accent-400" />
                Software Engineering &amp; AI Solutions
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-7 text-display-1 text-ink">
                Build digital products.
                <br />
                <span className="text-gradient">Ship with confidence.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
                ShriDev combines full-stack engineering, AI and modern product
                development to turn ideas and business requirements into reliable
                digital products — designed, built, tested and deployed by one team.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <ButtonLink href="/start-project" size="lg">
                  Start a Project
                  <Icon name="ArrowRight" size={17} className="btn-arrow" />
                </ButtonLink>
                <ButtonLink href="/projects" variant="secondary" size="lg">
                  Explore Our Work
                  <Icon name="ArrowRight" size={17} className="btn-arrow" />
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <p className="mt-9 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-ink-faint">
                <Icon name="MapPin" size={14} className="text-ink-faint" />
                Based in India, building for businesses and teams wherever they are.
              </p>
            </Reveal>
          </div>

          {/* Visual sits first in the DOM order on no screen size — the headline
              always leads for screen readers and for mobile scroll order. */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <HeroVisual />
          </div>
        </div>
      </Shell>
    </section>
  );
}
