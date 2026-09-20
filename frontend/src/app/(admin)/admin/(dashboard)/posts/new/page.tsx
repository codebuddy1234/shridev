import Link from "next/link";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { PostForm } from "@/components/admin/post-form";
import { Icon } from "@/components/ui/icon";
import { requireAdmin } from "@/lib/session";

export const metadata = { title: "New article" };

export default async function NewPostPage() {
  await requireAdmin("/admin/posts/new");

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
        title="New article"
        description="If this is demo content rather than editorial, tick 'Mark as example content' so the public page says so."
      />

      <PostForm />
    </div>
  );
}
