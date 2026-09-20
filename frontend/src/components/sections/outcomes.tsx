import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, IconTile } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { outcomes } from "@/content/company";

/** Business-outcome band: what an engagement is actually for. */
export function Outcomes() {
  return (
    <Section className="border-y border-hairline bg-surface/25">
      <Shell>
        <SectionHeader
          eyebrow="Business outcomes"
          title="Technology is useful when it improves the way work gets done."
          description="Most projects we take on fall into one of four shapes. Naming which one you are in makes the scope conversation much shorter."
        />

        <RevealGroup as="ul" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {outcomes.map((outcome) => (
            <RevealItem as="li" key={outcome.title} className="flex">
              <Card interactive className="flex w-full flex-col p-7">
                <IconTile tone="accent">
                  <Icon name={outcome.icon} size={21} />
                </IconTile>
                <h3 className="mt-6 font-display text-xl font-medium text-ink">
                  {outcome.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] font-medium leading-relaxed text-ink">
                  {outcome.description}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                  {outcome.detail}
                </p>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Shell>
    </Section>
  );
}
