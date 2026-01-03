import Fuse from "fuse.js";
import type { PostMeta } from "./posts";

const fuseOptions = {
  keys: [
    { name: "frontmatter.title", weight: 2 },
    { name: "frontmatter.description", weight: 1.5 },
    { name: "frontmatter.tags", weight: 1 },
  ],
  threshold: 0.3,
  includeScore: true,
};

export function createSearchIndex(posts: PostMeta[]) {
  return new Fuse(posts, fuseOptions);
}

export function searchPosts(
  index: Fuse<PostMeta>,
  query: string
): PostMeta[] {
  if (!query.trim()) {
    return [];
  }
  const results = index.search(query);
  return results.map((result) => result.item);
}
