import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { FormMessage } from "@/components/ui/field";
import type { Crumb } from "@/components/ui/page-header";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

/**
 * Shared layout for the privacy policy and terms pages.
 *
 * Both documents carry a visible notice that they are a starting template
 * requiring legal review before launch — publishing boilerplate as though it
 * were reviewed policy would be worse than publishing nothing.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
  crumbs,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  crumbs: Crumb[];
}) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} description={intro} crumbs={crumbs} />

      <Section tight className="border-t border-hairline">
        <Shell>
          <div className="max-w-3xl">
            <p className="text-sm text-ink-faint">Last updated: {updated}</p>

            <FormMessage
              tone="info"
              title="Template requiring review before launch"
              className="mt-6"
            >
              This document is a starting point written to cover how the site
              actually works. It has not been reviewed by a legal professional
              and does not yet reflect ShriDev&apos;s registered entity details.
              Have it reviewed and complete the bracketed placeholders before
              the site goes live.
            </FormMessage>

            <div className="mt-12 space-y-12">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="font-display text-xl font-medium text-ink">{section.heading}</h2>

                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets ? (
                    <ul className="mt-5 space-y-2.5">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet.slice(0, 40)}
                          className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-muted"
                        >
                          <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-accent-500" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </div>
        </Shell>
      </Section>
    </>
  );
}
