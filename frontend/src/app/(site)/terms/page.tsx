import { LegalPage, type LegalSection } from "@/components/ui/legal-layout";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/content/site";

export const metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "The terms governing use of the ShriDev website and the basis on which we discuss and deliver project work.",
  path: "/terms",
});

const contactLine = siteConfig.contact.email
  ? `Contact us at ${siteConfig.contact.email}.`
  : "Contact us through the enquiry form on this website.";

const sections: LegalSection[] = [
  {
    heading: "1. About these terms",
    paragraphs: [
      `These terms govern your use of this website. They are not the contract for any project work: engagements are governed by a separate written agreement signed by both parties. [Insert the registered legal entity name and registration details once available.]`,
    ],
  },
  {
    heading: "2. Using this website",
    bullets: [
      "You may browse the site and submit genuine project enquiries.",
      "You may not attempt to gain unauthorised access to any part of the site, its API or its infrastructure.",
      "You may not submit automated, fraudulent or abusive enquiries, or use the forms to distribute unsolicited material.",
      "You may not attempt to disrupt the availability of the site for others.",
    ],
  },
  {
    heading: "3. Information on this site",
    paragraphs: [
      "The content describes our capabilities and the way we work. It is provided for information and does not constitute a quotation, a guarantee of outcome, or professional advice for your specific situation.",
      "Estimates of scope, timeline or cost are given in writing for a specific requirement, and are not implied by anything on this website.",
    ],
  },
  {
    heading: "4. Project enquiries",
    paragraphs: [
      "Submitting an enquiry does not create a contract or oblige either party to proceed. We aim to respond to genuine enquiries, but we do not guarantee a response to every submission, and we may decline work.",
      "Please do not include confidential or sensitive information in the enquiry form. If your requirement needs to be discussed under a confidentiality agreement, say so and we will arrange one before you share details.",
    ],
  },
  {
    heading: "5. Intellectual property",
    paragraphs: [
      "The design, text, code and visual assets of this website belong to ShriDev unless stated otherwise. You may not reproduce substantial parts of it without permission.",
      "For client projects, ownership of the delivered work is set out in the engagement agreement. Our standard position is that the client owns the delivered source code, the data and the infrastructure accounts.",
    ],
  },
  {
    heading: "6. Case studies and client work",
    paragraphs: [
      "Projects shown on this site are published with the relevant client's agreement, or are our own work. Where results are described, they reflect what was actually measured; where no measurement exists, no figures are stated.",
      "Third-party names, logos and trademarks that appear remain the property of their respective owners.",
    ],
  },
  {
    heading: "7. External links",
    paragraphs: [
      "This site links to external websites and services we do not control. We are not responsible for their content, availability or practices.",
    ],
  },
  {
    heading: "8. Availability",
    paragraphs: [
      "We aim to keep the site available but do not guarantee uninterrupted access. We may change, suspend or withdraw any part of it without notice.",
    ],
  },
  {
    heading: "9. Liability",
    paragraphs: [
      "To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of this website. Nothing in these terms limits liability that cannot lawfully be limited. [Have a legal professional review this clause and insert an appropriate liability position.]",
    ],
  },
  {
    heading: "10. Governing law",
    paragraphs: [
      "These terms are governed by the laws of India, and the courts of [insert jurisdiction] have exclusive jurisdiction over any dispute arising from them.",
    ],
  },
  {
    heading: "11. Changes",
    paragraphs: [
      "We may update these terms. The version published on this page at the time you use the site is the one that applies.",
    ],
  },
  {
    heading: "12. Contact",
    paragraphs: [contactLine],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="[Insert date of legal review]"
      intro="The terms that apply to using this website, and the basis on which project enquiries are handled."
      crumbs={[{ label: "Terms & Conditions" }]}
      sections={sections}
    />
  );
}
