import { getPost } from "@/lib/posts";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents, mdxOptions } from "@/lib/mdxOptions";
import { extractHeadings } from "@/lib/extractHeadings";
import PostToc from "@/components/PostToc";
import GiscusComments from "@/components/GiscusComments";

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export default async function PostPage({ params }: Props) {
  const { category, slug } = await params;
  const decodedCategory = decodeURIComponent(category);
  const decodedSlug = decodeURIComponent(slug);

  const post = getPost(decodedCategory, decodedSlug);

  if (!post) {
    notFound();
  }

  const headings = await extractHeadings(post.content || "");

  const formattedDate = new Date(post.date);
  const isoDate = formattedDate.toISOString();
  const formattedLabel = formattedDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors">
      <div className="mx-auto w-full max-w-[700px] px-6 py-24">
        <article className="w-full">
          {/* 헤더 */}
          <header className="mb-8">
            <Link
              href="/"
              className="inline-block mb-4 text-sm text-[var(--color-foreground)]/70 hover:text-[var(--color-foreground)] transition-colors"
            >
              ← 홈으로 돌아가기
            </Link>
            <div className="mb-4">
              <span className="text-sm uppercase tracking-wide text-[var(--color-foreground)]/60">
                {post.category}
              </span>
              <span className="mx-2 text-[var(--color-foreground)]/40">·</span>
              <time
                dateTime={isoDate}
                className="text-sm text-[var(--color-foreground)]/60"
              >
                {formattedLabel}
              </time>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-foreground)] mb-4">
              {post.title}
            </h1>
            {post.desc && (
              <p className="text-xl text-[var(--color-foreground)]/75">
                {post.desc}
              </p>
            )}
          </header>

          {/* 썸네일 */}
          {post.thumbnail && (
            <div className="relative w-full aspect-video mb-12 rounded-lg overflow-hidden">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          {/* 본문 */}
          <div className="prose prose-lg">
            <MDXRemote
              source={post.content || ""}
              options={mdxOptions}
              components={mdxComponents}
            />
          </div>
          <div className="mt-16">
            <GiscusComments />
          </div>
        </article>
      </div>
      <aside className="pointer-events-none fixed top-24 hidden max-h-[calc(100vh-6rem)] w-[150px] left-[calc(50%+350px)] [@media(min-width:1000px)]:block">
        <div className="pointer-events-auto">
          <PostToc headings={headings} />
        </div>
      </aside>
    </div>
  );
}
