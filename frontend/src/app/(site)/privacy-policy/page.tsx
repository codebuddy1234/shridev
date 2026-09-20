import { LegalPage, type LegalSection } from "@/components/ui/legal-layout";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/content/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How ShriDev collects, uses, stores and protects the information submitted through this website.",
  path: "/privacy-policy",
});

const contactLine = siteConfig.contact.email
  ? `Contact us at ${siteConfig.contact.email}.`
  : "Contact us through the enquiry form on this website.";

const sections: LegalSection[] = [
  {
    heading: "1. Who we are",
    paragraphs: [
      `ShriDev ("we", "us") provides software engineering and AI development services. [Insert the registered legal entity name, registration number and registered address once available.]`,
      "This policy explains what information this website collects, why, and what we do with it.",
    ],
  },
  {
    heading: "2. Information you give us",
    paragraphs: [
      "When you submit the project enquiry form, we collect only the fields on that form:",
    ],
    bullets: [
      "Your name and email address, which are required so we can reply.",
      "Optionally: phone or WhatsApp number, company or organisation name.",
      "Details about your requirement — the service, project type, estimated budget, expected timeline and your description of the project.",
      "Your preferred contact method and, optionally, how you heard about us.",
    ],
  },
  {
    heading: "3. Information collected automatically",
    paragraphs: [
      "Our servers record standard request information, including IP address, for security purposes — specifically to apply rate limiting that prevents automated abuse of the enquiry form and the admin login.",
      "If web analytics are enabled on this site, they are configured with IP anonymisation. Analytics are only active when a measurement ID has been configured; where none is set, no analytics scripts are loaded at all.",
      "This site does not use advertising cookies or third-party tracking pixels.",
    ],
  },
  {
    heading: "4. How we use your information",
    bullets: [
      "To respond to your enquiry and discuss your requirement.",
      "To prepare a scope outline, proposal or estimate at your request.",
      "To manage the relationship if we go on to work together.",
      "To protect the website from automated abuse.",
    ],
    paragraphs: [
      "We do not sell your information, and we do not share it with third parties for their own marketing. We do not send marketing email to addresses collected through the enquiry form.",
    ],
  },
  {
    heading: "5. Legal basis",
    paragraphs: [
      "Where data protection law requires a legal basis, we rely on your consent when you choose to submit the form, and on our legitimate interest in responding to business enquiries and keeping the website secure.",
    ],
  },
  {
    heading: "6. Where your information is stored",
    paragraphs: [
      "Enquiries are stored in a PostgreSQL database hosted by our infrastructure provider. [Insert hosting provider and data region once the production environment is confirmed.] Access is restricted to authenticated ShriDev administrators.",
    ],
  },
  {
    heading: "7. How long we keep it",
    paragraphs: [
      "We keep enquiry records for as long as needed to respond and, where a project follows, for the duration of the engagement and any period required for business or tax records. [Insert the specific retention period once decided.] You can ask us to delete your enquiry sooner.",
    ],
  },
  {
    heading: "8. Your rights",
    paragraphs: [
      "Subject to applicable law, you may ask us to give you a copy of the information we hold about you, correct it if it is inaccurate, delete it, or restrict how we use it. You may also object to our processing.",
      contactLine,
    ],
  },
  {
    heading: "9. Security",
    paragraphs: [
      "We apply reasonable technical measures to protect the information submitted through this site: encrypted connections, hashed administrator passwords, authentication on every non-public endpoint, server-side validation of all input, and rate limiting on public forms.",
      "No system can be guaranteed completely secure. If a breach affecting your information occurs, we will act on it and notify you where the law requires.",
    ],
  },
  {
    heading: "10. Third-party links",
    paragraphs: [
      "This site links to external services such as code repositories and social profiles. Those services have their own privacy policies, which we do not control.",
    ],
  },
  {
    heading: "11. Changes to this policy",
    paragraphs: [
      "If we change this policy we will update the date at the top of this page. Material changes will be highlighted on the site.",
    ],
  },
  {
    heading: "12. Contact",
    paragraphs: [contactLine],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="[Insert date of legal review]"
      intro="What this website collects, why it collects it, and what we do with it."
      crumbs={[{ label: "Privacy Policy" }]}
      sections={sections}
    />
  );
}
