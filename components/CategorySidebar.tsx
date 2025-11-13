"use client";

import { useState } from "react";
import type { CategoryNode } from "@/lib/posts";
import styles from "@/styles/ringSelector.module.css";

type CategorySidebarProps = {
  categories: CategoryNode[];
  selectedCategory?: string;
  onCategorySelect: (categoryPath: string) => void;
};

export default function CategorySidebar({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategorySidebarProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleCategoryClick = (node: CategoryNode) => {
    // 카테고리 선택
    onCategorySelect(node.path);

    // 하위 카테고리가 있으면 자동으로 열기
    if (node.children.length > 0) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        next.add(node.path);
        return next;
      });
    }
  };

  const renderCategory = (node: CategoryNode, depth: number = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedCategory === node.path;

    return (
      <div key={node.path} className={styles.categoryItem}>
        <div
          className={`${styles.categoryButton} ${
            isSelected ? styles.categoryButtonSelected : ""
          }`}
          style={{
            paddingLeft: `${12 + depth * 20}px`,
          }}
          onClick={() => handleCategoryClick(node)}
        >
          {hasChildren && (
            <button
              className={styles.categoryToggle}
              onClick={(e) => toggleExpand(node.path, e)}
              aria-label={isExpanded ? "접기" : "펼치기"}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <path d="M5 2l4 4-4 4" />
              </svg>
            </button>
          )}
          {!hasChildren && <div className={styles.categorySpacer} />}
          <span className={styles.categoryName} data-depth={depth}>
            {node.name}
          </span>
          {isSelected && <div className={styles.categoryIndicator} />}
        </div>
        {hasChildren && (
          <div
            className={styles.categoryChildren}
            style={{
              maxHeight: isExpanded ? "1000px" : "0",
              opacity: isExpanded ? 1 : 0,
            }}
          >
            {node.children.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const isAllSelected =
    selectedCategory === "" || selectedCategory === undefined;

  return (
    <div className={styles.categorySidebar}>
      <div className={styles.categoryList}>
        <div
          className={`${styles.categoryButton} ${styles.categoryButtonAll} ${
            isAllSelected ? styles.categoryButtonSelected : ""
          }`}
          onClick={() => onCategorySelect("")}
        >
          <span className={styles.categoryName}>전체</span>
          {isAllSelected && <div className={styles.categoryIndicator} />}
        </div>
        {categories.map((category) => renderCategory(category))}
      </div>
    </div>
  );
}
