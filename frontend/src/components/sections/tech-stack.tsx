import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { Icon } from "@/components/ui/icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { techStack } from "@/content/company";

/**
 * Technology section.
 *
 * Restrained by intent: names in monospace chips rather than a wall of logos,
 * because a logo grid implies partnership or certification we do not claim.
 * Every entry is a technology the team actually works with.
 */
export function TechStack() {
  return (
    <Section className="border-y border-hairline bg-surface/25">
      <Shell>
        <SectionHeader
          eyebrow="Technology"
          title="A deliberately narrow stack, known deeply."
          description="We would rather support a smaller set of technologies well than list everything. If your team already maintains a different stack, we work within it rather than introducing a second one."
        />

        <RevealGroup as="ul" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((category) => (
            <RevealItem
              as="li"
              key={category.category}
              className="rounded-card border border-hairline bg-surface/70 p-7 transition-colors duration-300 hover:border-hairline-strong"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline bg-white/[0.04] text-accent-400">
                  <Icon name={category.icon} size={17} />
                </span>
                <h3 className="font-display text-base font-medium text-ink">
                  {category.category}
                </h3>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                {category.description}
              </p>

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-hairline bg-surface-2 px-2 py-1 font-mono text-[0.6875rem] text-ink-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </Shell>
    </Section>
  );
}
