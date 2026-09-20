import { Section, Shell } from "@/components/ui/shell";
import { Eyebrow } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { AiNetwork } from "@/components/visuals/ai-network";

const aiCapabilities = [
  {
    title: "Predictive Analytics",
    body: "Forecasting demand, risk or load from historical records.",
    icon: "TrendingUp",
  },
  {
    title: "Recommendation Systems",
    body: "Ranking items, content or next actions for each user.",
    icon: "Target",
  },
  {
    title: "Natural Language Processing",
    body: "Extracting structure and meaning from documents and messages.",
    icon: "MessagesSquare",
  },
  {
    title: "Computer Vision",
    body: "Classification and detection from images and video frames.",
    icon: "Eye",
  },
  {
    title: "AI Assistants",
    body: "Retrieval-backed answering grounded in your own content.",
    icon: "Sparkles",
  },
  {
    title: "Intelligent Automation",
    body: "Workflows where a model handles the routine decisions.",
    icon: "Workflow",
  },
];

/**
 * AI differentiator band.
 *
 * Given a darker inset panel and its own interactive visual so it reads as the
 * most considered section on the page — this is the capability that most
 * distinguishes the practice.
 */
export function AiSection() {
  return (
    <Section id="ai" className="relative overflow-hidden">
      {/* Band wash — one of the few places gradients are used at scale. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(109,93,251,0.06) 30%, rgba(34,211,197,0.04) 70%, transparent)",
        }}
      />

      <Shell>
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow>Artificial Intelligence</Eyebrow>
              <h2 className="mt-5 text-display-2 text-ink">
                Make software <span className="text-gradient">smarter</span>.
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
                We integrate artificial intelligence where it creates practical
                value — from prediction and recommendation to automation,
                analytics and intelligent workflows. Every engagement starts with
                a feasibility check against your actual data, and we will tell you
                when a simpler approach would serve you better.
              </p>
            </Reveal>

            <RevealGroup as="ul" className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {aiCapabilities.map((capability) => (
                <RevealItem as="li" key={capability.title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-accent-500/25 bg-accent-500/10 text-accent-300">
                    <Icon name={capability.icon} size={16} />
                  </span>
                  <div>
                    <h3 className="font-display text-[0.9375rem] font-medium text-ink">
                      {capability.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {capability.body}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.16}>
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href="/services/ai-machine-learning" variant="secondary">
                  AI &amp; Machine Learning
                  <Icon name="ArrowRight" size={16} className="btn-arrow" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="mx-auto w-full max-w-md lg:max-w-none">
            <AiNetwork />
          </Reveal>
        </div>
      </Shell>
    </Section>
  );
}
