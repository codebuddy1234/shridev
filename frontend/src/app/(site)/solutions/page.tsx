import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { IconTile } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { Industries } from "@/components/sections/industries";
import { EngagementModels } from "@/components/sections/engagement-models";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { solutions } from "@/content/company";

export const metadata = pageMetadata({
  title: "Solutions",
  description:
    "Business platforms, customer portals, SaaS products, AI-powered applications, analytics platforms and e-commerce — systems built around how the business actually works.",
  path: "/solutions",
  keywords: ["business platform", "customer portal", "SaaS development", "analytics platform"],
});

export default function SolutionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solutions"
        title="Built around the shape of the business, not the technology."
        description="Recurring categories of system we build. Each carries its own architecture decisions — tenancy, permissions, data model, integration surface — which is why we name them separately rather than calling everything 'a web app'."
        crumbs={[{ label: "Solutions" }]}
        actions={
          <ButtonLink href="/start-project">
            Start a Project
            <Icon name="ArrowRight" size={16} className="btn-arrow" />
          </ButtonLink>
        }
      />

      {/* Alternating detail rows — more room per solution than a card grid allows. */}
      <Section tight className="border-t border-hairline">
        <Shell>
          <div className="divide-y divide-hairline">
            {solutions.map((solution, index) => (
              <Reveal
                key={solution.slug}
                id={solution.slug}
                className="grid scroll-mt-28 gap-8 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <IconTile tone={index % 2 === 0 ? "brand" : "accent"}>
                      <Icon name={solution.icon} size={21} />
                    </IconTile>
                    <span className="font-mono text-xs tracking-widest text-ink-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="mt-6 text-display-3 text-ink">{solution.title}</h2>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
                    {solution.description}
                  </p>
                </div>

                <div className="rounded-card border border-hairline bg-surface/60 p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                    What this typically includes
                  </p>
                  <ul className="mt-5 space-y-3.5">
                    {solution.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
                        <Icon name="Check" size={15} className="mt-0.5 shrink-0 text-accent-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ButtonLink
                    href={`/start-project?project_type=${encodeURIComponent(solution.title)}`}
                    variant="link"
                    className="mt-6"
                  >
                    Discuss this solution
                    <Icon name="ArrowRight" size={14} className="btn-arrow" />
                  </ButtonLink>
                </div>
              </Reveal>
            ))}
          </div>
        </Shell>
      </Section>

      <Section className="border-y border-hairline bg-surface/25">
        <Shell>
          <SectionHeader
            eyebrow="Choosing"
            title="Which one applies is usually a scoping question."
            description="Most requirements sit across two or three of these. The purpose of naming them is to surface the architectural decisions early — tenancy, permissions, integration, reporting — rather than discovering them halfway through a build."
            action={
              <ButtonLink href="/start-project" variant="secondary">
                Discuss Your Requirement
                <Icon name="ArrowRight" size={16} className="btn-arrow" />
              </ButtonLink>
            }
          />
        </Shell>
      </Section>

      <Industries />
      <EngagementModels />
      <CtaBand />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
        ])}
      />
    </>
  );
}
