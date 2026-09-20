import { Section, Shell } from "@/components/ui/shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FormMessage } from "@/components/ui/field";
import { Reveal } from "@/components/ui/reveal";
import { FaqAccordion } from "@/components/ui/accordion";
import {
  GithubIcon,
  InstagramIcon,
  LinkedInIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/ui/brand-icons";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { activeSocialLinks, siteConfig, whatsappLink } from "@/content/site";
import { generalFaqs } from "@/content/company";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with ShriDev about a project, an existing system or a technical question. Based in India, working with teams wherever they are.",
  path: "/contact",
});

const socialIcons = {
  linkedin: LinkedInIcon,
  github: GithubIcon,
  instagram: InstagramIcon,
  x: XIcon,
} as const;

/**
 * Contact page.
 *
 * Every channel is rendered from configuration. An unset email, phone number
 * or profile URL is omitted entirely — the page never prints a placeholder
 * that a visitor could mistake for a real contact detail.
 */
export default function ContactPage() {
  const { contact } = siteConfig;
  const socials = activeSocialLinks();
  const wa = whatsappLink("Hello ShriDev, I would like to discuss a project.");
  const hasDirectChannel = Boolean(contact.email || contact.phone || wa);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's discuss your project."
        description="The fastest route is the project enquiry form — it captures the context we need to give you a useful first answer rather than a request for more information."
        crumbs={[{ label: "Contact" }]}
        actions={
          <ButtonLink href="/start-project" size="lg">
            Start a Project
            <Icon name="ArrowRight" size={17} className="btn-arrow" />
          </ButtonLink>
        }
      />

      <Section className="border-t border-hairline">
        <Shell>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            {/* ---- Channels ---- */}
            <div>
              <SectionHeader
                eyebrow="Get in touch"
                title="How to reach us"
                titleClassName="text-display-3"
              />

              {hasDirectChannel ? (
                <ul className="mt-10 space-y-4">
                  {contact.email ? (
                    <li>
                      <ContactRow
                        icon="Mail"
                        label="Email"
                        value={contact.email}
                        href={`mailto:${contact.email}`}
                      />
                    </li>
                  ) : null}
                  {contact.phone ? (
                    <li>
                      <ContactRow
                        icon="Phone"
                        label="Phone"
                        value={contact.phone}
                        href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                      />
                    </li>
                  ) : null}
                  {wa ? (
                    <li>
                      <ContactRow
                        icon="MessageSquare"
                        label="WhatsApp"
                        value="Message us on WhatsApp"
                        href={wa}
                        external
                      />
                    </li>
                  ) : null}
                </ul>
              ) : (
                <FormMessage
                  tone="info"
                  title="Direct contact details are not published yet"
                  className="mt-10"
                >
                  Email, phone and WhatsApp are configured through environment
                  variables and appear here once set. In the meantime the
                  project enquiry form reaches us and is checked regularly.
                </FormMessage>
              )}

              {/* Location, only when a real one is supplied. */}
              <div className="mt-10 rounded-card border border-hairline bg-surface/60 p-7">
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" size={18} className="mt-0.5 shrink-0 text-accent-400" />
                  <div>
                    <h3 className="font-display text-base font-medium text-ink">Where we work</h3>
                    {contact.location ? (
                      <p className="mt-2 text-sm text-ink-muted">{contact.location}</p>
                    ) : null}
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{contact.reach}</p>
                  </div>
                </div>
              </div>

              {socials.length ? (
                <div className="mt-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                    Elsewhere
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2.5">
                    {socials.map((social) => {
                      const Glyph = socialIcons[social.key];
                      return (
                        <li key={social.key}>
                          <a
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 rounded-full border border-hairline bg-white/[0.03] px-4 py-2.5 text-sm text-ink-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/40 hover:text-ink"
                          >
                            <Glyph size={15} />
                            {social.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* ---- What to expect ---- */}
            <Reveal delay={0.08}>
              <Card className="p-8 sm:p-10">
                <h2 className="font-display text-xl font-medium text-ink">
                  What happens after you get in touch
                </h2>

                <ol className="mt-8 space-y-6">
                  {[
                    {
                      title: "We read the enquiry properly",
                      body: "Someone technical reviews it, not a sales queue. If anything is unclear we ask specific questions rather than generic ones.",
                    },
                    {
                      title: "A conversation about the problem",
                      body: "A call covering goals, constraints, existing systems and timeline. No obligation and no pressure to decide anything on it.",
                    },
                    {
                      title: "A scope outline and estimate",
                      body: "Written, with the assumptions stated. For larger or less defined work we propose a short discovery engagement first.",
                    },
                    {
                      title: "An honest recommendation",
                      body: "Including when that is a smaller build, an existing product, or that we are not the right team for it.",
                    },
                  ].map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-accent-500/25 bg-accent-500/10 font-mono text-[0.6875rem] text-accent-300">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-display text-[0.9375rem] font-medium text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-9 border-t border-hairline pt-7">
                  <ButtonLink href="/start-project" full size="lg">
                    Start a Project
                    <Icon name="ArrowRight" size={17} className="btn-arrow" />
                  </ButtonLink>
                </div>
              </Card>
            </Reveal>
          </div>
        </Shell>
      </Section>

      <Section className="border-t border-hairline bg-surface/25">
        <Shell>
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <SectionHeader
              eyebrow="FAQ"
              title="Before you write"
              titleClassName="text-display-3"
              description="A few things people usually want to know first."
            />
            <Reveal delay={0.06}>
              <FaqAccordion items={generalFaqs.slice(0, 6)} />
            </Reveal>
          </div>
        </Shell>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
    </>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: string;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center gap-4 rounded-card border border-hairline bg-surface/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/40"
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-hairline bg-white/[0.04] text-accent-400">
        {icon === "MessageSquare" ? <WhatsAppIcon size={18} /> : <Icon name={icon} size={19} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </span>
        <span className="mt-1 block truncate text-[0.9375rem] text-ink">{value}</span>
      </span>
      <Icon
        name="ArrowUpRight"
        size={16}
        className="shrink-0 text-ink-faint transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </a>
  );
}
