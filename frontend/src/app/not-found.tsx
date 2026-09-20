import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Shell } from "@/components/ui/shell";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { primaryNav } from "@/content/navigation";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * Global 404.
 *
 * Renders the site chrome itself rather than inheriting it, because the root
 * layout owns only the document shell — an unmatched URL is outside the
 * `(site)` route group, so navigation has to be supplied here.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main id="main" className="relative flex flex-1 items-center overflow-hidden py-20">
        <div
          aria-hidden="true"
          className="bg-grid pointer-events-none absolute inset-0 -z-10"
          style={{
            maskImage: "radial-gradient(55% 55% at 50% 40%, black, transparent)",
            WebkitMaskImage: "radial-gradient(55% 55% at 50% 40%, black, transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-80 w-[36rem] -translate-x-1/2 rounded-full opacity-50 blur-[110px]"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(109,93,251,0.26), transparent 70%)",
          }}
        />

        <Shell>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-sm tracking-[0.3em] text-accent-400">404</p>

            <h1 className="mt-6 text-display-2 text-ink">
              The page you&apos;re looking for doesn&apos;t exist.
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ink-muted">
              It may have been moved or renamed, or the link that brought you
              here may be out of date.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/" size="lg">
                <Icon name="ArrowLeft" size={17} />
                Back Home
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary" size="lg">
                Explore Services
                <Icon name="ArrowRight" size={17} className="btn-arrow" />
              </ButtonLink>
            </div>

            {/* Give the visitor somewhere to go rather than a dead end. */}
            <nav aria-label="Site sections" className="mt-14 border-t border-hairline pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Or try one of these
              </p>
              <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/[0.03] px-4 py-2 text-sm text-ink-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/40 hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/start-project"
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-2 text-sm text-accent-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-500/50"
                  >
                    Start a Project
                    <Icon name="ArrowRight" size={13} />
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </Shell>
      </main>

      <Footer />
    </div>
  );
}
