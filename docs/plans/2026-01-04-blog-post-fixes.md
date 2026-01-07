# Blog Post Display Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix blog post display issues including frontmatter leak, code syntax highlighting, and padding

**Architecture:** Add remark-frontmatter to strip frontmatter from rendered MDX, integrate rehype-pretty-code with Shiki for syntax highlighting, style code blocks with distinct backgrounds, add padding around content dividers

**Tech Stack:** Next.js 15 + @next/mdx, remark-frontmatter, rehype-pretty-code, Shiki, Tailwind CSS

---

## Task 1: Install Required Packages

**Files:**
- Modify: `package.json`

**Step 1: Install remark-frontmatter and rehype-pretty-code**

Run: `npm install remark-frontmatter rehype-pretty-code`

**Step 2: Verify installation**

Run: `cat package.json | grep -E "(remark-frontmatter|rehype-pretty-code)"`
Expected: Both packages listed in dependencies

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add remark-frontmatter and rehype-pretty-code packages"
```

---

## Task 2: Configure MDX to Strip Frontmatter

**Files:**
- Modify: `next.config.ts`

**Step 1: Add remark-frontmatter to remarkPlugins**

Update `next.config.ts` to add remark-frontmatter which will strip the YAML frontmatter from rendering:

```typescript
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-frontmatter"],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-autolink-headings", { behavior: "wrap" }],
    ],
  },
});

export default withMDX(nextConfig);
```

**Step 2: Restart dev server and verify frontmatter is no longer visible**

Run: `npm run dev` (in background)
Navigate to: http://localhost:3000/blog/hello-world
Expected: No raw frontmatter text (title, description, publishedAt, etc.) visible at top of blog post content

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "fix: strip frontmatter from rendered MDX content"
```

---

## Task 3: Add Syntax Highlighting with rehype-pretty-code

**Files:**
- Modify: `next.config.ts`

**Step 1: Configure rehype-pretty-code with Shiki**

Update `next.config.ts` to add rehype-pretty-code. This requires switching from string-based plugin references to actual imports since rehype-pretty-code needs configuration:

```typescript
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkFrontmatter],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [
        rehypePrettyCode,
        {
          theme: "github-dark",
          keepBackground: true,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
```

**Step 2: Verify syntax highlighting works**

Navigate to: http://localhost:3000/blog/hello-world
Expected: Code block has syntax highlighting with different colors for keywords, strings, etc.

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add syntax highlighting with rehype-pretty-code and Shiki"
```

---

## Task 4: Style Code Blocks with Background Color

**Files:**
- Modify: `app/globals.css`

**Step 1: Add code block background styles**

Add styles for code blocks rendered by rehype-pretty-code. These blocks use `data-rehype-pretty-code-figure` attribute:

```css
/* Add after the existing @layer base section */

/* Code block styling for rehype-pretty-code */
[data-rehype-pretty-code-figure] {
  @apply my-6 overflow-hidden rounded-lg;
}

[data-rehype-pretty-code-figure] pre {
  @apply overflow-x-auto py-4 px-4;
}

[data-rehype-pretty-code-figure] code {
  @apply text-sm leading-relaxed;
}

/* Inline code styling */
.prose :where(code):not(:where([class~="not-prose"] *)):not(pre code) {
  @apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono;
}

.prose :where(code):not(:where([class~="not-prose"] *)):not(pre code)::before,
.prose :where(code):not(:where([class~="not-prose"] *)):not(pre code)::after {
  content: none;
}
```

**Step 2: Verify code block has visible background**

Navigate to: http://localhost:3000/blog/hello-world
Expected: Code block has a distinct dark background that separates it from the site background

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add code block background and inline code styling"
```

---

## Task 5: Update CodeBlock Component for rehype-pretty-code Compatibility

**Files:**
- Modify: `components/mdx/code-block.tsx`
- Modify: `mdx-components.tsx`

rehype-pretty-code handles the `<pre>` element wrapping, so we need to update our CodeBlock to work with it or remove our custom pre wrapper since rehype-pretty-code provides its own styling.

**Step 1: Update mdx-components.tsx to not wrap pre tags**

Since rehype-pretty-code adds its own wrapper with `data-rehype-pretty-code-figure`, we should let it handle the styling. Update mdx-components.tsx:

```typescript
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/callout";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
  };
}
```

**Step 2: Verify code blocks still work**

Navigate to: http://localhost:3000/blog/hello-world
Expected: Code blocks render with syntax highlighting and proper styling

**Step 3: Commit**

```bash
git add mdx-components.tsx
git commit -m "refactor: remove custom pre wrapper, use rehype-pretty-code styling"
```

---

## Task 6: Add Padding Between Content and Dividers

**Files:**
- Modify: `app/blog/[slug]/page.tsx`

**Step 1: Add vertical padding to the prose content area**

The dividers (horizontal rules created by the header border and other elements) need spacing from the content. Update the prose div wrapper:

```tsx
<div className="prose prose-neutral dark:prose-invert max-w-none py-8 border-t border-b">
  <Content />
</div>
```

**Step 2: Verify padding appears**

Navigate to: http://localhost:3000/blog/hello-world
Expected: Clear padding/spacing between the blog post content and the dividers at top and bottom

**Step 3: Commit**

```bash
git add app/blog/[slug]/page.tsx
git commit -m "style: add padding between blog content and dividers"
```

---

## Task 7: Expand Sample Blog Post Content

**Files:**
- Modify: `content/blog/hello-world.mdx`

**Step 1: Add more sample content demonstrating various MDX features**

Update hello-world.mdx with richer content that showcases different components and formatting:

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

This blog is built with a modern tech stack that prioritizes developer experience and performance:

```typescript
const techStack = {
  framework: "Next.js 15",
  content: "MDX",
  styling: "Tailwind CSS",
  hosting: "Vercel",
  features: [
    "Server Components",
    "App Router",
    "Static Generation",
    "Dark Mode",
  ],
};
```

### Why Next.js?

Next.js provides an excellent foundation for content-focused websites. With the App Router and React Server Components, we get:

1. **Fast initial page loads** - Server-rendered HTML
2. **Seamless navigation** - Client-side routing after hydration
3. **Excellent SEO** - Static generation with dynamic metadata
4. **Developer experience** - Hot reloading, TypeScript support, and more

<Callout type="info">
All code examples in this blog are syntax highlighted using Shiki with the GitHub Dark theme.
</Callout>

## Code Examples

Here's a quick example of a React component:

```tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md ${
        variant === "primary"
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}
```

And here's some Python for variety:

```python
def fibonacci(n: int) -> list[int]:
    """Generate the first n Fibonacci numbers."""
    if n <= 0:
        return []
    if n == 1:
        return [0]

    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])

    return sequence

# Example usage
print(fibonacci(10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

## What's Next?

Stay tuned for more content! I have several posts planned covering:

- Building a modern blog with Next.js and MDX
- iOS development with SwiftUI
- AI and machine learning integrations
- Developer productivity tips

Feel free to explore the blog and check out the [Tags](/tags) page to find content by topic.
```

**Step 2: Verify the expanded content renders correctly**

Navigate to: http://localhost:3000/blog/hello-world
Expected:
- Multiple code blocks with different languages (TypeScript, Python)
- Multiple callouts (tip, info)
- Numbered and bulleted lists
- Proper heading hierarchy
- All syntax highlighting working

**Step 3: Commit**

```bash
git add content/blog/hello-world.mdx
git commit -m "content: expand sample blog post with more examples and components"
```

---

## Task 8: Add Copy Button to Code Blocks

**Files:**
- Modify: `app/globals.css`

rehype-pretty-code doesn't include a copy button by default. We can add one using CSS and a small script, or we can add a custom component. For simplicity, let's add a CSS-based approach that shows a copy button on hover.

**Step 1: Add copy button styles**

This requires a bit more work. Instead, let's keep the CodeBlock component but modify it to work alongside rehype-pretty-code. Actually, the cleanest approach is to use a client-side script.

For now, let's ensure the code blocks are well-styled and skip the copy button (Task 5 already removed the custom wrapper). The copy functionality can be added later if needed.

**Step 1: Verify code blocks look good without copy button**

Navigate to: http://localhost:3000/blog/hello-world
Expected: Code blocks are readable with good contrast and syntax highlighting

**Step 2: Mark task as complete (no changes needed)**

The styling from Task 4 should be sufficient for now.

---

## Task 9: Final Verification and Build Test

**Files:** None (verification only)

**Step 1: Run the build to check for errors**

Run: `npm run build`
Expected: Build completes successfully with no errors

**Step 2: Run the linter**

Run: `npm run lint`
Expected: No linting errors

**Step 3: Visual verification in dev mode**

Navigate to: http://localhost:3000/blog/hello-world

Verify:
- [ ] No raw frontmatter text visible at top of post
- [ ] Code blocks have syntax highlighting
- [ ] Code blocks have distinct background color
- [ ] Different languages (TypeScript, Python) have appropriate highlighting
- [ ] Padding exists between content and dividers
- [ ] Callout components render correctly
- [ ] Page looks good in both light and dark mode

**Step 4: Final commit (if any adjustments needed)**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```

---

## Summary of Changes

| Issue | Solution |
|-------|----------|
| Random broken text (frontmatter leak) | Add `remark-frontmatter` plugin |
| No syntax highlighting | Add `rehype-pretty-code` with Shiki |
| Code block blends with background | Add CSS styling for `[data-rehype-pretty-code-figure]` |
| No padding around dividers | Add `py-8 border-t border-b` to prose container |
| Sparse sample content | Expand hello-world.mdx with multiple code examples |

## Dependencies Added

- `remark-frontmatter` - Strips YAML frontmatter from MDX rendering
- `rehype-pretty-code` - Syntax highlighting using Shiki
