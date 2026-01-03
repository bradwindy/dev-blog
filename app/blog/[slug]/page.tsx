import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { PostCard } from "@/components/blog/post-card";
import type { Metadata } from "next";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article",
      publishedTime: post.frontmatter.publishedAt,
      modifiedTime: post.frontmatter.updatedAt,
      tags: post.frontmatter.tags,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug);

  const formattedPublishDate = new Date(
    post.frontmatter.publishedAt
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedUpdateDate = post.frontmatter.updatedAt
    ? new Date(post.frontmatter.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Dynamic import of MDX content
  const { default: Content } = await import(
    `@/content/blog/${slug}.mdx`
  );

  return (
    <div className="container py-10">
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to blog
      </Link>

      <div className="flex gap-10">
        <article className="flex-1 min-w-0">
          <header className="mb-8">
            {post.frontmatter.draft && (
              <Badge variant="destructive" className="mb-4">
                Draft
              </Badge>
            )}
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
              {post.frontmatter.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground mb-4">
              <time dateTime={post.frontmatter.publishedAt}>
                {formattedPublishDate}
              </time>
              {formattedUpdateDate && (
                <>
                  <span>·</span>
                  <span>Updated {formattedUpdateDate}</span>
                </>
              )}
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.frontmatter.tags.map((tag) => (
                <Link key={tag} href={`/tags/${tag.toLowerCase()}`}>
                  <Badge variant="secondary">{tag}</Badge>
                </Link>
              ))}
            </div>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <Content />
          </div>
        </article>

        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <TableOfContents />
          </div>
        </aside>
      </div>

      {relatedPosts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <PostCard key={relatedPost.slug} post={relatedPost} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
