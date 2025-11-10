// import { getInitialPosts, getNestedCategories } from "@/lib/posts";
import type { Metadata } from "next";
import { getAllPosts, getNestedCategories } from "@/lib/posts";
import RingSelectorWrapper from "@/components/RingSelectorWrapper";
import ParticleCursor from "@/components/SmokeCursor";
import { siteMetadata } from "@/lib/siteMetadata";

export const metadata: Metadata = {
  title: {
    absolute: siteMetadata.title,
  },
  description: siteMetadata.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

export default function Home() {
  // const initialPosts = getInitialPosts();
  const initialPosts = getAllPosts();
  // console.log("initialPosts", initialPosts);
  const categories = getNestedCategories();

  return (
    <div>
      <main>
        <ParticleCursor />
        <RingSelectorWrapper
          initialPosts={initialPosts}
          categories={categories}
        />
      </main>
    </div>
  );
}
