// import { getInitialPosts, getNestedCategories } from "@/lib/posts";
import { getAllPosts, getNestedCategories } from "@/lib/posts";
import RingSelectorWrapper from "@/components/RingSelectorWrapper";
import ParticleCursor from "@/components/SmokeCursor";

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
