"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HeadingMeta } from "@/lib/types";
import clsx from "clsx";

interface PostTocProps {
  headings: HeadingMeta[];
}

export default function PostToc({ headings }: PostTocProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const items = useMemo(() => headings, [headings]);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop
          );

        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0].target.id);
          return;
        }

        // fallback: find the heading just above the viewport
        const firstEntry = entries[0];
        if (!firstEntry) return;

        const currentHeading = entries
          .filter(
            (entry) =>
              (entry.target as HTMLElement).offsetTop <= window.scrollY + 120
          )
          .sort(
            (a, b) =>
              (b.target as HTMLElement).offsetTop -
              (a.target as HTMLElement).offsetTop
          )[0];

        if (currentHeading) {
          setActiveId(currentHeading.target.id);
        }
      },
      {
        rootMargin: "-20% 0% -60% 0%",
        threshold: [0, 1],
      }
    );

    const elements = items
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => Boolean(el));

    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [items]);

  useEffect(() => {
    const target = buttonRefs.current[activeId];
    if (!target) return;
    target.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 96,
      behavior: "smooth",
    });
  };

  if (items.length === 0) return null;

  return (
    <nav aria-label="본문 목차" className="w-full">
      <div className="toc-scroll space-y-2 text-sm">
        <ul className="space-y-1">
          {items.map((heading) => (
            <li key={heading.id}>
              <button
                type="button"
                onClick={() => handleClick(heading.id)}
                ref={(el) => {
                  buttonRefs.current[heading.id] = el;
                }}
                className={clsx(
                  "flex w-full items-start gap-2 text-left transition-colors",
                  activeId === heading.id
                    ? "font-semibold text-blue-600 dark:text-blue-400"
                    : "text-[var(--color-foreground)]/65 hover:text-[var(--color-foreground)]"
                )}
              >
                <span
                  className={clsx(
                    "mr-2 align-middle transition-colors",
                    activeId === heading.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-[var(--color-foreground)]/35"
                  )}
                >
                  |
                </span>
                <span className="flex-1 leading-relaxed">{heading.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
