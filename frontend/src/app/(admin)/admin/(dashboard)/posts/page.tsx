import Link from "next/link";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { PostActions } from "@/components/admin/post-actions";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { FormMessage } from "@/components/ui/field";
import { formatDateTime, truncate } from "@/lib/utils";
import { getAdminPosts } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import type { BlogPost } from "@/types/api";

export const metadata = { title: "Insights" };

export default async function AdminPostsPage() {
  const { token } = await requireAdmin("/admin/posts");

  let posts: BlogPost[] = [];
  let failed = false;

  try {
    posts = await getAdminPosts(token);
  } catch (error) {
    console.error("[admin-posts] load failed:", error);
    failed = true;
  }

  const placeholders = posts.filter((post) => post.is_placeholder && post.published);

  return (
    <div className="space-y-6">
      <AdminPageHeading
        title="Insights"
        description="Articles published on the public insights section."
        actions={
          <ButtonLink href="/admin/posts/new" size="sm">
            <Icon name="Plus" size={15} />
            New Article
          </ButtonLink>
        }
      />

      {placeholders.length > 0 ? (
        <FormMessage
          tone="info"
          title={`${placeholders.length} example article${placeholders.length === 1 ? " is" : "s are"} live`}
        >
          Articles marked as example content carry a visible notice on the
          public site and are excluded from search indexing. Replace or
          unpublish them before launch.
        </FormMessage>
      ) : null}

      {failed ? (
        <ErrorState
          title="Could not load articles"
          description="The API did not respond. Check that the backend is running, then reload."
          onRetry={
            <ButtonLink href="/admin/posts" size="sm" variant="secondary">
              <Icon name="RefreshCw" size={15} />
              Reload
            </ButtonLink>
          }
        />
      ) : posts.length === 0 ? (
        <EmptyState
          icon="FileText"
          title="No articles yet"
          description="Write an article here and it appears on the insights page as soon as you publish it."
          action={
            <ButtonLink href="/admin/posts/new" size="sm">
              <Icon name="Plus" size={15} />
              Write the first article
            </ButtonLink>
          }
        />
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-card border border-hairline bg-surface/40 p-5 transition-colors hover:border-hairline-strong"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-display text-base font-medium text-ink hover:text-accent-400"
                    >
                      {post.title}
                    </Link>
                    {post.published ? (
                      <Badge variant="positive" size="sm">Published</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Draft</Badge>
                    )}
                    {post.is_placeholder ? (
                      <Badge variant="warning" size="sm">Example</Badge>
                    ) : null}
                    {post.featured ? <Badge variant="brand" size="sm">Featured</Badge> : null}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {truncate(post.excerpt, 170)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-faint">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="Tag" size={12} />
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="Clock" size={12} />
                      {post.published_at
                        ? formatDateTime(post.published_at)
                        : `Draft · updated ${formatDateTime(post.updated_at)}`}
                    </span>
                  </div>
                </div>

                <PostActions post={post} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
