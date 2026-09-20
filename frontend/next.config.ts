import type { NextConfig } from "next";

/**
 * Next.js configuration.
 *
 * Security headers are applied at the edge for every response. The
 * Content-Security-Policy is deliberately explicit about what is allowed
 * rather than permissive: Google Fonts is absent because next/font
 * self-hosts the files at build time, and connect-src only opens up for
 * analytics when an ID has actually been configured.
 */

const isProduction = process.env.NODE_ENV === "production";
const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
const clarityEnabled = Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);

const scriptSources = [
  "'self'",
  // Next.js inlines its bootstrap and React Server Component payload.
  "'unsafe-inline'",
  // Required by the Next.js dev overlay; omitted in production builds.
  ...(isProduction ? [] : ["'unsafe-eval'"]),
  ...(analyticsEnabled ? ["https://www.googletagmanager.com"] : []),
  ...(clarityEnabled ? ["https://www.clarity.ms"] : []),
];

const connectSources = [
  "'self'",
  ...(analyticsEnabled
    ? ["https://www.google-analytics.com", "https://analytics.google.com"]
    : []),
  ...(clarityEnabled ? ["https://www.clarity.ms", "https://c.clarity.ms"] : []),
];

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSources.join(" ")}`,
  // Tailwind and next/font emit inline style blocks.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(" ")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Switch off browser features the site never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Never leak the framework version in a response header.
  poweredByHeader: false,

  images: {
    // Explicit allow-list. Add the host serving your project and team images
    // here; an unlisted host is rejected rather than proxied.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimised variants for a day.
    minimumCacheTTL: 86400,
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The admin interface must never be indexed or cached by a proxy.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // A common guess for the enquiry page.
      { source: "/start-a-project", destination: "/start-project", permanent: true },
      { source: "/blog", destination: "/insights", permanent: true },
      { source: "/blog/:slug", destination: "/insights/:slug", permanent: true },
      { source: "/work", destination: "/projects", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
    ];
  },
};

export default nextConfig;
