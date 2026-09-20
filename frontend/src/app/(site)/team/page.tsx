import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { RoleCard, TeamCard } from "@/components/ui/team-card";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FormMessage } from "@/components/ui/field";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { getTeam } from "@/lib/api";

export const metadata = pageMetadata({
  title: "Team",
  description:
    "The people behind ShriDev — engineering, AI, design and product roles across the full delivery path.",
  path: "/team",
});

/**
 * Roles we staff.
 *
 * Shown when no team members have been added yet. These describe the
 * disciplines an engagement draws on — they are explicitly not people, and
 * no names, photographs or biographies are invented anywhere on this page.
 */
const roles = [
  {
    role: "Founder / Technical Lead",
    description:
      "Owns architecture and technical direction, and is involved in scoping every engagement.",
  },
  {
    role: "Full-Stack Engineers",
    description:
      "Build across the interface, API and database so decisions between layers are made once.",
  },
  {
    role: "AI / ML Engineer",
    description:
      "Assesses feasibility, develops and evaluates models, and integrates inference into the product.",
  },
  {
    role: "Frontend Developers",
    description:
      "Implement interfaces to the design system, with accessibility and performance as build criteria.",
  },
  {
    role: "Backend Developers",
    description: "Design the data model, API contract, authentication and integration layer.",
  },
  {
    role: "Design / Product",
    description:
      "Shape flows, interface structure and the component system the build follows.",
  },
];

export default async function TeamPage() {
  const members = await getTeam();

  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="The people behind ShriDev."
        description="A team organised around complete delivery rather than separated disciplines — the same people carry a project from requirements through to production and support."
        crumbs={[{ label: "Team" }]}
      />

      <Section className="border-t border-hairline">
        <Shell>
          {members.length > 0 ? (
            <>
              <SectionHeader
                eyebrow="Our team"
                title="Who you will be working with."
                titleClassName="text-display-3"
              />
              <RevealGroup as="ul" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => (
                  <RevealItem as="li" key={member.id} className="flex">
                    <TeamCard member={member} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          ) : (
            <>
              <SectionHeader
                eyebrow="Roles"
                title="The disciplines an engagement draws on."
                titleClassName="text-display-3"
                description="Individual profiles are published from the admin dashboard. Until they are, these are the roles that make up a delivery team — described as functions, not as invented people."
              />

              <FormMessage
                tone="info"
                title="Team profiles are not published yet"
                className="mt-10 max-w-2xl"
              >
                Add real names, roles, photographs and profile links through the
                admin dashboard and they will appear here automatically. Nothing
                on this page is fabricated in the meantime.
              </FormMessage>

              <RevealGroup as="ul" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {roles.map((entry) => (
                  <RevealItem as="li" key={entry.role}>
                    <RoleCard role={entry.role} description={entry.description} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}
        </Shell>
      </Section>

      <Section className="border-t border-hairline bg-surface/25">
        <Shell>
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeader
              align="center"
              eyebrow="Working with us"
              title="One team, from the first call to production."
              titleClassName="text-display-3"
              description="You work with the people building the software, not an account layer between you and them. Scope, progress and problems are communicated directly."
            />
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/start-project">
                Start a Project
                <Icon name="ArrowRight" size={16} className="btn-arrow" />
              </ButtonLink>
              <ButtonLink href="/about" variant="secondary">
                About ShriDev
                <Icon name="ArrowRight" size={16} className="btn-arrow" />
              </ButtonLink>
            </div>
          </div>
        </Shell>
      </Section>

      <CtaBand />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Team", path: "/team" },
        ])}
      />
    </>
  );
}
