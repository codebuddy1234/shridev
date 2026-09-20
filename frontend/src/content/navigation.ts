import { serviceGroups, services } from "@/content/services";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface MegaMenuColumn {
  heading: string;
  links: NavLink[];
}

/** Primary navbar items. Kept deliberately short to avoid crowding. */
export const primaryNav: NavLink[] = [
  { label: "Services", href: "/services" },
  { label: "Solutions", href: "/solutions" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

/** Services mega menu, derived from the service catalogue. */
export const servicesMegaMenu: MegaMenuColumn[] = serviceGroups.map(({ group, slugs }) => ({
  heading: group,
  links: slugs.map((slug) => {
    const service = services.find((item) => item.slug === slug)!;
    return {
      label: service.name,
      href: `/services/${service.slug}`,
      description: service.menuBlurb,
    };
  }),
}));

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Services",
    links: [
      { label: "Web Development", href: "/services/web-development" },
      { label: "Full-Stack Development", href: "/services/full-stack-development" },
      { label: "AI & Machine Learning", href: "/services/ai-machine-learning" },
      { label: "Data & Analytics", href: "/services/data-analytics" },
      { label: "Mobile Development", href: "/services/mobile-development" },
      { label: "Automation", href: "/services/automation" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Team", href: "/team" },
      { label: "Insights", href: "/insights" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Start a Project", href: "/start-project" },
      { label: "Solutions", href: "/solutions" },
      { label: "FAQ", href: "/#faq" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];
