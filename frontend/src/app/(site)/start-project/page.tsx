import { Suspense } from "react";
import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/states";
import { EnquiryForm } from "@/components/enquiry-form";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { siteConfig, whatsappLink } from "@/content/site";

export const metadata = pageMetadata({
  title: "Start a Project",
  description:
    "Tell ShriDev about your idea, business requirement or existing system. We review every enquiry and come back with an honest view of the scope.",
  path: "/start-project",
});

const expectations = [
  {
    icon: "Search",
    title: "Someone technical reads it",
    body: "Enquiries go to the people who would do the work, not a sales queue.",
  },
  {
    icon: "MessagesSquare",
    title: "A conversation, not a pitch",
    body: "A call about goals, constraints and timeline. No obligation either way.",
  },
  {
    icon: "ClipboardCheck",
    title: "A written scope and estimate",
    body: "With the assumptions stated, so you can see what the number depends on.",
  },
  {
    icon: "ShieldCheck",
    title: "An honest recommendation",
    body: "Including when that means a smaller build, or that we are not the right team.",
  },
];

export default function StartProjectPage() {
  const wa = whatsappLink("Hello ShriDev, I would like to discuss a project.");

  return (
    <>
      <PageHeader
        eyebrow="Start a Project"
        title="Let's build something useful."
        description="Tell us about your idea, business requirement or existing system. The more context you give, the more useful our first reply will be."
        crumbs={[{ label: "Start a Project" }]}
      />

      <Section tight className="border-t border-hairline">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
            {/* The form reads query parameters, so it is wrapped in Suspense. */}
            <Suspense fallback={<FormSkeleton />}>
              <EnquiryForm />
            </Suspense>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <Card className="p-7">
                <h2 className="font-display text-base font-medium text-ink">What happens next</h2>
                <ul className="mt-6 space-y-5">
                  {expectations.map((item) => (
                    <li key={item.title} className="flex gap-3.5">
                      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-hairline bg-white/[0.04] text-accent-400">
                        <Icon name={item.icon} size={16} />
                      </span>
                      <div>
                        <h3 className="text-sm font-medium text-ink">{item.title}</h3>
                        <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-7">
                <h2 className="font-display text-base font-medium text-ink">
                  A clearer brief gets a better answer
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {[
                    "What the software needs to achieve for the business",
                    "Who will use it and what they do today instead",
                    "Any systems it has to work with",
                    "Hard deadlines, and what drives them",
                    "A budget range, even an approximate one",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ink-muted"
                    >
                      <Icon name="Check" size={14} className="mt-0.5 shrink-0 text-accent-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Alternative channels, only when configured. */}
              {siteConfig.contact.email || wa ? (
                <Card className="p-7">
                  <h2 className="font-display text-base font-medium text-ink">
                    Prefer to write directly?
                  </h2>
                  <ul className="mt-5 space-y-2.5 text-sm">
                    {siteConfig.contact.email ? (
                      <li>
                        <a
                          href={`mailto:${siteConfig.contact.email}`}
                          className="inline-flex items-center gap-2 text-accent-400 transition-colors hover:text-accent-300"
                        >
                          <Icon name="Mail" size={15} />
                          {siteConfig.contact.email}
                        </a>
                      </li>
                    ) : null}
                    {wa ? (
                      <li>
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-accent-400 transition-colors hover:text-accent-300"
                        >
                          <Icon name="MessageSquare" size={15} />
                          Message on WhatsApp
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </Card>
              ) : null}
            </aside>
          </div>
        </Shell>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Start a Project", path: "/start-project" },
        ])}
      />
    </>
  );
}

function FormSkeleton() {
  return (
    <div className="rounded-panel border border-hairline bg-surface/60 p-6 sm:p-9">
      <Skeleton className="h-4 w-28" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-2 h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 h-36 w-full rounded-xl" />
      <Skeleton className="mt-8 h-12 w-48 rounded-full" />
    </div>
  );
}
