import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_PATH = path.join(process.cwd(), "content/blog");

export interface PostFrontmatter {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  image?: string;
  draft?: boolean;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  readingTime: string;
}

export interface PostMeta {
  slug: string;
  frontmatter: PostFrontmatter;
  readingTime: string;
}

function getMDXFiles(): string[] {
  if (!fs.existsSync(POSTS_PATH)) {
    return [];
  }
  return fs
    .readdirSync(POSTS_PATH)
    .filter((file) => file.endsWith(".mdx"));
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(POSTS_PATH, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const frontmatter = data as PostFrontmatter;

  return {
    slug,
    frontmatter,
    content,
    readingTime: readingTime(content).text,
  };
}

export function getAllPosts(): PostMeta[] {
  const files = getMDXFiles();
  const isDev = process.env.NODE_ENV === "development";

  const posts = files
    .map((file) => {
      const slug = file.replace(".mdx", "");
      const post = getPostBySlug(slug);
      if (!post) return null;

      // Filter out drafts in production
      if (!isDev && post.frontmatter.draft) {
        return null;
      }

      return {
        slug: post.slug,
        frontmatter: post.frontmatter,
        readingTime: post.readingTime,
      };
    })
    .filter((post): post is PostMeta => post !== null);

  // Sort by publishedAt descending
  return posts.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime()
  );
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) =>
    post.frontmatter.tags
      .map((t) => t.toLowerCase())
      .includes(tag.toLowerCase())
  );
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPosts();
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => {
      const normalizedTag = tag.toLowerCase();
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRelatedPosts(currentSlug: string, limit = 3): PostMeta[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const currentTags = new Set(
    currentPost.frontmatter.tags.map((t) => t.toLowerCase())
  );

  const allPosts = getAllPosts().filter((post) => post.slug !== currentSlug);

  // Score posts by number of matching tags
  const scored = allPosts.map((post) => {
    const matchingTags = post.frontmatter.tags.filter((tag) =>
      currentTags.has(tag.toLowerCase())
    ).length;
    return { post, score: matchingTags };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}
