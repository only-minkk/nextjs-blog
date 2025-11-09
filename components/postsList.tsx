import Link from "next/link";
import Image from "next/image";
import {
  getAllPosts,
  getPostsByCategory,
  type PostMetadata,
} from "@/lib/posts";

type PostsListProps = {
  category?: string;
  limit?: number;
  title?: string;
};

export default async function PostsList({
  category,
  limit,
  title,
}: PostsListProps) {
  const posts: PostMetadata[] = category
    ? getPostsByCategory(category)
    : getAllPosts();

  const items = typeof limit === "number" ? posts.slice(0, limit) : posts;

  return (
    <section className="w-full">
      {title ? (
        <h2 className="mb-3 text-lg font-semibold tracking-tight">{title}</h2>
      ) : null}

      {/* Vertical card carousel */}
      <div className="relative h-[520px] sm:h-[640px] overflow-y-auto pr-2 snap-y snap-mandatory space-y-4">
        {items.map((post) => (
          <article
            key={`${post.category}/${post.slug}`}
            className="snap-start bg-white/70 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow transition-shadow"
          >
            <Link
              href={
                post.category
                  ? `/${encodeURIComponent(post.category)}/${encodeURIComponent(post.slug)}`
                  : `/${encodeURIComponent(post.slug)}`
              }
              className="flex gap-4"
            >
              {post.thumbnail ? (
                <div className="relative w-28 sm:w-32 shrink-0 aspect-[4/3]">
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 sm:w-32 shrink-0 aspect-[4/3] bg-neutral-200 dark:bg-neutral-800" />
              )}

              <div className="py-3 pr-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="uppercase tracking-wide">
                    {post.category}
                  </span>
                  <span>·</span>
                  <time dateTime={post.date}>{post.date}</time>
                </div>
                <h3 className="mt-1 text-base sm:text-lg font-semibold leading-snug line-clamp-2">
                  {post.title}
                </h3>
                {post.desc ? (
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                    {post.desc}
                  </p>
                ) : null}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
