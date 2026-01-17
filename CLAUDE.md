# Dev Blog

Personal developer blog. See @README.md for full details and @package.json for all scripts.

## Commands

- `npm run dev` - Development server at localhost:3000
- `npm run build` - Production build
- `npm run lint` - ESLint check

**IMPORTANT:** Run `npm run build` after changes to verify no build errors.

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript 5 (strict), Tailwind CSS 4, MDX

## Architecture

- `app/` - Next.js App Router pages
- `content/blog/*.mdx` - Blog posts with frontmatter
- `lib/posts.ts` - Post loading and filtering (drafts hidden in production)
- `components/mdx/` - Custom MDX components (Callout)
- `components/ui/` - shadcn/ui primitives

## Code Style

- Server Components by default; `'use client'` only where needed
- Prefer named exports
- Use existing patterns in codebase

## Writing Blog Posts

Create `content/blog/my-post.mdx` with frontmatter. See existing posts for format.
- Set `draft: true` to hide in production
- Use `<Callout type="info|warning|tip">` for callouts

## Gotchas

- **IMPORTANT:** Escape `<` characters in MDX code examples or build fails
- Callout component registered in `mdx-components.tsx`
- Draft posts only visible in development (`npm run dev`)
