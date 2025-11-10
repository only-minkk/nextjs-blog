const fallbackUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteMetadata = {
  title: "OnlyMinkk Blog",
  description: "기술 블로그",
  author: "OnlyMinkk",
  siteName: "OnlyMinkk Blog",
  url: fallbackUrl,
  locale: "ko_KR",
  keywords: ["개발", "기술 블로그", "Next.js", "프론트엔드", "백엔드"],
  defaultOgImage: "/placeholder-thumbnail.svg",
  twitter: {
    card: "summary_large_image" as const,
    site: "@onlyminkk",
  },
};

export type SiteMetadata = typeof siteMetadata;
