import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { Icon } from "@/components/ui/icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { differentiators } from "@/content/company";

/**
 * "Why ShriDev" — capability-based credibility only. No claimed counts,
 * awards or guarantees appear anywhere in this section by design.
 */
export function WhyShriDev() {
  return (
    <Section>
      <Shell>
        <SectionHeader
          eyebrow="Why ShriDev"
          title="One team. Complete product delivery."
          description="The same people handle requirements, design, engineering, AI, deployment and support — which is what removes the gaps that usually appear between them."
        />

        <RevealGroup
          as="ul"
          className="mt-14 grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-3"
        >
          {differentiators.map((item) => (
            <RevealItem
              as="li"
              key={item.title}
              className="group bg-surface/80 p-8 transition-colors duration-300 hover:bg-surface-2/70"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl border border-hairline bg-white/[0.04] text-ink-muted transition-colors duration-300 group-hover:border-brand-400/30 group-hover:bg-brand-500/10 group-hover:text-brand-200">
                <Icon name={item.icon} size={19} />
              </span>
              <h3 className="mt-6 font-display text-lg font-medium text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.description}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Shell>
    </Section>
  );
}
