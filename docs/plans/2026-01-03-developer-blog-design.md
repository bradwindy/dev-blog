# Developer Blog Design

## Overview

A modern developer blog built with Next.js 15, MDX, and Tailwind CSS. Hosted on Vercel with automatic Bluesky posting on new content.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Content | MDX via `@next/mdx` |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix UI primitives) |
| Syntax Highlighting | Shiki |
| Search | Fuse.js (client-side) |
| Hosting | Vercel |
| Analytics | Vercel Analytics |

## Content Structure

### Blog Post Format

Posts live in `/content/blog/` as MDX files:

```mdx
---
title: "Building a CLI Tool in Rust"
description: "A step-by-step guide to creating your first CLI"
publishedAt: 2026-01-03
updatedAt: 2026-01-03
tags: ["rust", "cli", "tutorial"]
image: /images/blog/rust-cli-cover.jpg
draft: false
---

Content with <CustomComponents /> supported...
```

### Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Post title (SEO + display) |
| `description` | string | Short description (SEO + social) |
| `publishedAt` | date | Original publish date |
| `updatedAt` | date | Last update date |
| `tags` | string[] | Tags for filtering/related posts |
| `image` | string | OG image path |
| `draft` | boolean | Exclude from production |

### Auto-Generated at Build

- Reading time (word count based)
- Table of contents (extracted from headings)
- Slug (from filename)
- Related posts (tag matching)
- Search index (Fuse.js)

### Custom MDX Components

- `<Callout type="info|warning|tip">` - Styled callout boxes
- `<CodeBlock>` - Enhanced code with copy button, filename, line highlighting
- `<Image>` - Optimized images with captions

## Project Structure

```
/app
  /page.tsx              # Homepage
  /blog
    /page.tsx            # Blog listing
    /[slug]/page.tsx     # Individual post
  /tags
    /page.tsx            # All tags
    /[tag]/page.tsx      # Posts by tag
  /about/page.tsx        # About page
  /feed.xml/route.ts     # RSS feed
  /api/og/route.tsx      # OG image generation

/content
  /blog                  # MDX blog posts

/components
  /ui                    # shadcn/ui components
  /blog                  # Blog-specific components
  /layout                # Header, Footer, Navigation
  /mdx                   # Custom MDX components

/lib
  /mdx.ts                # MDX processing utilities
  /posts.ts              # Post fetching/sorting
  /search.ts             # Search index generation
  /bluesky.ts            # Bluesky API client

/public
  /images                # Static images
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage - featured/recent posts, intro |
| `/blog` | All posts with tag filtering and search |
| `/blog/[slug]` | Individual post |
| `/tags` | All tags overview |
| `/tags/[tag]` | Posts filtered by tag |
| `/about` | Author bio, credentials, social links |
| `/feed.xml` | RSS feed |

## Features

### Theme Toggle

- Detects system preference on first visit
- Manual toggle available in header
- Persists choice in localStorage
- Uses `next-themes` for implementation

### RSS Feed

- Generated at build time at `/feed.xml`
- Full post content included
- Standard RSS 2.0 format

### Bluesky Auto-Posting

**Flow:**
1. New commit with blog post pushed to main
2. Vercel builds the site
3. Build script detects new posts (compares to manifest)
4. Post-deploy webhook triggers serverless function
5. Function posts to Bluesky via `@atproto/api`
6. Manifest updated to prevent duplicates

**Post Format:**
```
New blog post: "Building a CLI Tool in Rust"

A step-by-step guide to creating your first CLI

https://yourblog.dev/blog/building-cli-rust

#rust #cli #tutorial
```

**Security:**
- App Password stored in Vercel env vars
- Manifest tracks posted slugs

### Search

- Fuse.js for fuzzy client-side search
- Search index generated at build time
- Searches title, description, tags, content
- Triggered via search button in header (modal/command palette style)

### Blog Post Features

- Reading time estimate
- Publish date and "last updated" date
- Tags (linked to tag pages)
- Auto-generated table of contents (sticky sidebar on desktop)
- Related posts (3 cards, matched by tags)
- Share buttons (copy link, Bluesky, Twitter/X)
- Copy code button on all code blocks

### OG Image Generation

- Auto-generated using `@vercel/og` (Satori)
- Displays post title, description, site branding
- Generated on-demand at `/api/og?title=...`
- Cached at edge for performance

### Draft Preview

- Posts with `draft: true` excluded from production
- Visible in development mode
- Visual indicator for draft status locally

## SEO Implementation

### Metadata

- Dynamic metadata via Next.js `generateMetadata`
- Title, description, OG tags per page
- Twitter card metadata

### Structured Data (JSON-LD)

- `Article` schema for blog posts
- `Person` schema for author
- `BreadcrumbList` for navigation
- `WebSite` schema with search action

### Technical SEO

- Auto-generated sitemap at `/sitemap.xml`
- `robots.txt` with proper directives
- Canonical URLs on all pages
- Clean URL structure (`/blog/[slug]`)

## GEO (Generative Engine Optimization)

Optimized for AI engines (ChatGPT, Perplexity, Claude):

- **Direct answers first** - TL;DR or summary in opening paragraph
- **Fact density** - Statistics and concrete examples throughout
- **Clear heading hierarchy** - H2/H3 structure AI can parse
- **E-E-A-T signals** - Author bio with credentials on `/about`
- **Fresh dates** - Visible publish/update dates
- **Quotable statements** - Clear, citable sentences

## UI/Layout

### Header

- Logo/site name (links to home)
- Navigation: Blog, Tags, About
- Search button (opens modal)
- Theme toggle

### Footer

- Social links (Bluesky, GitHub)
- RSS feed link
- Copyright

### Blog Post Layout

```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Title                               │
│ Published · Updated · Reading time  │
│ Tags                                │
├──────────────────────┬──────────────┤
│                      │ Table of     │
│   Post content       │ Contents     │
│   (MDX rendered)     │ (sticky)     │
│                      │              │
├──────────────────────┴──────────────┤
│ Share buttons                       │
├─────────────────────────────────────┤
│ Related posts (3 cards)             │
├─────────────────────────────────────┤
│ Footer                              │
└─────────────────────────────────────┘
```

### Design Principles

- Clean, minimal design focused on readability
- Generous whitespace
- Comfortable line length (65-75 characters)
- System font stack or single variable font
- Responsive (mobile-first)

## Performance

- Static generation for all blog posts
- Next.js Image optimization
- Font optimization (preload, display swap)
- Minimal client-side JavaScript
- Edge caching via Vercel CDN
- Core Web Vitals optimized

## Dependencies

### Core

- `next` - Framework
- `react`, `react-dom` - UI library
- `typescript` - Type safety

### Content

- `@next/mdx` - MDX support
- `@mdx-js/react` - MDX React runtime
- `shiki` - Syntax highlighting
- `rehype-slug` - Heading IDs
- `rehype-autolink-headings` - Heading links
- `remark-gfm` - GitHub Flavored Markdown

### UI

- `tailwindcss` - Styling
- `@radix-ui/*` - Accessible primitives (via shadcn)
- `next-themes` - Theme management
- `lucide-react` - Icons

### Features

- `fuse.js` - Search
- `@atproto/api` - Bluesky integration
- `@vercel/og` - OG image generation
- `@vercel/analytics` - Analytics

## Environment Variables

```
# Bluesky
BLUESKY_HANDLE=your.handle.bsky.social
BLUESKY_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Site
NEXT_PUBLIC_SITE_URL=https://yourblog.dev
```

## Sources & References

- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx)
- [Getting started with Next.js 15 and MDX](https://dev.to/ptpaterson/getting-started-with-nextjs-15-and-mdx-305k)
- [GEO Best Practices 2025](https://www.tryprofound.com/guides/generative-engine-optimization-geo-guide-2025)
- [SEO Best Practices for Developers 2025](https://dev.to/thesohailjafri/the-must-have-seo-checklist-for-developers-192i)
- [Bluesky API Documentation](https://docs.bsky.app/docs/get-started)
- [Posting via Bluesky API](https://docs.bsky.app/blog/create-post)
