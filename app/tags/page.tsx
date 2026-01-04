import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all tags",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4">
        <h1 className="inline-block font-display text-4xl tracking-tight lg:text-5xl">
          Tags
        </h1>
        <p className="text-xl text-muted-foreground">
          Browse posts by topic
        </p>
      </div>
      <hr className="my-8" />
      {tags.length === 0 ? (
        <p className="text-muted-foreground">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <Link key={tag} href={`/tags/${tag}`}>
              <Badge
                variant="secondary"
                className="text-base py-2 px-4 hover:bg-secondary/80"
              >
                {tag} ({count})
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
