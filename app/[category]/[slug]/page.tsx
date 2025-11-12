import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import PostToc from "@/components/PostToc";
import GiscusComments from "@/components/GiscusComments";
import { extractHeadings } from "@/lib/extractHeadings";
import { mdxComponents, mdxOptions } from "@/lib/mdxOptions";
import { getPost } from "@/lib/posts";
import { siteMetadata } from "@/lib/siteMetadata";
import SplashCursor from "@/components/SplashCursor";

type Params = {
  category: string;
  slug: string;
};

const toAbsoluteUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return new URL(path, siteMetadata.url).toString();
};

type PageProps = {
  params: Promise<Params>;
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const resolvedParams = await params;
  const decodedCategory = decodeURIComponent(resolvedParams.category);
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const post = getPost(decodedCategory, decodedSlug);

  if (!post) {
    return {
      title: "게시글을 찾을 수 없습니다",
      description: siteMetadata.description,
      alternates: {
        canonical: `/${resolvedParams.category}/${resolvedParams.slug}`,
      },
    };
  }

  const title = post.title;
  const description = post.desc ?? siteMetadata.description;
  const canonicalPath = `/${resolvedParams.category}/${resolvedParams.slug}`;
  const publishedTime = new Date(post.date).toISOString();
  const imageUrl = post.thumbnail
    ? toAbsoluteUrl(post.thumbnail)
    : toAbsoluteUrl(siteMetadata.defaultOgImage);

  const keywords = Array.from(
    new Set([...(siteMetadata.keywords ?? []), post.category])
  );

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalPath,
      siteName: siteMetadata.siteName,
      locale: siteMetadata.locale,
      publishedTime,
      authors: [siteMetadata.author],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: siteMetadata.twitter.card,
      site: siteMetadata.twitter.site,
      title,
      description,
      images: [imageUrl],
    },
  };
};

export default async function PostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const decodedCategory = decodeURIComponent(resolvedParams.category);
  const decodedSlug = decodeURIComponent(resolvedParams.slug);

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
      <SplashCursor />
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
