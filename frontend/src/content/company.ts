/**
 * Marketing content for the homepage, about page and shared sections.
 *
 * Kept as typed data rather than inline JSX so the same content can be reused
 * across pages and edited without touching layout code. All claims here are
 * capability-based: what we do and how we work, never counts of clients,
 * projects, awards or years we cannot evidence.
 */

export interface Capability {
  label: string;
  icon: string;
}

/** Strip directly beneath the hero. */
export const capabilityStrip: Capability[] = [
  { label: "Web Engineering", icon: "Globe" },
  { label: "AI & Machine Learning", icon: "BrainCircuit" },
  { label: "Data & Analytics", icon: "BarChart3" },
  { label: "Mobile Applications", icon: "Smartphone" },
  { label: "Automation", icon: "Workflow" },
  { label: "Cloud & APIs", icon: "CloudCog" },
];

export interface Solution {
  slug: string;
  title: string;
  description: string;
  icon: string;
  /** Concrete things the solution typically includes. */
  includes: string[];
}

export const solutions: Solution[] = [
  {
    slug: "business-platforms",
    title: "Business Platforms",
    description:
      "Custom systems for operations, workflows and internal teams, built around how the work is actually done.",
    icon: "Building2",
    includes: [
      "Role-based access for different teams",
      "Workflow states with a full history",
      "Reporting drawn from live operational data",
      "Integrations with the tools already in use",
    ],
  },
  {
    slug: "customer-portals",
    title: "Customer Portals",
    description:
      "Secure portals where customers, employees, vendors or partners can see their own records and act on them.",
    icon: "UserRoundCheck",
    includes: [
      "Authenticated accounts with scoped data access",
      "Document and record self-service",
      "Status tracking and notifications",
      "An admin view for your internal team",
    ],
  },
  {
    slug: "saas-products",
    title: "SaaS Products",
    description:
      "Subscription software with the architecture, billing and tenancy decisions made deliberately at the start.",
    icon: "Rocket",
    includes: [
      "Multi-tenant data model and isolation",
      "Subscription and billing integration",
      "Onboarding and account management",
      "Usage visibility for you and your customers",
    ],
  },
  {
    slug: "ai-applications",
    title: "AI-Powered Applications",
    description:
      "Applications where a model improves a real decision — prediction, ranking, extraction or assistance.",
    icon: "Sparkles",
    includes: [
      "Feasibility assessment against your data",
      "Model development and honest evaluation",
      "Inference served behind a validated API",
      "Predictions surfaced with usable context",
    ],
  },
  {
    slug: "analytics-platforms",
    title: "Analytics Platforms",
    description:
      "Dashboards and decision-support tools where the numbers reconcile and each metric is defined once.",
    icon: "LineChart",
    includes: [
      "Consolidation of scattered data sources",
      "Written, agreed metric definitions",
      "Scheduled pipelines with validation checks",
      "Focused views per audience, with export",
    ],
  },
  {
    slug: "ecommerce",
    title: "E-Commerce",
    description:
      "Commerce experiences with payment, inventory, fulfilment and back-office workflows that hold together.",
    icon: "ShoppingBag",
    includes: [
      "Catalogue, cart and checkout flows",
      "Payment gateway integration",
      "Inventory and order management",
      "Operational tooling for the team running it",
    ],
  },
];

export interface Outcome {
  title: string;
  description: string;
  detail: string;
  icon: string;
}

/** Business-outcome band on the homepage. */
export const outcomes: Outcome[] = [
  {
    title: "Launch",
    description: "Turn an idea into a working digital product.",
    detail:
      "Scope the first version around what has to be true for it to be useful, then build and deploy it rather than expanding it indefinitely.",
    icon: "Rocket",
  },
  {
    title: "Modernize",
    description: "Upgrade existing systems and improve user experience.",
    detail:
      "Assess what is worth keeping, replace what is holding the product back, and stage the work so the system keeps running throughout.",
    icon: "RefreshCw",
  },
  {
    title: "Automate",
    description: "Reduce repetitive manual work with software and AI.",
    detail:
      "Map the process as it runs today, automate the mechanical steps, and leave the judgement calls with people — with a log of every run.",
    icon: "Workflow",
  },
  {
    title: "Scale",
    description: "Build reliable architecture that can evolve with the business.",
    detail:
      "Make the data model, API boundaries and infrastructure decisions that let the next set of features be added without a rewrite.",
    icon: "TrendingUp",
  },
];

export interface ProcessPhase {
  index: string;
  title: string;
  summary: string;
  detail: string;
  /** What exists at the end of this phase. */
  artefacts: string[];
  icon: string;
}

export const processPhases: ProcessPhase[] = [
  {
    index: "01",
    title: "Discover",
    summary: "Understand goals, users and requirements.",
    detail:
      "We start with the problem rather than the solution: who uses the system, what they are trying to finish, what currently gets in the way, and what the business needs to be different afterwards. Constraints — budget, deadlines, existing systems, the people who will maintain it — are gathered here, because they shape everything downstream.",
    artefacts: [
      "Requirement summary",
      "User and stakeholder map",
      "Known constraints and risks",
    ],
    icon: "Search",
  },
  {
    index: "02",
    title: "Strategize",
    summary: "Define scope, architecture and roadmap.",
    detail:
      "We agree what is in the first release and what deliberately is not. The architecture is chosen against the actual requirements — data model, service boundaries, integration points, hosting — and written down with the reasoning, so later decisions have something to refer back to.",
    artefacts: [
      "Scope definition and phasing",
      "Architecture and data model outline",
      "Delivery plan with milestones",
    ],
    icon: "Map",
  },
  {
    index: "03",
    title: "Design",
    summary: "Create intuitive interfaces and product flows.",
    detail:
      "Interface work starts from the flows that matter most. We design the layout system — type scale, spacing, components, states — before designing screens, so the product stays coherent as it grows and the build has a clear specification to follow.",
    artefacts: [
      "Key screens and user flows",
      "Component and design-token set",
      "Responsive and accessibility rules",
    ],
    icon: "PenTool",
  },
  {
    index: "04",
    title: "Engineer",
    summary: "Build frontend, backend, data and AI systems.",
    detail:
      "We build in vertical slices: one complete feature through the interface, API and database, then the next. Work is reviewed, typed and tested as it goes, and every input is validated on the server regardless of what the browser already checked.",
    artefacts: [
      "Working features in a staging environment",
      "API documentation",
      "Versioned database migrations",
    ],
    icon: "Code2",
  },
  {
    index: "05",
    title: "Validate",
    summary: "Test functionality, responsiveness, performance and reliability.",
    detail:
      "Validation covers the paths users take and the ones they stumble into: failure states, slow networks, empty data, bad input. We check the full breakpoint range, keyboard navigation, contrast and reduced-motion behaviour, and measure performance before launch rather than after complaints.",
    artefacts: [
      "Test coverage of critical paths",
      "Cross-device and accessibility checks",
      "Performance measurements",
    ],
    icon: "ShieldCheck",
  },
  {
    index: "06",
    title: "Launch",
    summary: "Deploy the product to production.",
    detail:
      "Deployment is automated and rehearsed before it matters. Environments, secrets, domains, certificates, backups and monitoring are configured, the release is verified in production, and the rollback path is documented rather than improvised.",
    artefacts: [
      "Production environment and pipeline",
      "Backup and rollback procedure",
      "Monitoring and operational runbook",
    ],
    icon: "Rocket",
  },
  {
    index: "07",
    title: "Evolve",
    summary: "Maintain, improve and scale the system.",
    detail:
      "After launch the work is maintenance, measurement and the next increment: dependency and security updates, issues triaged against real usage, and improvements prioritised by what the running system shows rather than by what was assumed at the start.",
    artefacts: [
      "Support and update arrangement",
      "Prioritised improvement backlog",
      "Usage and error visibility",
    ],
    icon: "GitBranch",
  },
];

export interface Differentiator {
  title: string;
  description: string;
  icon: string;
}

export const differentiators: Differentiator[] = [
  {
    title: "Engineering Depth",
    description:
      "Strong full-stack capability across interface, API, database and deployment, so decisions between layers are made once rather than negotiated across handovers.",
    icon: "Layers",
  },
  {
    title: "AI Expertise",
    description:
      "Machine learning built into working applications — with a feasibility check first, and a clear answer when a simpler approach would serve you better.",
    icon: "BrainCircuit",
  },
  {
    title: "End-to-End Delivery",
    description:
      "One team from requirement gathering through design, engineering and testing to production deployment and handover.",
    icon: "Workflow",
  },
  {
    title: "Transparent Communication",
    description:
      "Defined scope, visible milestones and regular progress updates. When something slips or an estimate changes, you hear it early.",
    icon: "MessagesSquare",
  },
  {
    title: "Scalable Architecture",
    description:
      "Built for the current requirement while keeping the next one affordable — proportionate infrastructure, not premature complexity.",
    icon: "Network",
  },
  {
    title: "Long-Term Support",
    description:
      "Post-launch maintenance, dependency and security updates, and continued improvement based on how the system is actually used.",
    icon: "LifeBuoy",
  },
];

export interface TechCategory {
  category: string;
  description: string;
  items: string[];
  icon: string;
}

/**
 * Only technologies the team works with. Adding a logo here is a commitment to
 * support it, so this list stays deliberately shorter than it could be.
 */
export const techStack: TechCategory[] = [
  {
    category: "Frontend",
    description: "Interfaces that stay fast and accessible on real devices.",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    icon: "MonitorSmartphone",
  },
  {
    category: "Backend",
    description: "APIs with validation, auth and documentation built in.",
    items: ["Python", "FastAPI", "Django", "Node.js"],
    icon: "Server",
  },
  {
    category: "Data",
    description: "Relational by default, with versioned migrations.",
    items: ["PostgreSQL", "MySQL", "MongoDB", "SQL"],
    icon: "Database",
  },
  {
    category: "AI / ML",
    description: "From classical models to modern deep learning.",
    items: ["Python", "scikit-learn", "Pandas", "NumPy", "PyTorch", "TensorFlow"],
    icon: "BrainCircuit",
  },
  {
    category: "Deployment",
    description: "Repeatable pipelines sized to the product.",
    items: ["Vercel", "Render", "Docker", "GitHub Actions"],
    icon: "CloudCog",
  },
];

export interface Industry {
  name: string;
  description: string;
  icon: string;
}

/**
 * Presented as areas where we can build technology solutions — deliberately
 * not as specialised regulatory or compliance expertise.
 */
export const industries: Industry[] = [
  {
    name: "Startups",
    description:
      "First production versions, investor-ready products and the architecture decisions that avoid an early rewrite.",
    icon: "Rocket",
  },
  {
    name: "Education",
    description:
      "Learning platforms, admissions and administration systems, student portals and reporting.",
    icon: "GraduationCap",
  },
  {
    name: "Agriculture",
    description:
      "Advisory and decision-support tools, data collection in the field, and prediction from agronomic data.",
    icon: "Sprout",
  },
  {
    name: "Healthcare",
    description:
      "Practice and appointment systems, patient-facing portals and operational dashboards.",
    icon: "HeartPulse",
  },
  {
    name: "Retail & E-Commerce",
    description:
      "Storefronts, inventory and order management, and the back-office tooling that keeps them accurate.",
    icon: "ShoppingBag",
  },
  {
    name: "Professional Services",
    description:
      "Client portals, matter and project tracking, document workflows and time capture.",
    icon: "Briefcase",
  },
  {
    name: "Real Estate",
    description:
      "Listing platforms, enquiry and lead management, and site or inventory tracking.",
    icon: "Building2",
  },
  {
    name: "Manufacturing",
    description:
      "Production and inventory visibility, quality records, and integration between plant and office systems.",
    icon: "Factory",
  },
  {
    name: "NGOs & Social Impact",
    description:
      "Programme and beneficiary tracking, field data collection and reporting for funders.",
    icon: "HandHeart",
  },
  {
    name: "Local Businesses",
    description:
      "Booking, enquiry and customer-management systems that replace manual scheduling and follow-up.",
    icon: "Store",
  },
];

export interface EngagementModel {
  title: string;
  description: string;
  suitedTo: string;
  icon: string;
}

export const engagementModels: EngagementModel[] = [
  {
    title: "Fixed-Scope Project",
    description:
      "An agreed scope, milestone plan and price. Changes are handled as explicit, costed additions rather than absorbed quietly.",
    suitedTo: "Well-defined builds with a clear finish line.",
    icon: "ClipboardCheck",
  },
  {
    title: "Retained Team",
    description:
      "A recurring allocation of engineering capacity, planned in short cycles against a backlog you prioritise.",
    suitedTo: "Products under continuous development.",
    icon: "CalendarClock",
  },
  {
    title: "Discovery Engagement",
    description:
      "A short, paid piece of work producing a requirement summary, architecture outline and realistic estimate — with no obligation to continue.",
    suitedTo: "Ideas that need shaping before commitment.",
    icon: "Compass",
  },
  {
    title: "Support & Maintenance",
    description:
      "Ongoing updates, monitoring, incident response and small improvements to a system already in production.",
    suitedTo: "Live products that need to stay healthy.",
    icon: "LifeBuoy",
  },
];

export interface Principle {
  title: string;
  description: string;
}

/** Engineering principles, used on the About page. */
export const principles: Principle[] = [
  {
    title: "Understand before building",
    description:
      "Requirements are gathered from the people who will use the system, including the exceptions that never appear in a brief. A clear problem statement saves more time than any framework choice.",
  },
  {
    title: "Say what is not possible",
    description:
      "If the data will not support a model, a deadline is unrealistic, or an off-the-shelf tool would be cheaper than a custom build, we say so before work starts rather than after the invoice.",
  },
  {
    title: "Validate on the server",
    description:
      "Client-side checks are for user experience. Every input is validated again on the server, every protected route checks authorisation, and secrets live in environment configuration.",
  },
  {
    title: "Proportionate architecture",
    description:
      "Infrastructure is sized to the product in front of us and its realistic next year. Complexity added for a scale that may never arrive is a cost paid every day until then.",
  },
  {
    title: "Design for the next change",
    description:
      "Business software always changes. Schemas, API boundaries and components are shaped so the second and third versions are affordable, not just the first.",
  },
  {
    title: "Hand over properly",
    description:
      "Source code, schema documentation, deployment steps and infrastructure accounts belong to the client. A project is finished when another team could pick it up.",
  },
];

export interface Faq {
  question: string;
  answer: string;
}

export const generalFaqs: Faq[] = [
  {
    question: "What services does ShriDev provide?",
    answer:
      "Web and full-stack development, AI and machine learning, data and analytics, mobile applications, automation and integrations, cloud deployment, and custom software built around a specific business workflow. In practice most projects combine several of these.",
  },
  {
    question: "Can ShriDev build a complete product from an idea?",
    answer:
      "Yes. We work from the initial idea through requirement gathering, scoping, design, engineering, testing and production deployment. For early ideas we usually suggest starting with a short discovery engagement so the scope and estimate are based on something concrete.",
  },
  {
    question: "Can you work with an existing website or application?",
    answer:
      "Yes. We start with a review of the codebase, data model, hosting and dependencies, then propose either targeted improvements or a staged rebuild. We would rather improve a working system incrementally than recommend a rewrite that is not warranted.",
  },
  {
    question: "Do you provide AI and machine learning solutions?",
    answer:
      "Yes — predictive models, recommendation systems, natural language processing, computer vision and AI-assisted features inside applications. We assess feasibility against your actual data first, and we will tell you when a simpler rules-based approach would work better.",
  },
  {
    question: "Can you deploy the application?",
    answer:
      "Yes. Deployment is part of delivery, not a separate phase: hosting, managed database, environment configuration, domains and certificates, automated deploys, backups and monitoring. Accounts are created in your name so you retain ownership.",
  },
  {
    question: "Do you provide post-launch support?",
    answer:
      "Yes. We offer support arrangements covering dependency and security updates, monitoring, incident response and continued improvement. If you would rather your own team operate the system, we hand over documentation thorough enough for them to do that.",
  },
  {
    question: "How does a project begin?",
    answer:
      "Send a project enquiry describing what you need. We review it and get in touch to arrange a conversation about goals, constraints and timeline. From there we prepare a scope outline and estimate, and for larger or less defined work we usually propose a discovery engagement first.",
  },
  {
    question: "Can businesses request custom software?",
    answer:
      "Yes, and it is a large part of what we do. We help decide whether a custom build is genuinely justified — sometimes an existing product plus configuration is the better answer — and when it is, we model the workflow with the people who run it before writing code.",
  },
  {
    question: "Who owns the code and the data?",
    answer:
      "You do. The repository, the infrastructure accounts and the data are yours from the start, and the handover includes source code, schema documentation and deployment instructions.",
  },
  {
    question: "Where is ShriDev based, and who can you work with?",
    answer:
      "We are based in India and work with businesses, startups, organisations and individual founders remotely. Collaboration runs through scheduled calls, written updates and shared access to staging environments and repositories.",
  },
];
