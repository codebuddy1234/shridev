import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/content/site";

interface PageMetaInput {
  title: string;
  description: string;
  /** Site-relative path, used for the canonical URL and OpenGraph URL. */
  path: string;
  /** Overrides the generated OG image. */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  keywords?: string[];
  /** Set for pages that should not appear in search results. */
  noIndex?: boolean;
}

/**
 * Builds a complete metadata object for a page: title, description, canonical
 * URL, OpenGraph and Twitter cards. Every route uses this so no page ships
 * without a canonical link or social preview.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  keywords,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? absoluteUrl("/opengraph-image");

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      ...(publishedTime ? { publishedTime } : {}),
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${siteConfig.name} — ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Organization structured data.
 *
 * Only fields backed by configured values are emitted. Contact details,
 * founding year and social profiles are omitted entirely when unset, so the
 * structured data never asserts business information we do not have.
 */
export function organizationSchema() {
  const socials = [
    siteConfig.social.linkedin,
    siteConfig.social.github,
    siteConfig.social.instagram,
    siteConfig.social.x,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.name,
    ...(siteConfig.legal.registeredName ? { legalName: siteConfig.legal.registeredName } : {}),
    url: siteConfig.url,
    description: siteConfig.statement,
    slogan: siteConfig.descriptor,
    logo: absoluteUrl("/favicon.svg"),
    ...(siteConfig.legal.foundingYear ? { foundingDate: siteConfig.legal.foundingYear } : {}),
    ...(socials.length ? { sameAs: socials } : {}),
    ...(siteConfig.contact.email || siteConfig.contact.phone
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "sales",
              ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
              ...(siteConfig.contact.phone ? { telephone: siteConfig.contact.phone } : {}),
              availableLanguage: ["English", "Hindi"],
            },
          ],
        }
      : {}),
    ...(siteConfig.contact.location
      ? { areaServed: siteConfig.contact.location }
      : { areaServed: "Worldwide" }),
    knowsAbout: [
      "Web Development",
      "Full-Stack Development",
      "Artificial Intelligence",
      "Machine Learning",
      "Data Analytics",
      "Mobile Application Development",
      "Workflow Automation",
      "Cloud Deployment",
      "Custom Software Development",
    ],
  };
}

/** Breadcrumb structured data for nested routes. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

/** FAQPage structured data, generated from the same content the page renders. */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Renders a JSON-LD script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Serialised server-side from our own typed objects, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
