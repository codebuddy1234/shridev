import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { PostForm } from "@/components/admin/post-form";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { getAdminPosts } from "@/lib/api";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "Edit article" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();

  const { token } = await requireAdmin(`/admin/posts/${id}`);

  const posts = await getAdminPosts(token);
  const post = posts.find((item) => item.id === numericId);
  if (!post) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink-muted"
      >
        <Icon name="ArrowLeft" size={13} />
        All articles
      </Link>

      <AdminPageHeading
        title={post.title}
        description={`/insights/${post.slug}`}
        actions={
          <div className="flex gap-2">
            {post.is_placeholder ? <Badge variant="warning" size="md">Example</Badge> : null}
            {post.published ? (
              <Badge variant="positive" size="md">Published</Badge>
            ) : (
              <Badge variant="neutral" size="md">Draft</Badge>
            )}
          </div>
        }
      />

      <PostForm post={post} />
    </div>
  );
}
