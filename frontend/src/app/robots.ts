import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/content/site";

/**
 * robots.txt.
 *
 * The admin interface and the API route handlers are disallowed. That is a
 * crawler instruction, not a security control — the middleware and the API's
 * own authentication are what actually protect those paths.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
