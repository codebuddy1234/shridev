import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatDate, readingTime } from "@/lib/utils";
import { markdownToPlainText } from "@/lib/markdown";
import type { BlogPost } from "@/types/api";

/**
 * Article card.
 *
 * Posts flagged `is_placeholder` carry a visible "Example" badge so seeded
 * demo content is never mistaken for something ShriDev published.
 */
export function PostCard({ post, featured }: { post: BlogPost; featured?: boolean }) {
  const minutes = readingTime(markdownToPlainText(post.content));

  return (
    <Card interactive className={`group flex flex-col overflow-hidden ${featured ? "sm:flex-row" : ""}`}>
      {post.cover_url ? (
        <div
          className={`relative overflow-hidden bg-surface-2 ${
            featured ? "aspect-[16/10] sm:aspect-auto sm:w-2/5" : "aspect-[16/9] w-full"
          }`}
        >
          <Image
            src={post.cover_url}
            alt=""
            fill
            sizes={featured ? "(max-width: 640px) 100vw, 40vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="brand" size="sm">
            {post.category}
          </Badge>
          {post.is_placeholder ? (
            <Badge variant="warning" size="sm" title="Seeded example content, not published by ShriDev">
              Example
            </Badge>
          ) : null}
        </div>

        <h3
          className={`mt-4 font-display font-medium text-ink ${featured ? "text-xl sm:text-2xl" : "text-lg"}`}
        >
          <Link href={`/insights/${post.slug}`} className="outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{post.excerpt}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline pt-5 text-xs text-ink-faint">
          {post.published_at ? (
            <time dateTime={post.published_at} className="inline-flex items-center gap-1.5">
              <Icon name="Calendar" size={13} />
              {formatDate(post.published_at)}
            </time>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Icon name="Clock" size={13} />
            {minutes}
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 font-medium text-accent-400 transition-colors group-hover:text-accent-300">
            Read
            <Icon
              name="ArrowRight"
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Card>
  );
}
