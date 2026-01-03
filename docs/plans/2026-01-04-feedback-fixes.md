# Blog Feedback Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix left padding issue, update branding text, and resolve the infinite loop error in TableOfContents

**Architecture:** Simple text replacements for branding, CSS fix for container padding, and refactor `getHeadingsSnapshot` to cache its result to avoid recreating arrays on every call.

**Tech Stack:** Next.js 15, Tailwind CSS 4, React 19 (useSyncExternalStore)

---

## Task 1: Fix Container Padding

The `container` class in Tailwind CSS 4 doesn't add horizontal padding by default. We need to add `px-4 md:px-6 lg:px-8` to the container wrapper or configure a custom container in globals.css.

**Files:**
- Modify: `app/globals.css:118-125`

**Step 1: Add container padding to globals.css**

Open `app/globals.css` and add custom container styles inside the `@layer base` block:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  .container {
    @apply mx-auto px-4 md:px-6 lg:px-8;
  }
}
```

**Step 2: Verify the change**

Run: `curl -s http://localhost:3000 | grep -o 'container[^"]*' | head -3`

Expected: The page should load with visible left/right padding on all container elements.

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "fix: add horizontal padding to container class"
```

---

## Task 2: Update Header Branding

Change "Dev Blog" in the header to "Bradley Windybank".

**Files:**
- Modify: `components/layout/header-client.tsx:18`

**Step 1: Update the header text**

In `components/layout/header-client.tsx`, find line 18:

```tsx
<span className="font-bold">Dev Blog</span>
```

Change to:

```tsx
<span className="font-bold">Bradley Windybank</span>
```

**Step 2: Verify the change**

Run: `grep "Bradley Windybank" components/layout/header-client.tsx`

Expected: Shows the line with "Bradley Windybank"

**Step 3: Commit**

```bash
git add components/layout/header-client.tsx
git commit -m "chore: update header branding to Bradley Windybank"
```

---

## Task 3: Update Footer Copyright

Change "Dev Blog" in the footer copyright to "Bradley Windybank".

**Files:**
- Modify: `components/layout/footer.tsx:10`

**Step 1: Update the copyright text**

In `components/layout/footer.tsx`, find line 10:

```tsx
© {new Date().getFullYear()} Dev Blog. All rights reserved.
```

Change to:

```tsx
© {new Date().getFullYear()} Bradley Windybank. All rights reserved.
```

**Step 2: Verify the change**

Run: `grep "Bradley Windybank" components/layout/footer.tsx`

Expected: Shows the line with "Bradley Windybank"

**Step 3: Commit**

```bash
git add components/layout/footer.tsx
git commit -m "chore: update footer copyright to Bradley Windybank"
```

---

## Task 4: Update Homepage Title

Change "Welcome to Dev Blog" to "Welcome".

**Files:**
- Modify: `app/page.tsx:15`

**Step 1: Update the title**

In `app/page.tsx`, find line 14-15:

```tsx
<h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
  Welcome to Dev Blog
</h1>
```

Change to:

```tsx
<h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
  Welcome
</h1>
```

**Step 2: Verify the change**

Run: `grep -A1 "font-heading" app/page.tsx | head -2`

Expected: Shows "Welcome" without "to Dev Blog"

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "chore: update homepage title to Welcome"
```

---

## Task 5: Update Homepage Description

Change the description to the new personalized text.

**Files:**
- Modify: `app/page.tsx:17-19`

**Step 1: Update the description**

In `app/page.tsx`, find lines 17-19:

```tsx
<p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
  A developer blog about software engineering, tutorials, and
  thoughts on building great software.
</p>
```

Change to:

```tsx
<p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
  A blog about software development, AI, iOS, and thoughts on building sometimes great software. By Bradley Windybank.
</p>
```

**Step 2: Verify the change**

Run: `grep "By Bradley Windybank" app/page.tsx`

Expected: Shows the new description line

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "chore: update homepage description with personalized text"
```

---

## Task 6: Fix TableOfContents Infinite Loop

The error "The result of getSnapshot should be cached to avoid an infinite loop" occurs because `getHeadingsSnapshot` returns a new array on every call. `useSyncExternalStore` compares by reference, so it thinks state changed and re-renders infinitely.

The fix: Cache the headings result and only update when DOM actually changes.

**Files:**
- Modify: `components/blog/table-of-contents.tsx`

**Step 1: Replace the entire table-of-contents.tsx file**

Replace the contents of `components/blog/table-of-contents.tsx` with:

```tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const hasInitialized = useRef(false);

  // Extract headings once on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const elements = document.querySelectorAll("article h2, article h3");
    const items = Array.from(elements).map((element) => ({
      id: element.id,
      text: element.textContent || "",
      level: element.tagName === "H2" ? 2 : 3,
    }));
    setHeadings(items);
  }, []);

  // Track active heading via intersection observer
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
```

**Step 2: Verify the fix compiles**

Run: `npm run build 2>&1 | head -30`

Expected: No errors related to table-of-contents.tsx

**Step 3: Verify manually**

Open http://localhost:3000/blog/hello-world in browser and check:
- No console error about "getSnapshot should be cached"
- Table of contents renders correctly
- Active heading highlighting works when scrolling

**Step 4: Commit**

```bash
git add components/blog/table-of-contents.tsx
git commit -m "fix: resolve infinite loop in TableOfContents by removing useSyncExternalStore"
```

---

## Task 7: Update Site Metadata

Update the default site title from "Dev Blog" to "Bradley Windybank" in layout.tsx.

**Files:**
- Modify: `app/layout.tsx:21-25`

**Step 1: Update metadata**

In `app/layout.tsx`, find lines 20-26:

```tsx
export const metadata: Metadata = {
  title: {
    default: "Dev Blog",
    template: "%s | Dev Blog",
  },
  description: "A developer blog about software engineering",
};
```

Change to:

```tsx
export const metadata: Metadata = {
  title: {
    default: "Bradley Windybank",
    template: "%s | Bradley Windybank",
  },
  description: "A blog about software development, AI, iOS, and thoughts on building sometimes great software.",
};
```

**Step 2: Verify the change**

Run: `grep -A5 "export const metadata" app/layout.tsx`

Expected: Shows "Bradley Windybank" as default and template

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "chore: update site metadata to Bradley Windybank branding"
```

---

## Task 8: Run Full Build and Test

**Step 1: Run lint**

Run: `npm run lint`

Expected: No errors

**Step 2: Run build**

Run: `npm run build`

Expected: Build succeeds without errors

**Step 3: Commit any fixes if needed**

If lint or build found issues, fix them and commit.

---

## Task 9: Push Changes

**Step 1: Push to GitHub**

Run: `git push origin main`

Expected: Push succeeds

**Step 2: Deploy to Vercel**

Run: `vercel --prod --yes`

Expected: Deployment succeeds

---

## Summary of Changes

| File | Change |
|------|--------|
| `app/globals.css` | Add container padding styles |
| `components/layout/header-client.tsx` | "Dev Blog" → "Bradley Windybank" |
| `components/layout/footer.tsx` | Copyright "Dev Blog" → "Bradley Windybank" |
| `app/page.tsx` | Title + description updated |
| `components/blog/table-of-contents.tsx` | Remove useSyncExternalStore, use simple useState |
| `app/layout.tsx` | Site metadata title + description |
