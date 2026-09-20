import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { Icon } from "@/components/ui/icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { industries } from "@/content/company";

/**
 * Industries.
 *
 * Framed as areas where we can build technology solutions. We deliberately do
 * not claim specialised regulatory, clinical or financial-compliance
 * expertise — where a project needs that, it comes from the client's side or a
 * named specialist.
 */
export function Industries() {
  return (
    <Section id="industries">
      <Shell>
        <SectionHeader
          eyebrow="Industries"
          title="Built for different industries."
          description="Sectors where we can develop technology solutions. Domain knowledge comes from your team — we bring the engineering and the questions that surface what the software actually has to do."
        />

        <RevealGroup
          as="ul"
          className="mt-14 grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {industries.map((industry) => (
            <RevealItem
              as="li"
              key={industry.name}
              className="group bg-surface/80 p-6 transition-colors duration-300 hover:bg-surface-2/70"
            >
              <Icon
                name={industry.icon}
                size={20}
                className="text-ink-faint transition-colors duration-300 group-hover:text-accent-400"
              />
              <h3 className="mt-4 font-display text-[0.9375rem] font-medium text-ink">
                {industry.name}
              </h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-muted">
                {industry.description}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="mt-6 text-xs text-ink-faint">
          Presented as areas of technical capability. Regulatory, clinical and
          financial compliance requirements are handled with your own advisors.
        </p>
      </Shell>
    </Section>
  );
}
