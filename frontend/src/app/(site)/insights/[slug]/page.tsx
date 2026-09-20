import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, Shell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { FormMessage } from "@/components/ui/field";
import { PostCard } from "@/components/ui/post-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Markdown, markdownToPlainText } from "@/lib/markdown";
import { CtaBand } from "@/components/sections/cta-band";
import { JsonLd, breadcrumbSchema, pageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/content/site";
import { getPost, getPosts } from "@/lib/api";
import { formatDate, readingTime, truncate } from "@/lib/utils";

export const revalidate = 120;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };

  return pageMetadata({
    title: post.title,
    description: truncate(post.excerpt, 158),
    path: `/insights/${post.slug}`,
    image: post.cover_url ?? undefined,
    type: "article",
    publishedTime: post.published_at ?? undefined,
    keywords: [post.category, ...post.tags],
    // Example content is deliberately kept out of the index — it should not
    // rank as though it were editorial ShriDev stands behind.
    noIndex: post.is_placeholder,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const plain = markdownToPlainText(post.content);
  const related = (await getPosts({ category: post.category, limit: 4 }))
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <article>
        {/* ---- Article header ---- */}
        <header className="relative overflow-hidden pb-10 pt-10 sm:pt-14">
          <div
            aria-hidden="true"
            className="bg-grid pointer-events-none absolute inset-0 -z-10"
            style={{
              maskImage: "radial-gradient(60% 70% at 30% 0%, black, transparent)",
              WebkitMaskImage: "radial-gradient(60% 70% at 30% 0%, black, transparent)",
            }}
          />

          <Shell>
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
                <li>
                  <Link href="/" className="transition-colors hover:text-ink-muted">
                    Home
                  </Link>
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="ChevronRight" size={12} className="opacity-50" />
                  <Link href="/insights" className="transition-colors hover:text-ink-muted">
                    Insights
                  </Link>
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="ChevronRight" size={12} className="opacity-50" />
                  <span aria-current="page" className="text-ink-muted">
                    {truncate(post.title, 48)}
                  </span>
                </li>
              </ol>
            </nav>

            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">{post.category}</Badge>
                {post.is_placeholder ? <Badge variant="warning">Example content</Badge> : null}
              </div>

              <h1 className="mt-6 text-display-2 text-ink">{post.title}</h1>
              <p className="mt-6 text-lg leading-relaxed text-ink-muted">{post.excerpt}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-faint">
                {post.author_name ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="User" size={14} />
                    {post.author_name}
                  </span>
                ) : null}
                {post.published_at ? (
                  <time dateTime={post.published_at} className="inline-flex items-center gap-1.5">
                    <Icon name="Calendar" size={14} />
                    {formatDate(post.published_at)}
                  </time>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="Clock" size={14} />
                  {readingTime(plain)}
                </span>
              </div>
            </div>
          </Shell>
        </header>

        {post.cover_url ? (
          <Shell>
            <div className="relative aspect-[21/9] overflow-hidden rounded-panel border border-hairline bg-surface-2">
              <Image
                src={post.cover_url}
                alt=""
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1216px"
                className="object-cover"
              />
            </div>
          </Shell>
        ) : null}

        {/* ---- Body ---- */}
        <Section tight>
          <Shell>
            <div className="max-w-3xl">
              {post.is_placeholder ? (
                <FormMessage tone="info" title="This is example content" className="mb-10">
                  This article was seeded with the initial installation to
                  demonstrate the article layout. It was not written or
                  published as ShriDev editorial. It is excluded from search
                  indexing and can be replaced or removed from the admin
                  dashboard.
                </FormMessage>
              ) : null}

              <Markdown content={post.content} />

              {post.tags.length ? (
                <ul className="mt-14 flex flex-wrap gap-2 border-t border-hairline pt-8">
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="default" size="sm">
                        <Icon name="Tag" size={11} />
                        {tag}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-10 border-t border-hairline pt-8">
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-2 text-sm text-accent-400 transition-colors hover:text-accent-300"
                >
                  <Icon name="ArrowLeft" size={15} />
                  All insights
                </Link>
              </div>
            </div>
          </Shell>
        </Section>
      </article>

      {related.length ? (
        <Section tight className="border-t border-hairline">
          <Shell>
            <SectionHeader
              eyebrow="Related"
              title={`More in ${post.category}`}
              titleClassName="text-display-3"
            />
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id} className="flex">
                  <PostCard post={item} />
                </li>
              ))}
            </ul>
          </Shell>
        </Section>
      ) : null}

      <CtaBand />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Insights", path: "/insights" },
          { name: post.title, path: `/insights/${post.slug}` },
        ])}
      />
      {/* Example content is excluded from Article structured data as well as
          from the search index. */}
      {!post.is_placeholder ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            url: absoluteUrl(`/insights/${post.slug}`),
            ...(post.cover_url ? { image: post.cover_url } : {}),
            ...(post.published_at ? { datePublished: post.published_at } : {}),
            dateModified: post.updated_at,
            author: { "@type": "Organization", name: post.author_name ?? siteConfig.name },
            publisher: { "@id": absoluteUrl("/#organization") },
            keywords: post.tags.join(", "),
            articleSection: post.category,
          }}
        />
      ) : null}
    </>
  );
}
