import type { HeadingMeta } from "./types";

export async function extractHeadings(source: string): Promise<HeadingMeta[]> {
  if (!source) return [];

  const [{ unified }, { default: remarkParse }, { default: remarkMdx }, { visit }, { toString }, { default: GithubSlugger }] =
    await Promise.all([
      import("unified"),
      import("remark-parse"),
      import("remark-mdx"),
      import("unist-util-visit"),
      import("mdast-util-to-string"),
      import("github-slugger"),
    ]);

  const processor = unified().use(remarkParse).use(remarkMdx);
  const tree = processor.parse(source);
  const slugger = new GithubSlugger();
  const headings: HeadingMeta[] = [];

  visit(tree, "heading", (node: any) => {
    const depth: number = node.depth ?? 0;
    if (depth < 2 || depth > 4) return;

    const text = toString(node).trim();
    if (!text) return;

    const id = slugger.slug(text);
    headings.push({
      id,
      text,
      level: depth,
    });
  });

  return headings;
}
