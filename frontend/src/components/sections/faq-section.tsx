import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { FaqAccordion } from "@/components/ui/accordion";
import type { Faq } from "@/content/company";

export function FaqSection({
  items,
  title = "Questions we are asked before a project starts.",
  eyebrow = "FAQ",
  description,
}: {
  items: Faq[];
  title?: string;
  eyebrow?: string;
  description?: string;
}) {
  return (
    <Section id="faq" className="border-t border-hairline">
      <Shell>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              eyebrow={eyebrow}
              title={title}
              titleClassName="text-display-3"
              description={description}
            />
            <Reveal delay={0.1}>
              <div className="mt-8 rounded-card border border-hairline bg-surface/60 p-6">
                <p className="text-sm leading-relaxed text-ink-muted">
                  Not covered here? Send the question with your enquiry and we
                  will answer it directly.
                </p>
                <ButtonLink href="/start-project" size="sm" className="mt-5">
                  Start a Project
                  <Icon name="ArrowRight" size={15} className="btn-arrow" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.06}>
            <FaqAccordion items={items} defaultOpen={0} />
          </Reveal>
        </div>
      </Shell>
    </Section>
  );
}
