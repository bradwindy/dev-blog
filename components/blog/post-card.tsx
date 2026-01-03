import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/lib/posts";

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.frontmatter.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <time dateTime={post.frontmatter.publishedAt}>{formattedDate}</time>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
        <CardTitle className="line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors"
          >
            {post.frontmatter.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {post.frontmatter.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {post.frontmatter.tags.map((tag) => (
            <Link key={tag} href={`/tags/${tag.toLowerCase()}`}>
              <Badge variant="secondary" className="hover:bg-secondary/80">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
