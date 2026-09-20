/**
 * Service catalogue.
 *
 * This module is the single source of truth for the services mega menu, the
 * /services index, every /services/[slug] detail page, the homepage service
 * grid and the enquiry form's service dropdown. Editing an entry here updates
 * all of them, and adding one only requires a new object in `services`.
 *
 * Copy rule: describe what we actually build. No superlatives, no metrics we
 * cannot evidence, no technologies the team does not work with.
 */

export type ServiceSlug =
  | "web-development"
  | "full-stack-development"
  | "ai-machine-learning"
  | "data-analytics"
  | "mobile-development"
  | "automation"
  | "cloud-deployment"
  | "custom-software";

export type ServiceGroup = "Engineering" | "AI & Data" | "Infrastructure";

export interface ServiceDeliverable {
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  /** Two-digit index rendered on cards, e.g. "01". */
  index: string;
  slug: ServiceSlug;
  /** Short label for navigation and dropdowns. */
  name: string;
  /** Longer label used as the page H1. */
  headline: string;
  /** One line for the mega menu. */
  menuBlurb: string;
  /** Two to three lines for cards and the services index. */
  summary: string;
  /** Opening paragraph on the detail page. */
  intro: string;
  group: ServiceGroup;
  /** Lucide icon name, resolved through components/ui/icon.tsx. */
  icon: string;
  /** Technology chips shown on cards. Keep to what we genuinely use. */
  tags: string[];
  /** What we actually hand over. */
  deliverables: ServiceDeliverable[];
  /** Typical problems this service is chosen to solve. */
  useCases: string[];
  /** Working approach, rendered as an ordered list. */
  approach: string[];
  /** Service-specific questions, merged into the page FAQ. */
  faqs: ServiceFaq[];
  /** Slugs of two related services, rendered at the foot of the page. */
  related: ServiceSlug[];
}

export const services: Service[] = [
  {
    index: "01",
    slug: "web-development",
    name: "Web Development",
    headline: "Web development that holds up in production",
    menuBlurb: "Corporate sites, portals and custom web applications.",
    summary:
      "Corporate websites, portals, dashboards, custom web applications and high-performance digital experiences.",
    intro:
      "We build web interfaces that stay fast on real networks and real devices. That means server-rendered pages where they help, measured bundle sizes, accessible markup, and a component structure your team can extend without rewriting it.",
    group: "Engineering",
    icon: "Globe",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    deliverables: [
      {
        title: "Responsive interface build",
        description:
          "Every layout implemented from 320px upward, with keyboard navigation and visible focus states throughout.",
      },
      {
        title: "Component library",
        description:
          "A typed, documented set of shared components so future pages reuse the design system instead of forking it.",
      },
      {
        title: "Content structure",
        description:
          "Content modelled so marketing copy, projects or posts can be edited without a code change.",
      },
      {
        title: "SEO and metadata",
        description:
          "Per-page titles, descriptions, OpenGraph tags, canonical URLs, sitemap and robots configuration.",
      },
      {
        title: "Performance budget",
        description:
          "Images sized and lazy-loaded, fonts optimised, JavaScript split per route, Core Web Vitals checked before launch.",
      },
    ],
    useCases: [
      "A company site that currently loads slowly or looks dated on mobile",
      "A customer-facing portal behind a login",
      "An internal dashboard replacing a spreadsheet workflow",
      "A marketing site that needs to be editable without a developer",
    ],
    approach: [
      "Map the pages, content types and user journeys before any interface work starts.",
      "Design the layout system — spacing, type scale, components — so pages stay consistent as they multiply.",
      "Build with server rendering by default and add client interactivity only where it earns its cost.",
      "Test across the breakpoint range, with a keyboard, and with reduced-motion enabled.",
      "Deploy behind a CDN with preview environments for review.",
    ],
    faqs: [
      {
        question: "Can you work with our existing website?",
        answer:
          "Yes. We start by reviewing the current codebase, hosting and content, then propose either targeted improvements or a staged rebuild — whichever gives you more for the effort involved.",
      },
      {
        question: "Will we be able to edit content ourselves?",
        answer:
          "Yes. Content that changes regularly is modelled so it can be edited through an admin interface or structured content files rather than by editing source code.",
      },
    ],
    related: ["full-stack-development", "cloud-deployment"],
  },
  {
    index: "02",
    slug: "full-stack-development",
    name: "Full-Stack Development",
    headline: "One team across the interface, the API and the database",
    menuBlurb: "Frontend, API, database, auth and deployment as one delivery.",
    summary:
      "Complete frontend, backend, database, API, authentication and deployment solutions delivered as a single system.",
    intro:
      "Most product problems live between layers — the API shape that makes the interface awkward, the schema that makes a feature expensive. We work across the whole stack so those decisions are made once, deliberately, rather than negotiated across handovers.",
    group: "Engineering",
    icon: "Layers",
    tags: ["Next.js", "FastAPI", "PostgreSQL", "TypeScript", "Python"],
    deliverables: [
      {
        title: "Data model and migrations",
        description:
          "A normalised schema with versioned migrations, so the database can evolve safely after launch.",
      },
      {
        title: "Typed API layer",
        description:
          "Documented REST endpoints with request and response validation on the server, not only in the browser.",
      },
      {
        title: "Authentication and authorisation",
        description:
          "Password hashing, session or token handling, and role checks enforced server-side on every protected route.",
      },
      {
        title: "Application interface",
        description:
          "The product surface built against the real API, including loading, empty, error and success states.",
      },
      {
        title: "Deployment pipeline",
        description:
          "Environment configuration, database provisioning and a repeatable path from commit to production.",
      },
    ],
    useCases: [
      "A new product that needs its first production-ready version",
      "An internal tool with real users, permissions and audit requirements",
      "A prototype that now has to be rebuilt properly",
      "A system where frontend and backend work has drifted apart",
    ],
    approach: [
      "Agree the domain model first — entities, relationships and the rules that govern them.",
      "Define the API contract before building either side against it.",
      "Build vertically: one complete feature end to end, then the next.",
      "Validate every input on the server and handle failure paths explicitly.",
      "Ship to a staging environment early so feedback comes from a running system.",
    ],
    faqs: [
      {
        question: "Do you work on existing codebases?",
        answer:
          "Yes. We begin with a review of the repository, data model and deployment setup, then agree on where to intervene. We would rather improve a working system incrementally than argue for a rewrite that is not needed.",
      },
      {
        question: "Which backend stack do you use?",
        answer:
          "Python with FastAPI and PostgreSQL is our default, and we also work with Node.js and Django. If your team already maintains a stack, we work within it rather than introducing a second one.",
      },
    ],
    related: ["web-development", "cloud-deployment"],
  },
  {
    index: "03",
    slug: "ai-machine-learning",
    name: "AI & Machine Learning",
    headline: "Machine learning applied where it changes a decision",
    menuBlurb: "Prediction, NLP, computer vision and AI-enabled applications.",
    summary:
      "Machine learning models, predictive systems, recommendation systems, NLP, computer vision and AI-enabled applications.",
    intro:
      "A model is only useful when its output reaches the person or process that acts on it. We start from the decision you want to improve, check whether the available data can support it, and build the smallest system that delivers a usable answer — then integrate it into the product properly.",
    group: "AI & Data",
    icon: "BrainCircuit",
    tags: ["Python", "scikit-learn", "PyTorch", "Pandas", "FastAPI"],
    deliverables: [
      {
        title: "Feasibility assessment",
        description:
          "An honest read on whether your data supports the problem, and what an achievable baseline looks like.",
      },
      {
        title: "Data pipeline",
        description:
          "Reproducible cleaning, feature engineering and dataset versioning, so results can be rebuilt rather than remembered.",
      },
      {
        title: "Model development",
        description:
          "Baseline first, then iteration, with evaluation metrics chosen for the actual decision rather than for the headline number.",
      },
      {
        title: "Inference service",
        description:
          "The model served behind a documented API with validation, timeouts and clear failure behaviour.",
      },
      {
        title: "Application integration",
        description:
          "Predictions surfaced in the interface with the context and confidence a user needs to act on them.",
      },
    ],
    useCases: [
      "Forecasting demand, load or risk from historical records",
      "Recommending items, content or next actions to a user",
      "Extracting structure from documents, messages or free text",
      "Classifying or detecting objects in images",
      "Adding an assistant or retrieval-based answering to an existing product",
    ],
    approach: [
      "Define the decision the model supports and how success will be measured.",
      "Audit the data honestly — volume, quality, labelling and bias — before promising an outcome.",
      "Establish a simple baseline so every later improvement can be measured against something.",
      "Evaluate on held-out data that reflects production conditions, not a favourable split.",
      "Deploy behind an API, then monitor inputs and outputs after launch.",
    ],
    faqs: [
      {
        question: "What if we are not sure our data is good enough?",
        answer:
          "That is a normal starting point, and it is worth answering before committing to a build. We can run a short assessment on a sample and tell you plainly whether the problem is solvable with what you have, what would need to change, or whether a rules-based approach would serve you better.",
      },
      {
        question: "Do you work with large language models?",
        answer:
          "Yes, where they fit the problem — document question answering, summarisation, extraction and assistant interfaces. We are equally willing to say when a smaller classical model is cheaper, faster and more predictable.",
      },
    ],
    related: ["data-analytics", "automation"],
  },
  {
    index: "04",
    slug: "data-analytics",
    name: "Data & Analytics",
    headline: "Reporting people actually open",
    menuBlurb: "Pipelines, dashboards and decision-support reporting.",
    summary:
      "Data processing, exploratory analysis, business dashboards, reporting and decision-support solutions.",
    intro:
      "Dashboards fail when they answer questions nobody asked. We work backwards from the recurring decisions in your business, define the metrics that inform them, and build reporting that is trusted because the numbers reconcile.",
    group: "AI & Data",
    icon: "BarChart3",
    tags: ["Python", "Pandas", "PostgreSQL", "SQL"],
    deliverables: [
      {
        title: "Data consolidation",
        description:
          "Sources brought together into one queryable store, with the joins and assumptions written down.",
      },
      {
        title: "Metric definitions",
        description:
          "Each figure defined once, in plain language, so two teams cannot report different numbers for the same thing.",
      },
      {
        title: "Processing pipeline",
        description:
          "Scheduled cleaning and transformation with validation checks that surface bad data instead of hiding it.",
      },
      {
        title: "Dashboards",
        description:
          "Focused views built for a specific audience, with filtering, drill-down and export where it is genuinely needed.",
      },
      {
        title: "Analysis write-up",
        description:
          "Findings explained in business language, including what the data does not support.",
      },
    ],
    useCases: [
      "Operational reporting assembled by hand in spreadsheets each week",
      "Figures that disagree between teams or systems",
      "A need to understand customer, sales or usage patterns before investing",
      "Management reporting that needs to be repeatable rather than heroic",
    ],
    approach: [
      "Start from the decisions and the audience, not the chart library.",
      "Profile the source data and document its quality before building on it.",
      "Define and agree each metric in writing.",
      "Build the pipeline so it can be re-run and reconciled.",
      "Design views that answer one question well rather than twenty vaguely.",
    ],
    faqs: [
      {
        question: "Our data is spread across several systems. Is that a problem?",
        answer:
          "It is the usual situation. The first phase is consolidation — pulling the sources into one place and resolving the differences between them. That work is visible in the estimate rather than hidden inside it.",
      },
      {
        question: "Can dashboards update automatically?",
        answer:
          "Yes, where the source systems allow scheduled or API access. Where they do not, we design a low-friction import step instead of pretending the data arrives on its own.",
      },
    ],
    related: ["ai-machine-learning", "automation"],
  },
  {
    index: "05",
    slug: "mobile-development",
    name: "Mobile Development",
    headline: "Mobile applications built on a shared foundation",
    menuBlurb: "Android and cross-platform mobile experiences.",
    summary:
      "Modern Android and cross-platform mobile experiences that share a backend with your web product.",
    intro:
      "Mobile is usually a second surface on an existing system, not a separate product. We design the API and data model so the app, the web interface and any internal tooling draw on the same source of truth — which keeps behaviour consistent and the cost of the second platform down.",
    group: "Engineering",
    icon: "Smartphone",
    tags: ["React Native", "TypeScript", "Android", "REST APIs"],
    deliverables: [
      {
        title: "Mobile interface",
        description:
          "Screens built to platform conventions, with touch targets, safe areas and typography sized for handheld use.",
      },
      {
        title: "Shared API integration",
        description:
          "The app consuming the same validated API as your web product, with typed clients on both sides.",
      },
      {
        title: "Offline and error handling",
        description:
          "Sensible behaviour when the network is slow or absent, rather than an indefinite spinner.",
      },
      {
        title: "Authentication",
        description:
          "Secure sign-in with token storage handled according to platform guidance.",
      },
      {
        title: "Release preparation",
        description:
          "Build configuration, signing, store assets and a documented release process.",
      },
    ],
    useCases: [
      "An existing web product that needs a companion mobile app",
      "A field or on-site workflow that is impractical on a desktop",
      "A customer-facing app requiring notifications or device features",
      "An internal tool for staff working away from a computer",
    ],
    approach: [
      "Decide honestly whether a responsive web app would serve the need better.",
      "Design the API contract so mobile is a first-class consumer, not an afterthought.",
      "Build the core flow end to end before expanding the screen count.",
      "Test on real devices across screen sizes and OS versions.",
      "Document the build and release process so it is repeatable.",
    ],
    faqs: [
      {
        question: "Do we need a native app, or is a web app enough?",
        answer:
          "It depends on whether you need device capabilities, offline use or a store presence. If a responsive web application would meet the requirement, we will say so — it is usually faster to build and simpler to maintain.",
      },
      {
        question: "Do you publish to the app stores?",
        answer:
          "We prepare the builds, signing configuration and store assets, and support the submission. The developer accounts stay in your name so you retain ownership of the listings.",
      },
    ],
    related: ["full-stack-development", "cloud-deployment"],
  },
  {
    index: "06",
    slug: "automation",
    name: "Automation & Integrations",
    headline: "Remove the manual step, keep the audit trail",
    menuBlurb: "API integrations and workflow automation.",
    summary:
      "API integrations, workflow automation and custom business process solutions that reduce repetitive manual work.",
    intro:
      "Most operational drag comes from data being moved between systems by hand. We map the workflow as it actually runs, automate the mechanical parts, and leave the judgement calls with people — with logging so anyone can see what happened and why.",
    group: "AI & Data",
    icon: "Workflow",
    tags: ["Python", "FastAPI", "REST APIs", "Webhooks", "PostgreSQL"],
    deliverables: [
      {
        title: "Process map",
        description:
          "The current workflow documented step by step, including the exceptions people handle informally.",
      },
      {
        title: "Integration layer",
        description:
          "Authenticated connections between systems, with retries, rate-limit handling and clear failure states.",
      },
      {
        title: "Automated workflow",
        description:
          "Scheduled or event-driven execution of the repetitive steps, with human approval where judgement is required.",
      },
      {
        title: "Notifications",
        description:
          "Alerts to the right people when something needs attention or a run fails.",
      },
      {
        title: "Run history",
        description:
          "A log of what ran, what it changed and what failed, so the automation can be trusted and audited.",
      },
    ],
    useCases: [
      "Copying records between a CRM, a spreadsheet and an accounting system",
      "Generating recurring documents or reports by hand",
      "Enquiries or orders re-keyed from email into an internal system",
      "Approval chains tracked informally over chat",
    ],
    approach: [
      "Observe the process as it is actually performed, including the workarounds.",
      "Quantify the manual effort so the automation can be prioritised honestly.",
      "Automate the highest-volume, lowest-judgement step first.",
      "Make every run observable, reversible where possible, and safe to retry.",
      "Hand over documentation so the workflow can be adjusted without us.",
    ],
    faqs: [
      {
        question: "What if a system we use has no API?",
        answer:
          "We check what integration surface exists — API, webhooks, scheduled export, database access — and design around it. Where nothing suitable exists, we say so rather than building something fragile that breaks on the vendor's next update.",
      },
      {
        question: "Will automation replace people's jobs?",
        answer:
          "In the work we do, it usually removes re-keying and chasing rather than roles. We deliberately keep decisions that need judgement or accountability with a person, with the system preparing the information they need.",
      },
    ],
    related: ["ai-machine-learning", "custom-software"],
  },
  {
    index: "07",
    slug: "cloud-deployment",
    name: "Cloud & Deployment",
    headline: "A production setup you can operate",
    menuBlurb: "Hosting, databases, CI/CD and application infrastructure.",
    summary:
      "Production deployment, databases, hosting, APIs, CI/CD and application infrastructure sized to the product.",
    intro:
      "Infrastructure should be proportionate. We set up hosting, a managed database, automated deployments, backups and monitoring at a scale that matches the product — and document it so your team can operate it without us in the room.",
    group: "Infrastructure",
    icon: "CloudCog",
    tags: ["Vercel", "Render", "Docker", "PostgreSQL", "GitHub Actions"],
    deliverables: [
      {
        title: "Environment setup",
        description:
          "Separate development, staging and production environments with configuration held in environment variables, never in the repository.",
      },
      {
        title: "Deployment pipeline",
        description:
          "Automated build, checks and deploy on merge, with a documented rollback path.",
      },
      {
        title: "Managed database",
        description:
          "Provisioned PostgreSQL with migrations, scheduled backups and a tested restore procedure.",
      },
      {
        title: "Domains and certificates",
        description:
          "DNS, HTTPS and redirects configured correctly, including the www and apex behaviour.",
      },
      {
        title: "Monitoring and runbook",
        description:
          "Uptime and error visibility, plus written operational steps for the situations that actually occur.",
      },
    ],
    useCases: [
      "An application that runs locally but has never been deployed",
      "Manual deployments that are slow or risky",
      "A database with no verified backup",
      "Hosting that has outgrown its original setup",
    ],
    approach: [
      "Size the infrastructure to the current product and its realistic next year.",
      "Move every secret into environment configuration and rotate anything exposed.",
      "Automate the deploy so it is repeatable and boring.",
      "Set up backups and then test a restore — an untested backup is not a backup.",
      "Write the runbook for the person who will be on call, not for us.",
    ],
    faqs: [
      {
        question: "Which hosting providers do you work with?",
        answer:
          "Vercel for Next.js frontends, and Render, Railway or an equivalent container host for Python APIs, with managed PostgreSQL alongside. We also work with the major cloud providers where a project already runs on one.",
      },
      {
        question: "Do you provide ongoing infrastructure management?",
        answer:
          "We offer a support arrangement covering updates, monitoring and incident response. We can equally hand over full documentation so your own team operates it — the accounts stay in your name either way.",
      },
    ],
    related: ["full-stack-development", "web-development"],
  },
  {
    index: "08",
    slug: "custom-software",
    name: "Custom Software",
    headline: "Software shaped around how your business actually works",
    menuBlurb: "Systems built around a specific operational workflow.",
    summary:
      "Software designed around a specific business workflow or operational need, where off-the-shelf tools do not fit.",
    intro:
      "Custom software is worth building when a process is genuinely specific to your business and the workarounds are costing more than the build would. We help make that judgement honestly first, then build the system around the workflow rather than forcing the workflow into a product.",
    group: "Engineering",
    icon: "Boxes",
    tags: ["Python", "FastAPI", "Next.js", "PostgreSQL"],
    deliverables: [
      {
        title: "Requirement analysis",
        description:
          "The process documented with the people who run it, including the exceptions that never make it into a brief.",
      },
      {
        title: "Domain model",
        description:
          "Entities, relationships and business rules defined explicitly, so the software encodes how your organisation works.",
      },
      {
        title: "Roles and permissions",
        description:
          "Access designed around real responsibilities and enforced on the server for every action.",
      },
      {
        title: "Working system",
        description:
          "The application built in vertical slices, so you review real functionality throughout rather than at the end.",
      },
      {
        title: "Handover",
        description:
          "Source code, schema documentation, deployment guide and user-facing instructions.",
      },
    ],
    useCases: [
      "A workflow held together by spreadsheets and shared inboxes",
      "An off-the-shelf tool that covers half the process",
      "A legacy internal system nobody can safely change",
      "A compliance or record-keeping requirement with no product that fits",
    ],
    approach: [
      "Confirm that custom software is the right answer before proposing one.",
      "Model the domain with the people who do the work daily.",
      "Deliver in slices so value arrives before the project ends.",
      "Design for the next change, since operational software always changes.",
      "Hand over documentation thorough enough for another team to pick up.",
    ],
    faqs: [
      {
        question: "How do we know custom software is justified?",
        answer:
          "Usually it is not, and we will tell you when an existing product plus configuration would be cheaper. It becomes justified when the process is genuinely particular to your business, the manual effort is measurable, or the available tools each cover only part of the workflow.",
      },
      {
        question: "Who owns the code?",
        answer:
          "You do. The repository, the infrastructure accounts and the data are yours, and the handover is written so another team could take over the system.",
      },
    ],
    related: ["full-stack-development", "automation"],
  },
];

/** Grouped view used by the navbar mega menu. */
export const serviceGroups: { group: ServiceGroup; slugs: ServiceSlug[] }[] = [
  {
    group: "Engineering",
    slugs: ["web-development", "full-stack-development", "mobile-development"],
  },
  {
    group: "AI & Data",
    slugs: ["ai-machine-learning", "data-analytics", "automation"],
  },
  {
    group: "Infrastructure",
    slugs: ["cloud-deployment", "custom-software"],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function servicesBySlug(slugs: readonly ServiceSlug[]): Service[] {
  return slugs
    .map((slug) => services.find((service) => service.slug === slug))
    .filter((service): service is Service => Boolean(service));
}

/** Options for the enquiry form's service dropdown. */
export const serviceEnquiryOptions = [
  ...services.map((service) => ({ value: service.slug, label: service.name })),
  { value: "other", label: "Other" },
] as const;
