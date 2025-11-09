"use client";

import { useState, useMemo } from "react";
import RingSelector from "./RingSelector";
import type { CategoryNode, PostMetadata } from "@/lib/posts";

type RingSelectorWrapperProps = {
  initialPosts: PostMetadata[];
  categories: CategoryNode[];
};

export default function RingSelectorWrapper({
  initialPosts,
  categories,
}: RingSelectorWrapperProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // 선택된 카테고리에 따라 포스트 필터링
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      return initialPosts;
    }

    return initialPosts.filter((post) => {
      const slugSegments = post.slug.split("/").filter(Boolean);
      const directorySegments = slugSegments.slice(0, -1);
      const fullCategoryPathSegments = [
        post.category,
        ...directorySegments,
      ].filter(Boolean);
      const fullCategoryPath = fullCategoryPathSegments.join("/");

      if (fullCategoryPath === selectedCategory) {
        return true;
      }

      return fullCategoryPath.startsWith(`${selectedCategory}/`);
    });
  }, [initialPosts, selectedCategory]);

  const handleCategorySelect = (categoryPath: string) => {
    setSelectedCategory(categoryPath);
  };

  return (
    <RingSelector
      items={filteredPosts}
      getLabel={(item) => item.title}
      categories={categories}
      selectedCategory={selectedCategory}
      onCategorySelect={handleCategorySelect}
    />
  );
}
