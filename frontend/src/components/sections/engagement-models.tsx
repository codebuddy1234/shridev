import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { Icon } from "@/components/ui/icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { engagementModels } from "@/content/company";

/** How an engagement is structured commercially. */
export function EngagementModels() {
  return (
    <Section>
      <Shell>
        <SectionHeader
          eyebrow="Engagement models"
          title="Four ways to work together."
          description="Which one fits depends on how well defined the work is. If you are not sure, a discovery engagement usually answers that question for a fraction of the cost of guessing."
        />

        <RevealGroup as="ul" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {engagementModels.map((model) => (
            <RevealItem
              as="li"
              key={model.title}
              className="flex flex-col rounded-card border border-hairline bg-surface/70 p-7 transition-colors duration-300 hover:border-hairline-strong"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl border border-hairline bg-white/[0.04] text-accent-400">
                <Icon name={model.icon} size={19} />
              </span>
              <h3 className="mt-6 font-display text-base font-medium text-ink">{model.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                {model.description}
              </p>
              <p className="mt-5 border-t border-hairline pt-4 text-xs text-ink-faint">
                <span className="font-medium text-ink-muted">Suited to: </span>
                {model.suitedTo}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Shell>
    </Section>
  );
}
