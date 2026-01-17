# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 developer blog with MDX content, Tailwind CSS 4, and TypeScript strict mode. See @README.md for full feature list.

## Commands

- `npm run dev` - Start dev server at localhost:3000
- `npm run build` - Build for production (run to verify changes)
- `npm run lint` - Run ESLint

**IMPORTANT:** Always run `npm run build` after making changes to verify no build errors.

## Architecture

Path alias `@/*` maps to project root.

- `content/blog/*.mdx` - Blog posts with frontmatter
- `lib/posts.ts` - Post loading, parsing, and filtering (drafts hidden in production)
- `app/blog/[slug]/page.tsx` - Dynamic MDX import via `import(`@/content/blog/${slug}.mdx`)`
- `components/mdx/` - Custom MDX components (Callout)
- `components/ui/` - shadcn/ui components

## Writing Blog Posts

Create `content/blog/my-post.mdx` with frontmatter:

```yaml
title: "Post Title"
description: "SEO description"
publishedAt: 2026-01-04
tags: ["tag1", "tag2"]
draft: false  # Set true to hide in production
```

## Gotchas

- MDX files use `<Callout type="info|warning|tip">` component - registered in `mdx-components.tsx`
- Escape `<` characters in MDX code examples or build fails
- Draft posts only visible in development (`npm run dev`)
