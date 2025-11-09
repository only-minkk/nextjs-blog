import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PostMetadata } from "./posts";

const allPosts: PostMetadata[] = [];

// 재귀적으로 모든 MDX 파일 찾기
export default function findMdxFiles(
  dir: string,
  relativePath: string = "",
  isRootCall: boolean = true
) {
  // 최상위 호출일 때만 배열 초기화 (재귀 호출 시 중복 초기화 방지)
  if (isRootCall) {
    allPosts.length = 0;
  }

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        // 괄호 포함 또는 언더바로 시작하는 카테고리는 숨김 처리
        const hasParentheses = /[()]/.test(item.name);
        const startsWithUnderscore = item.name.startsWith("_");

        if (hasParentheses || startsWithUnderscore) {
          continue; // 해당 디렉토리와 그 안의 모든 포스트를 스킵
        }

        // 폴더면 재귀적으로 탐색
        const nextPath = relativePath
          ? `${relativePath}/${item.name}`
          : item.name;
        findMdxFiles(fullPath, nextPath, false);
      } else if (item.isFile() && /\.mdx?$/.test(item.name)) {
        // MDX 파일이면 메타데이터 읽기
        try {
          const fileContent = fs.readFileSync(fullPath, "utf8");
          const { data } = matter(fileContent);
          const fileName = item.name.replace(/\.mdx?$/, "");

          const pathSegments = relativePath
            .split("/")
            .filter((segment) => segment.length > 0);

          const category = pathSegments.length > 0 ? pathSegments[0] : "";
          const slugSegments =
            pathSegments.length > 1 ? pathSegments.slice(1) : [];
          slugSegments.push(fileName);
          const slug = slugSegments.join("/");

          allPosts.push({
            ...data,
            slug,
            category,
          } as PostMetadata);
        } catch (error) {
          console.error(`Error reading post ${fullPath}:`, error);
        }
      }
    }
    return allPosts;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
}
