"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function getHeadingsSnapshot(): TocItem[] {
  if (typeof document === "undefined") return [];
  const elements = document.querySelectorAll("article h2, article h3");
  return Array.from(elements).map((element) => ({
    id: element.id,
    text: element.textContent || "",
    level: element.tagName === "H2" ? 2 : 3,
  }));
}

function getServerSnapshot(): TocItem[] {
  return [];
}

function subscribeToHeadings(_callback: () => void): () => void {
  // No-op subscription - headings don't change dynamically
  // This is just for initial hydration
  return () => {};
}

export function TableOfContents() {
  const headings = useSyncExternalStore(
    subscribeToHeadings,
    getHeadingsSnapshot,
    getServerSnapshot
  );
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = document.querySelectorAll("article h2, article h3");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-2">
      <p className="font-medium">On this page</p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block text-muted-foreground hover:text-foreground transition-colors",
                heading.level === 3 && "pl-4",
                activeId === heading.id && "text-foreground font-medium"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
