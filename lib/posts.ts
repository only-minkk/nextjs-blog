import fs from "fs";
import path from "path";
import matter from "gray-matter";

import findMdxFiles from "./findMdxFiles";
const POSTS_PATH = path.join(process.cwd(), "posts");

export interface PostMetadata {
  title: string;
  date: string;
  desc?: string;
  thumbnail?: string;
  slug: string;
  category: string;
}

export interface Post extends PostMetadata {
  content: string;
}

/**
 * 모든 카테고리 목록 반환
 */
export const getCategories = (): string[] => {
  try {
    const items = fs.readdirSync(POSTS_PATH, { withFileTypes: true });
    return items
      .filter((item) => item.isDirectory())
      .map((item) => item.name)
      .sort();
  } catch (error) {
    console.error("Error reading categories:", error);
    return [];
  }
};

/**
 * 특정 카테고리의 모든 포스트 가져오기
 */
export const getPostsByCategory = (category: string): PostMetadata[] => {
  try {
    const categoryPath = path.join(POSTS_PATH, category);

    // 카테고리 폴더가 존재하는지 확인
    if (!fs.existsSync(categoryPath)) {
      return [];
    }

    const posts = findMdxFiles(categoryPath, category)?.filter(
      (post) => post.category === category
    );

    if (!posts || posts.length === 0) {
      return [];
    }

    // 날짜순으로 정렬 (최신순)
    return posts.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error(`Error reading posts for category ${category}:`, error);
    return [];
  }
};

/**
 * 특정 카테고리의 특정 포스트 가져오기
 */
export const getPost = (category: string, slug: string): Post | null => {
  try {
    // slug에서 category 부분이 포함되어 있을 수 있음
    // 예: category="frontend", slug="frontend/react-hooks-guide"
    // 이 경우 slug에서 category 부분을 제거해야 함
    let cleanSlug = slug;
    if (category && slug.startsWith(`${category}/`)) {
      cleanSlug = slug.slice(category.length + 1);
    }

    // slug에서 파일명과 하위 경로 추출
    const slugParts = cleanSlug.split("/");
    const fileName = slugParts[slugParts.length - 1];
    const subPath = slugParts.slice(0, -1);

    // category가 빈 문자열이면 루트에서 찾기
    // category가 있으면 해당 카테고리 폴더에서 찾기
    let postPath: string;
    if (category) {
      // category 폴더 내에서 slug 경로로 찾기
      postPath = path.join(POSTS_PATH, category, ...subPath, `${fileName}.mdx`);
    } else {
      // 루트에서 slug 경로로 찾기
      postPath = path.join(POSTS_PATH, ...subPath, `${fileName}.mdx`);
    }

    // 경로 정규화 (Windows 경로 문제 해결)
    postPath = path.normalize(postPath);

    if (!fs.existsSync(postPath)) {
      console.error(`Post not found at: ${postPath}`);
      console.error(
        `Looking for category: "${category}", slug: "${slug}", cleanSlug: "${cleanSlug}"`
      );
      return null;
    }

    const fileContent = fs.readFileSync(postPath, "utf8");
    const { data, content } = matter(fileContent);

    return {
      ...data,
      content,
      slug,
      category,
    } as Post;
  } catch (error) {
    console.error(`Error reading post ${category}/${slug}:`, error);
    return null;
  }
};

/**
 * 초기 로딩: 최신 11개 + 오래된 10개 (총 21개)
 * 빠른 초기 렌더링을 위해 일부만 로드
 */
// export const getInitialPosts = (): PostMetadata[] => {
//   const allPosts = getAllPosts();
//   const total = allPosts.length;

//   if (total <= 21) {
//     // 21개 이하면 전체 반환
//     return allPosts;
//   }

//   // 최신 11개 + 오래된 10개
//   const newest = allPosts.slice(0, 11); // index 0~10 (최신 11개)
//   const oldest = allPosts.slice(-10); // index (len-10) ~ (len-1) (오래된 10개)

//   return [...newest, ...oldest];
// };

// /**
//  * 추가 최신 글 로드 (프리페칭용)
//  * @param loadedCount 이미 로드된 최신 글 개수
//  * @param count 추가로 로드할 개수
//  */
// export const getNextNewestPosts = (
//   loadedCount: number,
//   count: number = 5
// ): PostMetadata[] => {
//   const allPosts = getAllPosts();
//   const startIndex = loadedCount;
//   const endIndex = Math.min(startIndex + count, allPosts.length);

//   if (startIndex >= allPosts.length) {
//     return [];
//   }

//   return allPosts.slice(startIndex, endIndex);
// };

// /**
//  * 추가 오래된 글 로드 (프리페칭용)
//  * @param loadedOldestCount 이미 로드된 오래된 글 개수
//  * @param count 추가로 로드할 개수
//  */
// export const getNextOldestPosts = (
//   loadedOldestCount: number,
//   count: number = 5
// ): PostMetadata[] => {
//   const allPosts = getAllPosts();
//   const total = allPosts.length;

//   if (loadedOldestCount >= total) {
//     return [];
//   }

//   // 오래된 글은 뒤에서부터 로드
//   const endIndex = total - loadedOldestCount;
//   const startIndex = Math.max(0, endIndex - count);

//   return allPosts.slice(startIndex, endIndex);
// };

/**
 * 모든 포스트 가져오기 (모든 카테고리 + 루트 포스트)
 * 각 포스트의 실제 경로를 category 필드에 저장
 */
export const getAllPosts = (): PostMetadata[] => {
  // const allPosts: PostMetadata[] = [];

  // // 재귀적으로 모든 MDX 파일 찾기
  // const findMdxFiles = (dir: string, relativePath: string = ""): void => {
  //   try {
  //     const items = fs.readdirSync(dir, { withFileTypes: true });

  //     for (const item of items) {
  //       console.log("item", item);
  //       const fullPath = path.join(dir, item.name);

  //       if (item.isDirectory()) {
  //         // 폴더면 재귀적으로 탐색
  //         const nextPath = relativePath
  //           ? `${relativePath}/${item.name}`
  //           : item.name;
  //         findMdxFiles(fullPath, nextPath);
  //       } else if (item.isFile() && /\.mdx?$/.test(item.name)) {
  //         // MDX 파일이면 메타데이터 읽기
  //         try {
  //           const fileContent = fs.readFileSync(fullPath, "utf8");
  //           const { data } = matter(fileContent);
  //           const slug = relativePath
  //             ? `${relativePath}/${item.name.replace(/\.mdx?$/, "")}`
  //             : item.name.replace(/\.mdx?$/, "");

  //           allPosts.push({
  //             ...data,
  //             slug,
  //             category: relativePath, // 실제 경로를 category로 저장 (예: "example/test")
  //           } as PostMetadata);
  //         } catch (error) {
  //           console.error(`Error reading post ${fullPath}:`, error);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error(`Error reading directory ${dir}:`, error);
  //   }
  // };

  // posts 폴더부터 시작하여 모든 포스트 찾기
  const allPosts = findMdxFiles(POSTS_PATH);

  // 날짜순으로 정렬 (최신순)
  return (
    allPosts?.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    }) || []
  );
};

export interface CategoryNode {
  name: string;
  path: string;
  children: CategoryNode[];
}

/**
 * 중첩된 카테고리 트리 구조 생성
 */
export const getNestedCategories = (): CategoryNode[] => {
  try {
    const buildTree = (dir: string, basePath: string = ""): CategoryNode[] => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      const nodes: CategoryNode[] = [];

      for (const item of items) {
        if (item.isDirectory()) {
          // 괄호 포함 또는 언더바로 시작하는 카테고리는 숨김 처리
          const hasParentheses = /[()]/.test(item.name);
          const startsWithUnderscore = item.name.startsWith("_");

          if (hasParentheses || startsWithUnderscore) {
            continue;
          }

          const fullPath = path.join(dir, item.name);
          const nodePath = basePath ? `${basePath}/${item.name}` : item.name;

          nodes.push({
            name: item.name,
            path: nodePath,
            children: buildTree(fullPath, nodePath),
          });
        }
      }

      return nodes.sort((a, b) => a.name.localeCompare(b.name));
    };
    // console.log("POSTS_PATH", POSTS_PATH);
    // console.log("getNestedCategories", buildTree(POSTS_PATH));

    return buildTree(POSTS_PATH);
  } catch (error) {
    console.error("Error reading nested categories:", error);
    return [];
  }
};
