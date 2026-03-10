# Testing Infrastructure Research

**Date:** 2026-01-18
**Design Document:** `docs/designs/2026-01-17-testing-infrastructure-design.md`
**Status:** Research Complete

---

## Executive Summary

Research validates the design document's approach. Key adjustments recommended:

1. **Use jsdom over happy-dom** - Better browser API coverage for clipboard mocking in ShareButtons
2. **Add vite-tsconfig-paths** - Required for path alias resolution (`@/`)
3. **Mock strategy clarified** - Use `vi.hoisted()` for next/navigation mocks
4. **React 19 consideration** - Need afterEach cleanup in setup file

---

## Codebase Analysis

### lib/ Modules - Testable Surface

| Module | Functions | Sync/Async | FS I/O | External API | Priority |
|--------|-----------|-----------|--------|--------------|----------|
| posts.ts | 5 | Sync | Heavy | No | High |
| search.ts | 2 | Sync | None | fuse.js | Medium |
| manifest.ts | 5 | Sync | Heavy | No | High |
| bluesky.ts | 1 | Async | None | Bluesky API | Medium |
| shiki.ts | 2 | Async | None | shiki | Low |
| utils.ts | 1 | Sync | None | None | Low |

### lib/posts.ts

**Functions:**
- `getPostBySlug(slug: string)` → `Post | null`
- `getAllPosts()` → `PostMeta[]`
- `getPostsByTag(tag: string)` → `PostMeta[]`
- `getAllTags()` → `{ tag: string; count: number }[]`
- `getRelatedPosts(currentSlug: string, limit?: number)` → `PostMeta[]`

**Dependencies to mock:**
- `fs` module: `existsSync()`, `readdirSync()`, `readFileSync()`
- `process.env.NODE_ENV` - controls draft filtering

**Test coverage needs:**
- File not found handling
- Frontmatter parsing
- Draft filtering (dev vs prod)
- Date sorting
- Tag case-insensitivity

### lib/search.ts

**Functions:**
- `createSearchIndex(posts: PostMeta[])` → `Fuse<PostMeta>`
- `searchPosts(index: Fuse<PostMeta>, query: string)` → `PostMeta[]`

**Fuse.js config:** Weighted search on title (2x), description (1.5x), tags (1x), threshold 0.3

**Test coverage needs:**
- Index creation with empty/populated arrays
- Empty query returns empty array
- Fuzzy matching works
- Weighted field matching (title > description > tags)

### lib/manifest.ts

**Functions:**
- `getManifest()` → `Manifest`
- `saveManifest(manifest: Manifest)` → `void`
- `isPostAlreadyPosted(slug: string)` → `boolean`
- `markPostAsPosted(slug: string)` → `void`
- `getNewPosts(allSlugs: string[])` → `string[]`

**Side effects:** saveManifest mutates manifest object AND writes to disk with timestamp

**Test coverage needs:**
- File not found returns default
- JSON parsing
- Duplicate prevention
- Timestamp auto-update

### lib/bluesky.ts

**Functions:**
- `postToBluesky(params)` → `Promise<{ success: boolean; uri?: string; error?: string }>`

**Dependencies to mock:**
- `@atproto/api`: `BskyAgent`, `RichText`
- Environment variables: `BLUESKY_HANDLE`, `BLUESKY_APP_PASSWORD`

**Test coverage needs:**
- Missing credentials error
- Successful post returns URI
- Failed login/post error handling
- Hashtag formatting

---

## Component Analysis

### PostCard (`components/blog/post-card.tsx`)

**Type:** Server Component (no `'use client'`)

**Props:**
```typescript
interface PostCardProps {
  post: PostMeta;
}
```

**Dependencies:** `next/link`, `@/components/ui/card`, `@/components/ui/badge`

**Test cases:**
- Title links to `/blog/{slug}`
- Tags link to `/tags/{tag}` (lowercased)
- Date formatting
- Description and reading time display

### Callout (`components/mdx/callout.tsx`)

**Type:** Server Component

**Props:**
```typescript
interface CalloutProps {
  type?: "info" | "warning" | "tip" | "danger";
  children: React.ReactNode;
}
```

**Dependencies:** `lucide-react` icons, `cn()` utility

**Test cases:**
- Each type renders correct icon (Info, AlertTriangle, Lightbulb, AlertCircle)
- Each type applies correct styling
- Default type is "info"

### ShareButtons (`components/blog/share-buttons.tsx`)

**Type:** Client Component (`'use client'`)

**Props:**
```typescript
interface ShareButtonsProps {
  title: string;
  slug: string;
}
```

**Dependencies:** `useState`, `navigator.clipboard`, `window.open`, `NEXT_PUBLIC_SITE_URL`

**Test cases:**
- Copy button clipboard functionality
- Copy state toggle (2 second timeout)
- Bluesky/Twitter URL generation with encoding
- Environment variable fallback

**Mocking required:**
- `navigator.clipboard.writeText`
- `window.open`
- Environment variable

---

## Vitest Configuration (Validated)

### Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/dom @vitejs/plugin-react vite-tsconfig-paths @playwright/test
```

**Note:** Added `vite-tsconfig-paths` for path alias resolution (`@/`).

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom', // jsdom over happy-dom for clipboard API
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

### vitest.setup.ts

```typescript
import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test (React 19 requirement)
afterEach(() => {
  cleanup()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))
```

### TypeScript Configuration

Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

---

## Playwright Configuration (Validated)

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  timeout: 30 * 1000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```

### Keyboard Shortcut Testing (Cmd+K)

```typescript
import { test, expect } from '@playwright/test'

test('search opens with Cmd+K', async ({ page }) => {
  await page.goto('/')

  // ControlOrMeta resolves to Meta on macOS, Control on Windows/Linux
  await page.keyboard.press('ControlOrMeta+k')

  const searchDialog = page.locator('[role="dialog"]')
  await expect(searchDialog).toBeVisible()
})
```

---

## Gotchas & Warnings

### React 19

1. **afterEach cleanup required** - React 19 removed automatic cleanup
2. **StrictMode double-invocation** - Ref callbacks may fire twice in tests
3. **react-dom/test-utils removed** - Use @testing-library/react instead

### Next.js 16

1. **Async Server Components** - Cannot be tested with Vitest; use E2E tests
2. **next/navigation mocking** - Use vi.mock() in setup file, not inline

### Vitest 3.x

1. **environmentMatchGlobs deprecated** - Use `projects` configuration instead
2. **Reporter redesign** - Some reporter APIs changed from 2.x

### Happy-dom vs jsdom

**Recommendation: Use jsdom**
- ShareButtons component uses `navigator.clipboard` which requires jsdom
- jsdom has better browser API coverage
- Performance difference is negligible for this project size

---

## File Structure (Updated)

```
dev-blog/
├── __tests__/
│   ├── lib/
│   │   ├── posts.test.ts
│   │   ├── search.test.ts
│   │   ├── manifest.test.ts
│   │   └── bluesky.test.ts
│   ├── components/
│   │   ├── post-card.test.tsx
│   │   ├── callout.test.tsx
│   │   └── share-buttons.test.tsx
│   └── fixtures/
│       ├── posts/             # Mock MDX files
│       │   └── test-post.mdx
│       └── manifest.json      # Mock manifest
├── e2e/
│   ├── blog.spec.ts
│   ├── search.spec.ts
│   └── navigation.spec.ts
├── vitest.config.ts
├── vitest.setup.ts
├── playwright.config.ts
└── .github/workflows/test.yml
```

---

## Open Questions Resolved

### 1. Test data strategy

**Decision:** Use dedicated fixtures in `__tests__/fixtures/`

**Rationale:**
- Predictable test data
- No coupling to production content
- Tests remain stable as blog posts change

### 2. jsdom vs happy-dom

**Decision:** Use jsdom

**Rationale:**
- ShareButtons uses `navigator.clipboard`
- jsdom has complete browser API support
- Performance difference negligible for project size

---

## Implementation Readiness

All research questions answered. Ready to proceed to implementation planning.

**Next step:** `/hyperpowers:write-plan docs/designs/2026-01-17-testing-infrastructure-design.md`
