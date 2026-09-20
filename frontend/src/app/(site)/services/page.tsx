import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { ServiceCard } from "@/components/ui/service-card";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { EngagementModels } from "@/components/sections/engagement-models";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/content/site";
import { serviceGroups, services, servicesBySlug } from "@/content/services";
import { generalFaqs } from "@/content/company";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Web and full-stack development, AI and machine learning, data analytics, mobile applications, automation, cloud deployment and custom software — delivered end to end by one team.",
  path: "/services",
  keywords: [
    "software development services",
    "web development India",
    "AI development",
    "full-stack development",
    "custom software",
  ],
});

const standardInclusions = [
  {
    icon: "ShieldCheck",
    title: "Server-side validation",
    body: "Every input revalidated on the server, whatever the browser already checked.",
  },
  {
    icon: "Gauge",
    title: "Performance budget",
    body: "Images sized, fonts optimised, JavaScript split, Core Web Vitals measured before launch.",
  },
  {
    icon: "Users",
    title: "Accessibility",
    body: "Semantic markup, keyboard navigation, visible focus, contrast and reduced-motion support.",
  },
  {
    icon: "FileText",
    title: "Handover documentation",
    body: "Schema notes, deployment steps and a runbook thorough enough for another team.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Engineering capabilities for real-world products."
        description="Eight areas of delivery that combine into whatever a project actually needs. Most engagements draw on several of them, which is why we work across the whole stack rather than handing work between specialists."
        crumbs={[{ label: "Services" }]}
        actions={
          <>
            <ButtonLink href="/start-project">
              Start a Project
              <Icon name="ArrowRight" size={16} className="btn-arrow" />
            </ButtonLink>
            <ButtonLink href="/projects" variant="secondary">
              View Our Work
              <Icon name="ArrowRight" size={16} className="btn-arrow" />
            </ButtonLink>
          </>
        }
      />

      {/* Grouped catalogue — mirrors the mega menu so navigation stays predictable. */}
      <Section tight>
        <Shell>
          <div className="space-y-16">
            {serviceGroups.map((group) => (
              <div key={group.group}>
                <div className="flex items-center gap-4">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-accent-400">
                    {group.group}
                  </h2>
                  <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
                  <span className="font-mono text-xs text-ink-faint">
                    {String(group.slugs.length).padStart(2, "0")}
                  </span>
                </div>

                <RevealGroup as="ul" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {servicesBySlug(group.slugs).map((service) => (
                    <RevealItem as="li" key={service.slug} className="flex">
                      <ServiceCard service={service} />
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            ))}
          </div>
        </Shell>
      </Section>

      <Section className="border-y border-hairline bg-surface/25">
        <Shell>
          <SectionHeader
            eyebrow="Included as standard"
            title="The parts that are easy to leave out."
            description="These are not upsells. They are what separates a demo from something you can put in front of customers, so they are part of every engagement."
          />

          <RevealGroup
            as="ul"
            className="mt-14 grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4"
          >
            {standardInclusions.map((item) => (
              <RevealItem as="li" key={item.title} className="bg-surface/80 p-7">
                <Icon name={item.icon} size={20} className="text-accent-400" />
                <h3 className="mt-5 font-display text-base font-medium text-ink">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Shell>
      </Section>

      <ProcessTimeline />
      <EngagementModels />
      <FaqSection items={generalFaqs} />
      <CtaBand
        title="Not sure which service you need?"
        description="Describe the problem rather than the solution. We will tell you what the work actually involves — including when the answer is a smaller build than you expected."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "ShriDev services",
          itemListElement: services.map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.name,
            url: absoluteUrl(`/services/${service.slug}`),
          })),
        }}
      />
    </>
  );
}
