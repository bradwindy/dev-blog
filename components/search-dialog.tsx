"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Fuse from "fuse.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PostMeta } from "@/lib/posts";

interface SearchDialogProps {
  posts: PostMeta[];
}

export function SearchDialog({ posts }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostMeta[]>([]);
  const router = useRouter();

  const fuse = new Fuse(posts, {
    keys: [
      { name: "frontmatter.title", weight: 2 },
      { name: "frontmatter.description", weight: 1.5 },
      { name: "frontmatter.tags", weight: 1 },
    ],
    threshold: 0.3,
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const searchResults = fuse.search(query);
    setResults(searchResults.map((r) => r.item));
  }, [query]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/blog/${slug}`);
    },
    [router]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search">
          <Search className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Search posts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Type to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {results.length > 0 && (
            <ul className="max-h-[300px] overflow-y-auto space-y-2">
              {results.map((post) => (
                <li key={post.slug}>
                  <button
                    onClick={() => handleSelect(post.slug)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="font-medium">{post.frontmatter.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {post.frontmatter.description}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query && results.length === 0 && (
            <p className="text-center text-muted-foreground py-6">
              No results found.
            </p>
          )}
          <div className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded">⌘K</kbd> to
            toggle search
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
