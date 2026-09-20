import Link from "next/link";
import { Shell } from "@/components/ui/shell";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/layout/logo";
import {
  GithubIcon,
  InstagramIcon,
  LinkedInIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/ui/brand-icons";
import { footerNav } from "@/content/navigation";
import { activeSocialLinks, siteConfig, whatsappLink } from "@/content/site";

const socialIcons = {
  linkedin: LinkedInIcon,
  github: GithubIcon,
  instagram: InstagramIcon,
  x: XIcon,
} as const;

/**
 * Site footer.
 *
 * Contact rows and social icons are rendered only when the corresponding value
 * is configured — an unset email or profile disappears entirely rather than
 * rendering a placeholder that reads as real business information.
 */
export function Footer() {
  const socials = activeSocialLinks();
  const wa = whatsappLink("Hello ShriDev, I would like to discuss a project.");
  const { contact } = siteConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-hairline bg-surface/40">
      {/* Soft brand wash anchoring the foot of the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
      />

      <Shell>
        <div className="grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8 lg:py-20">
          {/* Brand column */}
          <div className="max-w-sm">
            <Logo markSize={32} showDescriptor />
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">
              {siteConfig.statement}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-faint">
              {contact.reach}
            </p>

            {socials.length > 0 || wa ? (
              <ul className="mt-7 flex items-center gap-2.5">
                {socials.map((social) => {
                  const Glyph = socialIcons[social.key];
                  return (
                    <li key={social.key}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${siteConfig.name} on ${social.label}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline bg-white/[0.03] text-ink-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/40 hover:text-ink"
                      >
                        <Glyph size={16} />
                      </a>
                    </li>
                  );
                })}
                {wa ? (
                  <li>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Message ${siteConfig.name} on WhatsApp`}
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline bg-white/[0.03] text-ink-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500/40 hover:text-ink"
                    >
                      <WhatsAppIcon size={16} />
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>

          {/* Link columns */}
          {footerNav.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink">
                {column.heading}
              </h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-muted transition-colors duration-200 hover:text-accent-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact strip — only rendered when something is configured. */}
        {contact.email || contact.phone || contact.location ? (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-hairline py-6 text-sm">
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 text-ink-muted transition-colors hover:text-ink"
              >
                <Icon name="Mail" size={15} className="text-accent-400" />
                {contact.email}
              </a>
            ) : null}
            {contact.phone ? (
              <a
                href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 text-ink-muted transition-colors hover:text-ink"
              >
                <Icon name="Phone" size={15} className="text-accent-400" />
                {contact.phone}
              </a>
            ) : null}
            {contact.location ? (
              <span className="inline-flex items-center gap-2 text-ink-muted">
                <Icon name="MapPin" size={15} className="text-accent-400" />
                {contact.location}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-hairline py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-faint">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <li>
              <Link href="/privacy-policy" className="text-ink-faint transition-colors hover:text-ink-muted">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-ink-faint transition-colors hover:text-ink-muted">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="text-ink-faint transition-colors hover:text-ink-muted">
                Sitemap
              </Link>
            </li>
          </ul>
        </div>
      </Shell>
    </footer>
  );
}
