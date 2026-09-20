"use client";

import { RecordActions } from "@/components/admin/record-actions";
import { deletePost, togglePostPublished } from "@/lib/actions/admin";
import type { BlogPost } from "@/types/api";

/** Binds the shared record actions to the article server actions. */
export function PostActions({ post }: { post: BlogPost }) {
  return (
    <RecordActions
      recordLabel={post.title}
      published={post.published}
      onTogglePublished={(next) => togglePostPublished(post.id, next)}
      onDelete={() => deletePost(post.id)}
      editHref={`/admin/posts/${post.id}`}
      viewHref={post.published ? `/insights/${post.slug}` : undefined}
    />
  );
}
