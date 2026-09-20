import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/content/site";
import { services } from "@/content/services";
import { getPosts, getProjects } from "@/lib/api";

/**
 * Sitemap.
 *
 * Static routes come from the content modules; projects and articles are read
 * from the API so newly published content is included without a redeploy.
 * Example content (`is_placeholder`) is excluded — it should not be submitted
 * to search engines as though it were ShriDev editorial.
 */

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/solutions"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/projects"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/team"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/insights"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    {
      url: absoluteUrl("/start-project"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/privacy-policy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: absoluteUrl(`/services/${service.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Both helpers degrade to an empty list if the API is unreachable, so a
  // backend outage produces a smaller sitemap rather than a failed build.
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: absoluteUrl(`/projects/${project.slug}`),
    lastModified: new Date(project.updated_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => !post.is_placeholder)
    .map((post) => ({
      url: absoluteUrl(`/insights/${post.slug}`),
      lastModified: new Date(post.updated_at),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes, ...postRoutes];
}
