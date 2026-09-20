import { notFound } from "next/navigation";
import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, IconTile } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { FaqAccordion } from "@/components/ui/accordion";
import { ServiceCard } from "@/components/ui/service-card";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd, breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/content/site";
import { getService, services, servicesBySlug } from "@/content/services";
import { truncate } from "@/lib/utils";

/**
 * Service detail template.
 *
 * All eight service pages are generated from the typed catalogue in
 * `content/services.ts`, so adding a service is a content change rather than
 * a new route. Every page is statically generated at build time.
 */

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return pageMetadata({
    title: service.headline,
    description: truncate(service.summary, 158),
    path: `/services/${service.slug}`,
    keywords: [service.name, ...service.tags, "ShriDev"],
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = servicesBySlug(service.related);

  return (
    <>
      <PageHeader
        eyebrow={service.group}
        title={service.headline}
        description={service.intro}
        crumbs={[{ label: "Services", href: "/services" }, { label: service.name }]}
        actions={
          <>
            <ButtonLink href={`/start-project?service=${service.slug}`}>
              Discuss This Service
              <Icon name="ArrowRight" size={16} className="btn-arrow" />
            </ButtonLink>
            <ButtonLink href="/projects" variant="secondary">
              View Our Work
              <Icon name="ArrowRight" size={16} className="btn-arrow" />
            </ButtonLink>
          </>
        }
      >
        {/* Service identity card: index, icon and the technologies involved. */}
        <Card className="w-full p-7 lg:w-80">
          <div className="flex items-center justify-between">
            <IconTile tone="accent">
              <Icon name={service.icon} size={21} />
            </IconTile>
            <span className="font-mono text-sm tracking-widest text-ink-faint">
              {service.index}
            </span>
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Typical technologies
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {service.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="tech" size="sm">
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </PageHeader>

      {/* ---- What we deliver ---- */}
      <Section className="border-t border-hairline">
        <Shell>
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeader
                eyebrow="What you get"
                title="Delivered, not promised."
                titleClassName="text-display-3"
                description="The concrete outputs of this service. Anything not listed here is scoped separately rather than assumed."
              />
            </div>

            <RevealGroup as="ul" className="divide-y divide-hairline border-y border-hairline">
              {service.deliverables.map((deliverable, index) => (
                <RevealItem as="li" key={deliverable.title} className="flex gap-6 py-7">
                  <span className="font-mono text-xs text-ink-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-medium text-ink">
                      {deliverable.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {deliverable.description}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Shell>
      </Section>

      {/* ---- When this fits / how we work ---- */}
      <Section className="border-y border-hairline bg-surface/25">
        <Shell>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <h2 className="text-display-3 text-ink">When teams come to us for this</h2>
              <ul className="mt-8 space-y-4">
                {service.useCases.map((useCase) => (
                  <li key={useCase} className="flex items-start gap-3 text-[0.9375rem] text-ink-muted">
                    <Icon name="CircleDot" size={15} className="mt-1 shrink-0 text-accent-500" />
                    {useCase}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="text-display-3 text-ink">How we approach it</h2>
              <ol className="mt-8 space-y-5">
                {service.approach.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-brand-400/25 bg-brand-500/10 font-mono text-[0.6875rem] text-brand-200">
                      {index + 1}
                    </span>
                    <p className="text-[0.9375rem] leading-relaxed text-ink-muted">{step}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </Shell>
      </Section>

      {/* ---- Service FAQ ---- */}
      <Section>
        <Shell>
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div>
              <SectionHeader
                eyebrow="FAQ"
                title={`${service.name} questions`}
                titleClassName="text-display-3"
              />
            </div>
            <Reveal delay={0.06}>
              <FaqAccordion items={service.faqs} defaultOpen={0} />
            </Reveal>
          </div>
        </Shell>
      </Section>

      {/* ---- Related services ---- */}
      {related.length ? (
        <Section tight className="border-t border-hairline">
          <Shell>
            <SectionHeader
              eyebrow="Related"
              title="Often delivered alongside"
              titleClassName="text-display-3"
            />
            <RevealGroup as="ul" className="mt-10 grid gap-5 sm:grid-cols-2">
              {related.map((item) => (
                <RevealItem as="li" key={item.slug} className="flex">
                  <ServiceCard service={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Shell>
        </Section>
      ) : null}

      <CtaBand
        title={`Have a ${service.name.toLowerCase()} requirement?`}
        description="Send the details and we will come back with an honest view of the scope, the approach and what it would take."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />
      <JsonLd data={faqSchema(service.faqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          serviceType: service.name,
          description: service.summary,
          url: absoluteUrl(`/services/${service.slug}`),
          provider: { "@id": absoluteUrl("/#organization") },
          areaServed: siteConfig.contact.location ?? "Worldwide",
        }}
      />
    </>
  );
}
