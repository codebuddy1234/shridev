import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/** Public site chrome: skip link, sticky navbar, main landmark and footer. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="skip-link rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white"
      >
        Skip to main content
      </a>

      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
