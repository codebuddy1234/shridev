import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@/components/analytics";
import { JsonLd, organizationSchema } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/content/site";

/**
 * Fonts are self-hosted by next/font at build time — no runtime request to
 * Google, no layout shift, and `display: swap` so text is readable while the
 * webfont loads.
 */
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.descriptor}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.statement,
  applicationName: siteConfig.name,
  alternates: { canonical: absoluteUrl("/") },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.descriptor}`,
    description: siteConfig.statement,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  ...(siteConfig.analytics.googleSiteVerification
    ? { verification: { google: siteConfig.analytics.googleSiteVerification } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#070a12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <a href="#main" className="skip-link rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white">
          Skip to main content
        </a>

        <div className="flex min-h-dvh flex-col">
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>

        <JsonLd data={organizationSchema()} />
        <Analytics />
      </body>
    </html>
  );
}
