import { Section, Shell } from "@/components/ui/shell";
import { Eyebrow } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";

const considerations = [
  {
    title: "Business objectives",
    body: "What the organisation needs to be different once the software exists.",
  },
  {
    title: "User requirements",
    body: "Who uses it, what they are trying to finish, and where they currently get stuck.",
  },
  {
    title: "Workflows",
    body: "How the work is actually performed today, including the informal exceptions.",
  },
  {
    title: "Technical constraints",
    body: "Existing systems, data, integrations and the team who will maintain it.",
  },
  {
    title: "Scalability",
    body: "The load and complexity the system realistically has to absorb next.",
  },
  {
    title: "Deployment and maintenance",
    body: "How it reaches production and stays healthy long after launch.",
  },
];

/** "Technology should solve business problems" — the positioning statement. */
export function Intro() {
  return (
    <Section id="how-we-work">
      <Shell>
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Our position</Eyebrow>
              <h2 className="mt-5 text-display-2 text-ink">
                Technology should solve business problems.
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-7 space-y-5 text-base leading-relaxed text-ink-muted">
                <p>
                  Building screens is the straightforward part. The work that
                  determines whether software succeeds happens before and around
                  it — understanding what the business needs, how people actually
                  work, and what the system has to survive once it is live.
                </p>
                <p>
                  So we start with the problem rather than the stack. Every
                  engagement begins by establishing what would have to be true
                  for the project to be worth doing, and we will say plainly when
                  the answer is a smaller build, an existing tool, or no software
                  at all.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-9">
                <ButtonLink href="/about" variant="secondary">
                  How We Work
                  <Icon name="ArrowRight" size={16} className="btn-arrow" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <RevealGroup as="ul" className="grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-2">
            {considerations.map((item) => (
              <RevealItem
                as="li"
                key={item.title}
                className="bg-surface/80 p-6 transition-colors duration-300 hover:bg-surface-2/80"
              >
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={16} className="mt-0.5 shrink-0 text-accent-500" />
                  <div>
                    <h3 className="font-display text-[0.9375rem] font-medium text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Shell>
    </Section>
  );
}
