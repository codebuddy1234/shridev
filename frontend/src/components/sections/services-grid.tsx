import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ServiceCard } from "@/components/ui/service-card";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { services } from "@/content/services";

export function ServicesGrid() {
  return (
    <Section id="services" className="relative">
      <Shell>
        <SectionHeader
          eyebrow="Capabilities"
          title="Engineering capabilities for real-world products."
          description="Eight areas of delivery that combine into whatever the project actually needs. Most engagements draw on several of them."
          action={
            <ButtonLink href="/services" variant="secondary">
              All Services
              <Icon name="ArrowRight" size={16} className="btn-arrow" />
            </ButtonLink>
          }
        />

        <RevealGroup
          as="ul"
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {services.map((service) => (
            <RevealItem as="li" key={service.slug} className="flex">
              <ServiceCard service={service} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Shell>
    </Section>
  );
}
