import Link from "next/link";
import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, IconTile } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { solutions } from "@/content/company";

export function SolutionsGrid({ withHeader = true }: { withHeader?: boolean }) {
  return (
    <Section id="solutions">
      <Shell>
        {withHeader ? (
          <SectionHeader
            eyebrow="Solutions"
            title="Built around the shape of the business, not the technology."
            description="Recurring categories of system we build. Each one carries its own architecture decisions, which is why we name them separately."
            action={
              <ButtonLink href="/solutions" variant="secondary">
                All Solutions
                <Icon name="ArrowRight" size={16} className="btn-arrow" />
              </ButtonLink>
            }
          />
        ) : null}

        <RevealGroup
          as="ul"
          className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 ${withHeader ? "mt-14" : ""}`}
        >
          {solutions.map((solution) => (
            <RevealItem as="li" key={solution.slug} className="flex">
              <Card interactive className="group flex w-full flex-col p-7">
                <IconTile>
                  <Icon name={solution.icon} size={21} />
                </IconTile>

                <h3 className="mt-6 font-display text-lg font-medium text-ink">
                  <Link href={`/solutions#${solution.slug}`} className="outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {solution.title}
                  </Link>
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {solution.description}
                </p>

                <ul className="mt-6 space-y-2 border-t border-hairline pt-5">
                  {solution.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[0.8125rem] text-ink-muted">
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-accent-500/80" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </Shell>
    </Section>
  );
}
