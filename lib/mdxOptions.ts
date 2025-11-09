import type { MDXRemoteProps } from "next-mdx-remote";
import type { ComponentProps } from "react";
import { createElement } from "react";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrismPlus from "rehype-prism-plus";

export const mdxOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: [
              "mdx-anchor",
              "text-neutral-300",
              "hover:text-neutral-500",
              "dark:text-neutral-600",
              "dark:hover:text-neutral-300",
            ],
            ariaLabel: "헤딩 앵커",
          },
        },
      ],
      rehypePrismPlus,
    ],
  },
};

export const mdxComponents: MDXRemoteProps["components"] = {
  pre: (props) =>
    createElement(
      "pre",
      {
        ...props,
        className: `not-prose overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-950/95 p-4 text-sm text-neutral-100 shadow-sm dark:border-neutral-700 ${props.className ?? ""}`,
      },
      props.children
    ),
  code: (props: ComponentProps<"code">) => {
    const className = props.className || "";
    if (className.includes("language-")) {
      return createElement("code", {
        ...props,
        className: `language-code ${className}`,
      });
    }
    return createElement("code", {
      ...props,
      className: `rounded-md bg-neutral-100 px-1.5 py-0.5 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100 ${className}`,
    });
  },
  table: (props) =>
    createElement(
      "div",
      {
        className:
          "not-prose overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900",
      },
      createElement(
        "table",
        {
          ...props,
          className: `w-full text-left text-sm ${props.className ?? ""}`,
        },
        props.children
      )
    ),
};
