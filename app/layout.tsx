import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/prism.css";
import Header from "@/components/(header)/header";
import { siteMetadata } from "@/lib/siteMetadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.url),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.siteName}`,
  },
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  authors: [{ name: siteMetadata.author }],
  creator: siteMetadata.author,
  publisher: siteMetadata.author,
  alternates: {
    canonical: siteMetadata.url,
  },
  openGraph: {
    title: siteMetadata.siteName,
    description: siteMetadata.description,
    url: siteMetadata.url,
    siteName: siteMetadata.siteName,
    locale: siteMetadata.locale,
    type: "website",
    images: [
      {
        url: siteMetadata.defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteMetadata.siteName,
      },
    ],
  },
  twitter: {
    card: siteMetadata.twitter.card,
    site: siteMetadata.twitter.site,
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [siteMetadata.defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem("onlyMinkk-theme");
                  if (theme === "dark" || theme === "light") {
                    document.documentElement.classList.toggle("dark", theme === "dark");
                  } else {
                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    document.documentElement.classList.toggle("dark", prefersDark);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
