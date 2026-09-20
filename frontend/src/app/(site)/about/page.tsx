import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { WhyShriDev } from "@/components/sections/why-shridev";
import { TechStack } from "@/components/sections/tech-stack";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { principles } from "@/content/company";
import { siteConfig } from "@/content/site";

export const metadata = pageMetadata({
  title: "About ShriDev",
  description:
    "ShriDev is a software engineering and AI team that helps businesses, startups and organisations design, develop and deploy reliable digital products.",
  path: "/about",
});

const buildList = [
  {
    title: "Products",
    body: "Web applications, portals and mobile experiences that customers use directly.",
    icon: "Rocket",
  },
  {
    title: "Business systems",
    body: "Internal platforms that encode how an organisation actually operates.",
    icon: "Building2",
  },
  {
    title: "Intelligence",
    body: "Models and analytics that turn accumulated data into a usable decision.",
    icon: "BrainCircuit",
  },
  {
    title: "Infrastructure",
    body: "The deployment, data and monitoring layer that keeps the rest running.",
    icon: "CloudCog",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A software engineering and AI team."
        description={siteConfig.supportingLine}
        crumbs={[{ label: "About" }]}
        actions={
          <>
            <ButtonLink href="/start-project">
              Start a Project
              <Icon name="ArrowRight" size={16} className="btn-arrow" />
            </ButtonLink>
            <ButtonLink href="/team" variant="secondary">
              Meet the Team
              <Icon name="ArrowRight" size={16} className="btn-arrow" />
            </ButtonLink>
          </>
        }
      />

      {/* ---- Who we are / what we believe ---- */}
      <Section className="border-t border-hairline">
        <Shell>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeader
                eyebrow="Who we are"
                title="Engineering, not just delivery."
                titleClassName="text-display-3"
              />
            </div>

            <Reveal delay={0.06} className="space-y-6 text-base leading-relaxed text-ink-muted">
              <p>
                ShriDev is a technology development team working across
                full-stack engineering, artificial intelligence, data and cloud
                infrastructure. We help businesses, startups, organisations and
                individual founders take an idea or an operational problem and
                turn it into software that runs in production.
              </p>
              <p>
                We work as one team across the whole delivery path — requirements,
                design, engineering, AI, testing, deployment and support. That
                structure exists for a practical reason: the decisions that
                determine whether software succeeds usually sit between
                disciplines, and they are made better when the same people own
                both sides of the boundary.
              </p>
              <p>
                We are based in India and work remotely with clients wherever they
                are. Collaboration runs through scheduled calls, written progress
                updates, and shared access to staging environments and
                repositories — so you can see the state of the work rather than
                being told about it.
              </p>
            </Reveal>
          </div>
        </Shell>
      </Section>

      {/* ---- What we build ---- */}
      <Section className="border-y border-hairline bg-surface/25">
        <Shell>
          <SectionHeader
            eyebrow="What we build"
            title="Four kinds of system."
            description="Most engagements combine at least two of these, which is why we do not separate them into different teams."
          />

          <RevealGroup as="ul" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {buildList.map((item) => (
              <RevealItem
                as="li"
                key={item.title}
                className="rounded-card border border-hairline bg-surface/70 p-7"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl border border-hairline bg-white/[0.04] text-accent-400">
                  <Icon name={item.icon} size={19} />
                </span>
                <h3 className="mt-6 font-display text-base font-medium text-ink">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Shell>
      </Section>

      {/* ---- Engineering principles ---- */}
      <Section>
        <Shell>
          <SectionHeader
            eyebrow="Engineering approach"
            title="What we hold to, including when it costs us work."
            description="These are the positions that shape how an engagement runs. Two of them regularly mean recommending less work than a client arrived expecting to buy."
          />

          <RevealGroup
            as="ol"
            className="mt-14 grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-3"
          >
            {principles.map((principle, index) => (
              <RevealItem as="li" key={principle.title} className="bg-surface/80 p-8">
                <span className="font-mono text-xs tracking-widest text-accent-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-medium text-ink">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {principle.description}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Shell>
      </Section>

      <ProcessTimeline />
      <WhyShriDev />
      <TechStack />

      {/* ---- Vision ---- */}
      <Section>
        <Shell>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeader
              eyebrow="Where we are going"
              align="center"
              title="Build a team known for software that holds up."
              description="Our ambition is not to be the largest team but a reliably good one: a group businesses return to because the last thing we built still works, is still maintainable, and did what it was supposed to do. Every decision about how we grow is measured against that."
            />
            <Reveal delay={0.12}>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/start-project">
                  Start a Project
                  <Icon name="ArrowRight" size={16} className="btn-arrow" />
                </ButtonLink>
                <ButtonLink href="/projects" variant="secondary">
                  View Our Work
                  <Icon name="ArrowRight" size={16} className="btn-arrow" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </Shell>
      </Section>

      <CtaBand />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
    </>
  );
}
