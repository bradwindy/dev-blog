# Developer Blog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modern developer blog with Next.js 15, MDX, Tailwind CSS, and automatic Bluesky posting.

**Architecture:** Static site with MDX content in `/content/blog/`, Next.js App Router for pages, and serverless functions for OG images and Bluesky posting. Client-side search via Fuse.js. Theme toggle with system preference detection.

**Tech Stack:** Next.js 15, TypeScript, MDX, Tailwind CSS, shadcn/ui, Shiki, Fuse.js, @atproto/api, @vercel/og

---

## Phase 1: Project Setup

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

**Step 1: Create Next.js 15 project with TypeScript**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

Expected: Project scaffolded with Next.js 15, TypeScript, Tailwind CSS, ESLint, App Router

**Step 2: Verify project runs**

Run:
```bash
npm run dev
```

Expected: Dev server starts at http://localhost:3000

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js 15 project with TypeScript and Tailwind"
```

---

### Task 2: Configure MDX Support

**Files:**
- Modify: `next.config.ts`
- Create: `mdx-components.tsx`
- Modify: `package.json` (dependencies added)

**Step 1: Install MDX dependencies**

Run:
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

Expected: Dependencies installed

**Step 2: Configure next.config.ts for MDX**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
```

**Step 3: Create mdx-components.tsx**

Create `mdx-components.tsx` in project root:

```typescript
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
```

**Step 4: Verify MDX works - create test page**

Create `app/test-mdx/page.mdx`:

```mdx
# MDX Test

This is **MDX** content.
```

**Step 5: Verify page renders**

Run:
```bash
npm run dev
```

Visit http://localhost:3000/test-mdx
Expected: Page renders with "MDX Test" heading

**Step 6: Remove test page and commit**

```bash
rm -rf app/test-mdx
git add -A
git commit -m "feat: configure MDX support with @next/mdx"
```

---

### Task 3: Install Remaining Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install content processing dependencies**

Run:
```bash
npm install shiki rehype-slug rehype-autolink-headings remark-gfm gray-matter reading-time
```

Expected: Dependencies installed

**Step 2: Install UI dependencies**

Run:
```bash
npm install next-themes lucide-react fuse.js
```

Expected: Dependencies installed

**Step 3: Install Bluesky and OG dependencies**

Run:
```bash
npm install @atproto/api @vercel/og
```

Expected: Dependencies installed

**Step 4: Install Vercel Analytics**

Run:
```bash
npm install @vercel/analytics
```

Expected: Dependencies installed

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install all project dependencies"
```

---

### Task 4: Set Up shadcn/ui

**Files:**
- Create: `components.json`
- Create: `lib/utils.ts`
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

**Step 1: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```

Expected: shadcn/ui initialized with default settings

**Step 2: Install button component (validates setup)**

Run:
```bash
npx shadcn@latest add button
```

Expected: Button component added to `components/ui/button.tsx`

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: initialize shadcn/ui with button component"
```

---

### Task 5: Configure Theme Support

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/theme-provider.tsx`

**Step 1: Create theme provider component**

Create `components/theme-provider.tsx`:

```typescript
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

**Step 2: Update app/layout.tsx with theme provider**

Replace `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dev Blog",
    template: "%s | Dev Blog",
  },
  description: "A developer blog about software engineering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 3: Verify dev server still runs**

Run:
```bash
npm run dev
```

Expected: No errors, page renders

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add theme provider with system preference detection"
```

---

## Phase 2: Content Infrastructure

### Task 6: Create Blog Post Library

**Files:**
- Create: `lib/posts.ts`
- Create: `content/blog/.gitkeep`

**Step 1: Create content directory**

Run:
```bash
mkdir -p content/blog
touch content/blog/.gitkeep
```

**Step 2: Create posts library**

Create `lib/posts.ts`:

```typescript
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
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: create blog post library with frontmatter parsing"
```

---

### Task 7: Create Sample Blog Post

**Files:**
- Create: `content/blog/hello-world.mdx`

**Step 1: Create sample post**

Create `content/blog/hello-world.mdx`:

```mdx
---
title: "Hello World"
description: "Welcome to my developer blog. This is my first post."
publishedAt: 2026-01-04
tags: ["welcome", "meta"]
draft: false
---

Welcome to my developer blog! This is where I'll share my thoughts on software development, tutorials, and more.

## What to Expect

I'll be writing about:

- **Tutorials** - Step-by-step guides on various technologies
- **Deep Dives** - In-depth exploration of technical topics
- **Quick Tips** - Short, actionable development tips
- **Project Showcases** - Walkthroughs of projects I'm working on

## Tech Stack

This blog is built with:

- Next.js 15
- MDX for content
- Tailwind CSS for styling
- Hosted on Vercel

Stay tuned for more content!
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add sample hello-world blog post"
```

---

### Task 8: Configure Shiki Syntax Highlighting

**Files:**
- Modify: `next.config.ts`
- Create: `lib/shiki.ts`

**Step 1: Create Shiki configuration**

Create `lib/shiki.ts`:

```typescript
import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "json",
        "bash",
        "shell",
        "markdown",
        "mdx",
        "css",
        "html",
        "python",
        "rust",
        "go",
        "yaml",
        "toml",
        "sql",
        "graphql",
        "diff",
      ],
    });
  }
  return highlighter;
}

export async function highlightCode(
  code: string,
  lang: string
): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, {
    lang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  });
}
```

**Step 2: Update next.config.ts with rehype plugins**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});

export default withMDX(nextConfig);
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: configure Shiki syntax highlighting and rehype plugins"
```

---

## Phase 3: Layout Components

### Task 9: Create Header Component

**Files:**
- Create: `components/layout/header.tsx`
- Create: `components/theme-toggle.tsx`

**Step 1: Install dropdown menu for theme toggle**

Run:
```bash
npx shadcn@latest add dropdown-menu
```

Expected: Dropdown menu component added

**Step 2: Create theme toggle component**

Create `components/theme-toggle.tsx`:

```typescript
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Step 3: Create header component**

Create `components/layout/header.tsx`:

```typescript
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Dev Blog</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Blog
            </Link>
            <Link
              href="/tags"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Tags
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: create header component with navigation and theme toggle"
```

---

### Task 10: Create Footer Component

**Files:**
- Create: `components/layout/footer.tsx`

**Step 1: Create footer component**

Create `components/layout/footer.tsx`:

```typescript
import Link from "next/link";
import { Rss } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Dev Blog. All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="https://bsky.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">Bluesky</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
            </svg>
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">GitHub</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
            </svg>
          </Link>
          <Link
            href="/feed.xml"
            className="text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">RSS Feed</span>
            <Rss className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: create footer component with social links"
```

---

### Task 11: Update Root Layout with Header and Footer

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Update layout to include header and footer**

Replace `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dev Blog",
    template: "%s | Dev Blog",
  },
  description: "A developer blog about software engineering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Step 2: Verify layout renders**

Run:
```bash
npm run dev
```

Expected: Header and footer visible on page

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: integrate header and footer into root layout"
```

---

## Phase 4: Blog Pages

### Task 12: Create Blog Listing Page

**Files:**
- Create: `app/blog/page.tsx`
- Create: `components/blog/post-card.tsx`

**Step 1: Install card component**

Run:
```bash
npx shadcn@latest add card badge
```

Expected: Card and badge components added

**Step 2: Create post card component**

Create `components/blog/post-card.tsx`:

```typescript
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
```

**Step 3: Create blog listing page**

Create `app/blog/page.tsx`:

```typescript
import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/blog/post-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read my latest blog posts about software development",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Thoughts on software development, tutorials, and more.
          </p>
        </div>
      </div>
      <hr className="my-8" />
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Verify blog page renders**

Run:
```bash
npm run dev
```

Visit http://localhost:3000/blog
Expected: Blog page renders with hello-world post

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: create blog listing page with post cards"
```

---

### Task 13: Create Individual Blog Post Page

**Files:**
- Create: `app/blog/[slug]/page.tsx`
- Create: `components/blog/table-of-contents.tsx`

**Step 1: Create table of contents component**

Create `components/blog/table-of-contents.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = document.querySelectorAll("article h2, article h3");
    const items: TocItem[] = Array.from(elements).map((element) => ({
      id: element.id,
      text: element.textContent || "",
      level: element.tagName === "H2" ? 2 : 3,
    }));
    setHeadings(items);

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
```

**Step 2: Create blog post page**

Create `app/blog/[slug]/page.tsx`:

```typescript
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
```

**Step 3: Install typography plugin for prose styles**

Run:
```bash
npm install -D @tailwindcss/typography
```

**Step 4: Update Tailwind config**

Add typography plugin to `tailwind.config.ts`. Find the plugins array and add:

```typescript
plugins: [require("@tailwindcss/typography")],
```

**Step 5: Verify post page renders**

Run:
```bash
npm run dev
```

Visit http://localhost:3000/blog/hello-world
Expected: Blog post renders with title, date, content, and TOC

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: create individual blog post page with TOC and related posts"
```

---

### Task 14: Create Tags Pages

**Files:**
- Create: `app/tags/page.tsx`
- Create: `app/tags/[tag]/page.tsx`

**Step 1: Create all tags page**

Create `app/tags/page.tsx`:

```typescript
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
        <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
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
```

**Step 2: Create tag posts page**

Create `app/tags/[tag]/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { PostCard } from "@/components/blog/post-card";
import type { Metadata } from "next";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(({ tag }) => ({
    tag,
  }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Posts tagged "${tag}"`,
    description: `Browse all posts tagged with ${tag}`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4">
        <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
          #{tag}
        </h1>
        <p className="text-xl text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>
      <hr className="my-8" />
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Verify tags pages render**

Run:
```bash
npm run dev
```

Visit http://localhost:3000/tags
Expected: Tags page shows "welcome" and "meta" tags

Visit http://localhost:3000/tags/welcome
Expected: Tag page shows hello-world post

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: create tags overview and individual tag pages"
```

---

### Task 15: Create Homepage

**Files:**
- Modify: `app/page.tsx`

**Step 1: Update homepage**

Replace `app/page.tsx`:

```typescript
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/posts";
import { PostCard } from "@/components/blog/post-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 4);

  return (
    <div className="container py-10">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="flex max-w-[64rem] flex-col items-start gap-4">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to Dev Blog
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            A developer blog about software engineering, tutorials, and
            thoughts on building great software.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/blog">
                Read the blog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/about">About me</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Recent Posts</h2>
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            View all posts
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

**Step 2: Verify homepage renders**

Run:
```bash
npm run dev
```

Visit http://localhost:3000
Expected: Homepage with hero section and recent posts

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: create homepage with hero and recent posts"
```

---

### Task 16: Create About Page

**Files:**
- Create: `app/about/page.tsx`

**Step 1: Create about page**

Create `app/about/page.tsx`:

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about me and this blog",
};

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl tracking-tight lg:text-5xl mb-8">
          About
        </h1>
        <div className="prose prose-neutral dark:prose-invert">
          <p>
            Hi! I'm a software developer passionate about building great
            software and sharing what I learn along the way.
          </p>

          <h2>What I Write About</h2>
          <ul>
            <li>
              <strong>Tutorials</strong> - Step-by-step guides on various
              technologies
            </li>
            <li>
              <strong>Deep Dives</strong> - In-depth exploration of technical
              topics
            </li>
            <li>
              <strong>Quick Tips</strong> - Short, actionable development tips
            </li>
            <li>
              <strong>Project Showcases</strong> - Walkthroughs of projects I'm
              working on
            </li>
          </ul>

          <h2>Connect</h2>
          <p>
            You can find me on{" "}
            <a
              href="https://bsky.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bluesky
            </a>{" "}
            and{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </p>

          <h2>About This Blog</h2>
          <p>
            This blog is built with Next.js 15, MDX, and Tailwind CSS. It's
            hosted on Vercel. The source code is available on GitHub.
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: create about page"
```

---

## Phase 5: MDX Components

### Task 17: Create Custom MDX Components

**Files:**
- Create: `components/mdx/callout.tsx`
- Create: `components/mdx/code-block.tsx`
- Modify: `mdx-components.tsx`

**Step 1: Create callout component**

Create `components/mdx/callout.tsx`:

```typescript
import { cn } from "@/lib/utils";
import { AlertCircle, Info, Lightbulb, AlertTriangle } from "lucide-react";

interface CalloutProps {
  type?: "info" | "warning" | "tip" | "danger";
  children: React.ReactNode;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
  danger: AlertCircle,
};

const styles = {
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100",
  warning:
    "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 text-yellow-900 dark:text-yellow-100",
  tip: "border-green-500 bg-green-50 dark:bg-green-950/50 text-green-900 dark:text-green-100",
  danger:
    "border-red-500 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100",
};

export function Callout({ type = "info", children }: CalloutProps) {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border-l-4 p-4",
        styles[type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="prose-p:my-0">{children}</div>
    </div>
  );
}
```

**Step 2: Create code block component**

Create `components/mdx/code-block.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  filename?: string;
}

export function CodeBlock({ children, className, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const code = extractCode(children);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      {filename && (
        <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border-b text-sm text-muted-foreground">
          <span>{filename}</span>
        </div>
      )}
      <div className={cn("relative", filename && "rounded-t-none")}>
        <pre className={cn("overflow-x-auto", className)}>{children}</pre>
        <button
          onClick={copyToClipboard}
          className="absolute right-2 top-2 p-2 rounded-md bg-muted/80 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function extractCode(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(extractCode).join("");
  }
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    children.props.children
  ) {
    return extractCode(children.props.children);
  }
  return "";
}
```

**Step 3: Update mdx-components.tsx**

Replace `mdx-components.tsx`:

```typescript
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    pre: ({ children, ...props }) => (
      <CodeBlock {...props}>{children}</CodeBlock>
    ),
  };
}
```

**Step 4: Update hello-world post to use callout**

Update `content/blog/hello-world.mdx` to add a callout:

```mdx
---
title: "Hello World"
description: "Welcome to my developer blog. This is my first post."
publishedAt: 2026-01-04
tags: ["welcome", "meta"]
draft: false
---

Welcome to my developer blog! This is where I'll share my thoughts on software development, tutorials, and more.

<Callout type="tip">
Subscribe to the RSS feed to stay updated on new posts!
</Callout>

## What to Expect

I'll be writing about:

- **Tutorials** - Step-by-step guides on various technologies
- **Deep Dives** - In-depth exploration of technical topics
- **Quick Tips** - Short, actionable development tips
- **Project Showcases** - Walkthroughs of projects I'm working on

## Tech Stack

This blog is built with:

```typescript
const techStack = {
  framework: "Next.js 15",
  content: "MDX",
  styling: "Tailwind CSS",
  hosting: "Vercel",
};
```

Stay tuned for more content!
```

**Step 5: Verify MDX components work**

Run:
```bash
npm run dev
```

Visit http://localhost:3000/blog/hello-world
Expected: Callout renders with green styling, code block has copy button

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: create custom MDX components (Callout, CodeBlock)"
```

---

## Phase 6: Search

### Task 18: Create Search Functionality

**Files:**
- Create: `lib/search.ts`
- Create: `components/search-dialog.tsx`
- Modify: `components/layout/header.tsx`

**Step 1: Install dialog component**

Run:
```bash
npx shadcn@latest add dialog input
```

Expected: Dialog and input components added

**Step 2: Create search library**

Create `lib/search.ts`:

```typescript
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
```

**Step 3: Create search dialog component**

Create `components/search-dialog.tsx`:

```typescript
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
```

**Step 4: Create header wrapper for search**

Create `components/layout/header-client.tsx`:

```typescript
"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchDialog } from "@/components/search-dialog";
import type { PostMeta } from "@/lib/posts";

interface HeaderClientProps {
  posts: PostMeta[];
}

export function HeaderClient({ posts }: HeaderClientProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Dev Blog</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Blog
            </Link>
            <Link
              href="/tags"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Tags
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <SearchDialog posts={posts} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

**Step 5: Update original header to server component that fetches posts**

Replace `components/layout/header.tsx`:

```typescript
import { getAllPosts } from "@/lib/posts";
import { HeaderClient } from "./header-client";

export function Header() {
  const posts = getAllPosts();
  return <HeaderClient posts={posts} />;
}
```

**Step 6: Verify search works**

Run:
```bash
npm run dev
```

Click search icon or press ⌘K
Type "hello"
Expected: hello-world post appears in results

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add client-side search with Fuse.js"
```

---

## Phase 7: SEO & Feeds

### Task 19: Create RSS Feed

**Files:**
- Create: `app/feed.xml/route.ts`

**Step 1: Create RSS feed route**

Create `app/feed.xml/route.ts`:

```typescript
import { getAllPosts } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export async function GET() {
  const posts = getAllPosts();

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dev Blog</title>
    <description>A developer blog about software engineering</description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.frontmatter.title}]]></title>
      <description><![CDATA[${post.frontmatter.description}]]></description>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.frontmatter.publishedAt).toUTCString()}</pubDate>
      ${post.frontmatter.tags.map((tag) => `<category>${tag}</category>`).join("\n      ")}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
```

**Step 2: Verify RSS feed**

Run:
```bash
npm run dev
```

Visit http://localhost:3000/feed.xml
Expected: Valid RSS XML with hello-world post

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add RSS feed at /feed.xml"
```

---

### Task 20: Create Sitemap

**Files:**
- Create: `app/sitemap.ts`

**Step 1: Create sitemap**

Create `app/sitemap.ts`:

```typescript
import { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const tags = getAllTags();

  const blogPosts = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(
      post.frontmatter.updatedAt || post.frontmatter.publishedAt
    ),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const tagPages = tags.map(({ tag }) => ({
    url: `${SITE_URL}/tags/${tag}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...blogPosts,
    ...tagPages,
  ];
}
```

**Step 2: Verify sitemap**

Run:
```bash
npm run dev
```

Visit http://localhost:3000/sitemap.xml
Expected: Valid sitemap XML with all routes

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add auto-generated sitemap"
```

---

### Task 21: Create robots.txt

**Files:**
- Create: `app/robots.ts`

**Step 1: Create robots.txt**

Create `app/robots.ts`:

```typescript
import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add robots.txt"
```

---

### Task 22: Add JSON-LD Structured Data

**Files:**
- Create: `components/json-ld.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create JSON-LD component**

Create `components/json-ld.tsx`:

```typescript
import type { Post } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

interface ArticleJsonLdProps {
  post: Post;
}

export function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.publishedAt,
    dateModified: post.frontmatter.updatedAt || post.frontmatter.publishedAt,
    author: {
      "@type": "Person",
      name: "Your Name",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Dev Blog",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.frontmatter.tags.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dev Blog",
    url: SITE_URL,
    description: "A developer blog about software engineering",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Step 2: Add WebsiteJsonLd to layout**

Update `app/layout.tsx` to include WebsiteJsonLd:

Add import:
```typescript
import { WebsiteJsonLd } from "@/components/json-ld";
```

Add after `<Header />`:
```typescript
<WebsiteJsonLd />
```

**Step 3: Add ArticleJsonLd to blog post page**

Update `app/blog/[slug]/page.tsx`:

Add import:
```typescript
import { ArticleJsonLd } from "@/components/json-ld";
```

Add after the opening `<div>` in the return:
```typescript
<ArticleJsonLd post={post} />
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add JSON-LD structured data for SEO"
```

---

## Phase 8: OG Images

### Task 23: Create OG Image Generation

**Files:**
- Create: `app/api/og/route.tsx`
- Modify: `app/blog/[slug]/page.tsx`

**Step 1: Create OG image route**

Create `app/api/og/route.tsx`:

```typescript
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Dev Blog";
  const description = searchParams.get("description") || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#09090b",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 32,
                color: "#a1a1aa",
                maxWidth: "800px",
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#71717a",
            }}
          >
            Dev Blog
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

**Step 2: Update blog post metadata to use OG image**

Update `app/blog/[slug]/page.tsx` generateMetadata:

```typescript
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(
    post.frontmatter.title
  )}&description=${encodeURIComponent(post.frontmatter.description)}`;

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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: [ogImage],
    },
  };
}
```

**Step 3: Verify OG image generation**

Run:
```bash
npm run dev
```

Visit http://localhost:3000/api/og?title=Hello%20World&description=Test
Expected: Image renders with title and description

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add dynamic OG image generation"
```

---

## Phase 9: Share & Social

### Task 24: Add Share Buttons

**Files:**
- Create: `components/blog/share-buttons.tsx`
- Modify: `app/blog/[slug]/page.tsx`

**Step 1: Create share buttons component**

Create `components/blog/share-buttons.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const url = `${siteUrl}/blog/${slug}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToBluesky = () => {
    const text = `${title}\n\n${url}`;
    window.open(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareToTwitter = () => {
    const text = title;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <div className="flex items-center gap-2 pt-8 border-t">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <Share2 className="h-4 w-4" />
        Share:
      </span>
      <Button variant="outline" size="sm" onClick={copyToClipboard}>
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copy link
          </>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={shareToBluesky}>
        Bluesky
      </Button>
      <Button variant="outline" size="sm" onClick={shareToTwitter}>
        Twitter
      </Button>
    </div>
  );
}
```

**Step 2: Add share buttons to blog post page**

Update `app/blog/[slug]/page.tsx`:

Add import:
```typescript
import { ShareButtons } from "@/components/blog/share-buttons";
```

Add after the prose div and before the `</article>` tag:
```typescript
<ShareButtons title={post.frontmatter.title} slug={post.slug} />
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add share buttons to blog posts"
```

---

## Phase 10: Bluesky Integration

### Task 25: Create Bluesky Client

**Files:**
- Create: `lib/bluesky.ts`

**Step 1: Create Bluesky client**

Create `lib/bluesky.ts`:

```typescript
import { BskyAgent, RichText } from "@atproto/api";

const agent = new BskyAgent({
  service: "https://bsky.social",
});

interface PostToBlueskyParams {
  title: string;
  description: string;
  url: string;
  tags: string[];
}

export async function postToBluesky({
  title,
  description,
  url,
  tags,
}: PostToBlueskyParams): Promise<{ success: boolean; uri?: string; error?: string }> {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;

  if (!handle || !password) {
    return { success: false, error: "Bluesky credentials not configured" };
  }

  try {
    await agent.login({ identifier: handle, password });

    const hashtags = tags.map((tag) => `#${tag.replace(/\s+/g, "")}`).join(" ");
    const postText = `New blog post: "${title}"\n\n${description}\n\n${url}\n\n${hashtags}`;

    // Create rich text with facets for links and hashtags
    const rt = new RichText({ text: postText });
    await rt.detectFacets(agent);

    const response = await agent.post({
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    });

    return { success: true, uri: response.uri };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: create Bluesky API client"
```

---

### Task 26: Create Post Manifest System

**Files:**
- Create: `lib/manifest.ts`
- Create: `posted-manifest.json`

**Step 1: Create manifest library**

Create `lib/manifest.ts`:

```typescript
import fs from "fs";
import path from "path";

const MANIFEST_PATH = path.join(process.cwd(), "posted-manifest.json");

interface Manifest {
  postedSlugs: string[];
  lastUpdated: string;
}

export function getManifest(): Manifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { postedSlugs: [], lastUpdated: new Date().toISOString() };
  }

  const content = fs.readFileSync(MANIFEST_PATH, "utf-8");
  return JSON.parse(content);
}

export function saveManifest(manifest: Manifest): void {
  manifest.lastUpdated = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

export function isPostAlreadyPosted(slug: string): boolean {
  const manifest = getManifest();
  return manifest.postedSlugs.includes(slug);
}

export function markPostAsPosted(slug: string): void {
  const manifest = getManifest();
  if (!manifest.postedSlugs.includes(slug)) {
    manifest.postedSlugs.push(slug);
    saveManifest(manifest);
  }
}

export function getNewPosts(allSlugs: string[]): string[] {
  const manifest = getManifest();
  return allSlugs.filter((slug) => !manifest.postedSlugs.includes(slug));
}
```

**Step 2: Create initial manifest file**

Create `posted-manifest.json`:

```json
{
  "postedSlugs": [],
  "lastUpdated": ""
}
```

**Step 3: Add manifest to .gitignore (optional - depends on workflow)**

The manifest tracks what's been posted. You might want to commit it or ignore it depending on your workflow.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: create post manifest system for tracking Bluesky posts"
```

---

### Task 27: Create Bluesky Webhook Endpoint

**Files:**
- Create: `app/api/bluesky-post/route.ts`

**Step 1: Create webhook endpoint**

Create `app/api/bluesky-post/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { postToBluesky } from "@/lib/bluesky";
import { getNewPosts, markPostAsPosted } from "@/lib/manifest";

const WEBHOOK_SECRET = process.env.BLUESKY_WEBHOOK_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const authHeader = request.headers.get("authorization");
  if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allPosts = getAllPosts();
    const allSlugs = allPosts.map((p) => p.slug);
    const newSlugs = getNewPosts(allSlugs);

    if (newSlugs.length === 0) {
      return NextResponse.json({ message: "No new posts to share" });
    }

    const results = [];

    for (const slug of newSlugs) {
      const post = getPostBySlug(slug);
      if (!post || post.frontmatter.draft) {
        continue;
      }

      const result = await postToBluesky({
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        url: `${SITE_URL}/blog/${slug}`,
        tags: post.frontmatter.tags,
      });

      if (result.success) {
        markPostAsPosted(slug);
        results.push({ slug, success: true, uri: result.uri });
      } else {
        results.push({ slug, success: false, error: result.error });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: create Bluesky webhook endpoint for auto-posting"
```

---

## Phase 11: Environment & Deployment

### Task 28: Create Environment Configuration

**Files:**
- Create: `.env.example`
- Modify: `.gitignore`

**Step 1: Create environment example file**

Create `.env.example`:

```
# Site URL (required for OG images, sitemap, RSS)
NEXT_PUBLIC_SITE_URL=https://yourblog.dev

# Bluesky credentials (for auto-posting)
BLUESKY_HANDLE=your.handle.bsky.social
BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Webhook secret (optional, for securing the Bluesky endpoint)
BLUESKY_WEBHOOK_SECRET=your-secret-here
```

**Step 2: Verify .gitignore includes .env files**

Check `.gitignore` contains:
```
.env*.local
```

If not, add it.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: add environment configuration example"
```

---

### Task 29: Build and Test Production

**Files:**
- None (verification step)

**Step 1: Run production build**

Run:
```bash
npm run build
```

Expected: Build completes successfully

**Step 2: Run production server**

Run:
```bash
npm run start
```

Expected: Server starts, all pages render correctly

**Step 3: Test key features**

- Visit http://localhost:3000 - Homepage renders
- Visit http://localhost:3000/blog - Blog listing renders
- Visit http://localhost:3000/blog/hello-world - Post renders with TOC
- Visit http://localhost:3000/tags - Tags page renders
- Visit http://localhost:3000/about - About page renders
- Visit http://localhost:3000/feed.xml - RSS feed renders
- Visit http://localhost:3000/sitemap.xml - Sitemap renders
- Toggle theme - Persists on refresh
- Search (⌘K) - Finds hello-world post

**Step 4: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix: production build issues"
```

---

### Task 30: Final Cleanup and Documentation

**Files:**
- Modify: `README.md` (or create if needed)

**Step 1: Update README with project info**

Create or update `README.md`:

```markdown
# Dev Blog

A modern developer blog built with Next.js 15, MDX, and Tailwind CSS.

## Features

- **MDX Content** - Write posts in Markdown with React components
- **Syntax Highlighting** - Shiki-powered code blocks with copy button
- **Dark Mode** - System preference detection with manual toggle
- **Search** - Client-side fuzzy search with Fuse.js
- **SEO Optimized** - Sitemap, RSS, Open Graph, JSON-LD
- **Bluesky Integration** - Auto-post new content
- **Static Generation** - Fast, CDN-cached pages

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment: `cp .env.example .env.local`
4. Run development server: `npm run dev`

## Writing Posts

Create MDX files in `content/blog/`:

\`\`\`mdx
---
title: "Your Post Title"
description: "A brief description"
publishedAt: 2026-01-04
tags: ["tag1", "tag2"]
draft: false
---

Your content here...
\`\`\`

## Deployment

Deploy to Vercel:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

## Environment Variables

See `.env.example` for required variables.

## License

MIT
```

**Step 2: Final commit**

```bash
git add -A
git commit -m "docs: add README with project documentation"
```

---

## Summary

This implementation plan covers:

1. **Phase 1** - Project setup with Next.js 15, MDX, TypeScript, Tailwind, shadcn/ui
2. **Phase 2** - Content infrastructure with post library and Shiki highlighting
3. **Phase 3** - Layout components (Header, Footer, Theme toggle)
4. **Phase 4** - Blog pages (listing, individual post, tags, homepage, about)
5. **Phase 5** - Custom MDX components (Callout, CodeBlock)
6. **Phase 6** - Search functionality with Fuse.js
7. **Phase 7** - SEO & feeds (RSS, sitemap, robots.txt, JSON-LD)
8. **Phase 8** - OG image generation
9. **Phase 9** - Share buttons
10. **Phase 10** - Bluesky integration
11. **Phase 11** - Environment configuration and deployment

Total: 30 tasks with TDD approach and frequent commits.
