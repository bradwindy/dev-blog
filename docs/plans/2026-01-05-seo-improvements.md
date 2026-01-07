# SEO Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement comprehensive SEO improvements including metadataBase, canonical URLs, BlogPosting schema, Person schema, and BreadcrumbList structured data.

**Architecture:** Enhance the existing Next.js metadata system with metadataBase for absolute URLs, add structured data components for Person and BreadcrumbList schemas, and upgrade Article schema to BlogPosting. All changes follow Next.js 15 conventions.

**Tech Stack:** Next.js 15, TypeScript, JSON-LD structured data, Schema.org vocabulary

---

## Research Summary (2025 Best Practices)

### BlogPosting Schema
- No strictly required properties, but `headline`, `image`, `datePublished`, `author`, `dateModified` are effectively mandatory for best results
- BlogPosting is preferred over generic Article for blog content (conversational, update-style posts)
- Avoid generic author names like "Admin" - use real names for E-E-A-T
- Important for AI-powered search (Google AI Overview, Perplexity, etc.)

### Person Schema
- Critical for E-E-A-T signals in 2025
- Key properties: `name`, `url`, `sameAs`, `jobTitle`, `knowsAbout`, `description`
- Use `@id` to link Person across multiple articles
- Keep `sameAs` to under 15 URLs (quality over quantity)
- Include active social profiles (GitHub, LinkedIn, Bluesky)

### Canonical URLs
- Always use absolute URLs (metadataBase + relative path achieves this)
- Self-referencing canonicals are recommended even for unique pages
- Trailing slash consistency is critical - Google treats with/without as different pages
- Known Next.js behavior: metadataBase adds trailing slash to base URL

### BreadcrumbList Schema
- Minimum 2 items required
- Last breadcrumb should omit the `item` property (user is already on that page)
- Always use absolute URLs with https://
- Note: Google removed breadcrumbs from mobile SERPs (Aug 2025), but still valuable for desktop and semantic structure

---

## Task 1: Add metadataBase to Root Layout

**Files:**
- Modify: `app/layout.tsx:31-57`

**Step 1: Add metadataBase to metadata export**

In `app/layout.tsx`, add `metadataBase` as the first property of the metadata object (line 32):

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  title: {
    default: "Bradley Windybank",
    template: "%s | Bradley Windybank",
  },
  description: "A blog about software development, AI, iOS, and thoughts on building sometimes great software.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};
```

**Step 2: Verify the change**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(seo): add metadataBase for absolute URL generation"
```

---

## Task 2: Add Canonical URLs to Blog Posts

**Files:**
- Modify: `app/blog/[slug]/page.tsx:23-64`

**Step 1: Add alternates.canonical to generateMetadata**

In `app/blog/[slug]/page.tsx`, add canonical URL to the returned metadata object. Update the return statement (around line 40) to include `alternates`:

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
    alternates: {
      canonical: `/blog/${slug}`,
    },
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

**Step 2: Verify the change**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/blog/[slug]/page.tsx
git commit -m "feat(seo): add canonical URLs to blog posts"
```

---

## Task 3: Upgrade Article Schema to BlogPosting

**Files:**
- Modify: `components/json-ld.tsx:9-37`

**Step 1: Change @type from Article to BlogPosting**

In `components/json-ld.tsx`, update the ArticleJsonLd function. Change `"@type": "Article"` to `"@type": "BlogPosting"`, add `articleSection`, and link author via `@id` for entity recognition:

```typescript
export function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.publishedAt,
    dateModified: post.frontmatter.updatedAt || post.frontmatter.publishedAt,
    articleSection: "Technology",
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/about#person`,
      name: "Bradley Windybank",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Bradley Windybank",
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
```

**Step 2: Update WebsiteJsonLd with correct site name**

In the same file, update the WebsiteJsonLd function (lines 42-62):

```typescript
export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bradley Windybank",
    url: SITE_URL,
    description: "A blog about software development, AI, iOS, and thoughts on building sometimes great software.",
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

**Step 3: Verify the change**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/json-ld.tsx
git commit -m "feat(seo): upgrade Article to BlogPosting schema, fix site naming"
```

---

## Task 4: Add Person Schema Component

**Files:**
- Modify: `components/json-ld.tsx` (add new export)
- Modify: `app/about/page.tsx:1-10`

**Step 1: Add PersonJsonLd component to json-ld.tsx**

Add this new component at the end of `components/json-ld.tsx`. Note: Uses `@id` for entity linking across articles, includes `knowsAbout` for E-E-A-T:

```typescript
export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/about#person`,
    name: "Bradley Windybank",
    url: `${SITE_URL}/about`,
    sameAs: [
      "https://github.com/bradwindy",
      "https://bsky.app/profile/bradwindy.bsky.social",
    ],
    jobTitle: "Software Developer",
    knowsAbout: ["Software Development", "iOS", "AI", "Web Development"],
    description: "A software developer passionate about building great software and sharing knowledge.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Step 2: Import and use PersonJsonLd in about page**

Update `app/about/page.tsx`:

```typescript
import type { Metadata } from "next";
import { PersonJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about me and this blog",
};

export default function AboutPage() {
  return (
    <>
      <PersonJsonLd />
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl tracking-tight lg:text-5xl mb-8">
            About
          </h1>
          <div className="prose prose-neutral dark:prose-invert">
            <p>
              Hi! I&apos;m a software developer passionate about building great
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
                <strong>Project Showcases</strong> - Walkthroughs of projects I&apos;m
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
              This blog is built with Next.js 15, MDX, and Tailwind CSS. It&apos;s
              hosted on Vercel. The source code is available on GitHub.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
```

**Step 3: Verify the change**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/json-ld.tsx app/about/page.tsx
git commit -m "feat(seo): add Person schema to about page"
```

---

## Task 5: Add BreadcrumbList Schema Component

**Files:**
- Modify: `components/json-ld.tsx` (add new export)
- Modify: `app/blog/[slug]/page.tsx` (import and use)

**Step 1: Add BreadcrumbJsonLd component to json-ld.tsx**

Add this new component to `components/json-ld.tsx`. Note: Last item omits `item` property per Google best practices (user is already on that page):

```typescript
interface BreadcrumbItem {
  name: string;
  url?: string; // Optional - omit for last item
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const listItem: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
      };
      // Only add item URL if provided (omit for last breadcrumb)
      if (item.url) {
        listItem.item = item.url;
      }
      return listItem;
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

**Step 2: Import BreadcrumbJsonLd in blog post page**

Update the imports in `app/blog/[slug]/page.tsx` (line 9):

```typescript
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";
```

**Step 3: Add BreadcrumbJsonLd to blog post render**

In the BlogPostPage component (around line 99), add BreadcrumbJsonLd alongside ArticleJsonLd. Find where `<ArticleJsonLd post={post} />` is rendered and add the breadcrumb. Note: Last item omits URL per best practices:

```typescript
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

// Inside the return JSX, add alongside ArticleJsonLd:
<ArticleJsonLd post={post} />
<BreadcrumbJsonLd
  items={[
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: post.frontmatter.title }, // No URL - user is on this page
  ]}
/>
```

**Step 4: Verify the change**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add components/json-ld.tsx app/blog/[slug]/page.tsx
git commit -m "feat(seo): add BreadcrumbList schema to blog posts"
```

---

## Task 6: Add Canonical URLs to Static Pages

**Files:**
- Modify: `app/page.tsx` (home page)
- Modify: `app/blog/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/tags/page.tsx`

**Step 1: Add canonical to home page metadata**

In `app/page.tsx`, update the metadata export to include alternates:

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};
```

**Step 2: Add canonical to blog index page**

In `app/blog/page.tsx`, update metadata:

```typescript
export const metadata: Metadata = {
  title: "Blog",
  description: "Read my latest blog posts about software development",
  alternates: {
    canonical: "/blog",
  },
};
```

**Step 3: Add canonical to about page**

In `app/about/page.tsx`, update metadata:

```typescript
export const metadata: Metadata = {
  title: "About",
  description: "Learn more about me and this blog",
  alternates: {
    canonical: "/about",
  },
};
```

**Step 4: Add canonical to tags index page**

In `app/tags/page.tsx`, update metadata:

```typescript
export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all tags",
  alternates: {
    canonical: "/tags",
  },
};
```

**Step 5: Verify the change**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add app/page.tsx app/blog/page.tsx app/about/page.tsx app/tags/page.tsx
git commit -m "feat(seo): add canonical URLs to all static pages"
```

---

## Task 7: Add Canonical URLs to Dynamic Tag Pages

**Files:**
- Modify: `app/tags/[tag]/page.tsx`

**Step 1: Update generateMetadata to include canonical**

Find the `generateMetadata` function and add the alternates property:

```typescript
export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag}`,
    description: `All posts tagged with ${decodedTag}`,
    alternates: {
      canonical: `/tags/${tag}`,
    },
  };
}
```

**Step 2: Verify the change**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/tags/[tag]/page.tsx
git commit -m "feat(seo): add canonical URLs to tag pages"
```

---

## Task 8: Add HTML Lang Attribute

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Add lang attribute to html element**

In `app/layout.tsx`, find the `<html>` tag and add the lang attribute:

```typescript
<html lang="en" suppressHydrationWarning>
```

**Step 2: Verify the change**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(seo): add lang attribute to html element"
```

---

## Task 9: Final Verification

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Run dev server and test**

Run: `npm run dev`

Test these pages in browser dev tools (View Source):
- Home page: Check for canonical URL and lang attribute
- Blog post: Check for BlogPosting JSON-LD, BreadcrumbList JSON-LD, canonical URL
- About page: Check for Person JSON-LD, canonical URL
- Tags page: Check for canonical URL

**Step 3: Validate structured data**

Use Google's Rich Results Test (https://search.google.com/test/rich-results) on:
- A blog post URL
- The about page URL

Expected: All structured data validates without errors

**Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(seo): address any validation issues"
```

---

## Summary of Changes

| Task | File(s) | Change |
|------|---------|--------|
| 1 | `app/layout.tsx` | Add metadataBase |
| 2 | `app/blog/[slug]/page.tsx` | Add canonical URLs |
| 3 | `components/json-ld.tsx` | Upgrade to BlogPosting schema |
| 4 | `components/json-ld.tsx`, `app/about/page.tsx` | Add Person schema |
| 5 | `components/json-ld.tsx`, `app/blog/[slug]/page.tsx` | Add BreadcrumbList schema |
| 6 | `app/page.tsx`, `app/blog/page.tsx`, `app/about/page.tsx`, `app/tags/page.tsx` | Add canonical URLs |
| 7 | `app/tags/[tag]/page.tsx` | Add canonical URLs |
| 8 | `app/layout.tsx` | Add lang attribute |
| 9 | All | Final verification |
