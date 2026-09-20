import { Suspense } from "react";
import { Hero } from "@/components/sections/hero";
import { CapabilityStrip } from "@/components/sections/capability-strip";
import { Intro } from "@/components/sections/intro";
import { ServicesGrid } from "@/components/sections/services-grid";
import { AiSection } from "@/components/sections/ai-section";
import { SolutionsGrid } from "@/components/sections/solutions-grid";
import { Outcomes } from "@/components/sections/outcomes";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { WhyShriDev } from "@/components/sections/why-shridev";
import { TechStack } from "@/components/sections/tech-stack";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Industries } from "@/components/sections/industries";
import { FaqSection } from "@/components/sections/faq-section";
import { CtaBand } from "@/components/sections/cta-band";
import { Shell } from "@/components/ui/shell";
import { Skeleton } from "@/components/ui/states";
import { JsonLd, faqSchema } from "@/lib/seo";
import { generalFaqs } from "@/content/company";

/**
 * Homepage.
 *
 * Long-form by design: a visitor should be able to understand the capability,
 * the way we work and the engagement path without leaving this page. The one
 * data-backed section (Selected work) is wrapped in Suspense so a slow API
 * never delays the rest of the page from streaming.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilityStrip />
      <Intro />
      <ServicesGrid />
      <AiSection />
      <Outcomes />
      <SolutionsGrid />
      <ProcessTimeline />
      <WhyShriDev />
      <TechStack />

      <Suspense fallback={<FeaturedProjectsSkeleton />}>
        <FeaturedProjects />
      </Suspense>

      <Industries />
      <FaqSection items={generalFaqs} />
      <CtaBand />

      <JsonLd data={faqSchema(generalFaqs)} />
    </>
  );
}

function FeaturedProjectsSkeleton() {
  return (
    <section className="section">
      <Shell>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-5 h-12 w-full max-w-lg" />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-96 w-full rounded-card" />
          ))}
        </div>
      </Shell>
    </section>
  );
}
