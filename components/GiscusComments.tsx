"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const repo = process.env.NEXT_PUBLIC_GISCUS_REPO ?? "";
const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "";
const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? "General";
const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "";

export default function GiscusComments() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const giscusTheme = useMemo(
    () => (theme === "dark" ? "transparent_dark" : "light"),
    [theme]
  );

  useEffect(() => {
    if (!isMounted) return;
    if (!containerRef.current) return;
    if (!repo || !repoId || !categoryId) return;

    // Clear previous iframe when theme changes
    containerRef.current.innerHTML = "";

    const scriptEl = document.createElement("script");
    scriptEl.src = "https://giscus.app/client.js";
    scriptEl.async = true;
    scriptEl.crossOrigin = "anonymous";
    scriptEl.setAttribute("data-repo", repo);
    scriptEl.setAttribute("data-repo-id", repoId);
    scriptEl.setAttribute("data-category", category);
    scriptEl.setAttribute("data-category-id", categoryId);
    scriptEl.setAttribute("data-mapping", "pathname");
    scriptEl.setAttribute("data-reactions-enabled", "1");
    scriptEl.setAttribute("data-emit-metadata", "0");
    scriptEl.setAttribute("data-input-position", "top");
    scriptEl.setAttribute("data-lang", "ko");
    scriptEl.setAttribute("data-theme", giscusTheme);

    containerRef.current.appendChild(scriptEl);
  }, [giscusTheme, isMounted]);

  if (!repo || !repoId || !categoryId) {
    return null;
  }

  return <div ref={containerRef} className="giscus" />;
}
