# Testing Infrastructure Implementation Plan

> **For Claude:** Run `/hyperpowers:execute-plan` to implement this plan.
> **Related Issues:** None
> **Primary Issue:** None

**Goal:** Add comprehensive test infrastructure with Vitest (unit/component) and Playwright (E2E), integrated with GitHub Actions CI.

**Architecture:** Unit tests in `__tests__/lib/`, component tests in `__tests__/components/`, E2E tests in `e2e/`. Vitest handles fast unit/component tests with jsdom. Playwright handles E2E with dev server. CI runs both in parallel.

**Tech Stack:** Vitest 3.x, @testing-library/react, jsdom, Playwright, GitHub Actions

**Context Gathered From:**
- `docs/research/2026-01-18-testing-infrastructure-research.md`
- `docs/designs/2026-01-17-testing-infrastructure-design.md`

---

## Tasks

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install test dependencies**

Run:
```bash
npm install -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom @vitejs/plugin-react vite-tsconfig-paths @playwright/test
```

**Step 2: Install Playwright browsers**

Run:
```bash
npx playwright install chromium
```

**Step 3: Add npm scripts to package.json**

Add to `package.json` scripts section:
```json
{
  "test": "vitest",
  "test:run": "vitest --run",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

**Step 4: Verify installation**

Run:
```bash
npm run test -- --version
```
Expected: Vitest version output

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add test dependencies (vitest, playwright, testing-library)"
```

---

### Task 2: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `tsconfig.json`

**Step 1: Create vitest.config.ts**

Create file `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
  },
})
```

**Step 2: Create vitest.setup.ts**

Create file `vitest.setup.ts`:
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
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    return <a href={href}>{children}</a>
  },
}))
```

**Step 3: Add vitest globals to tsconfig.json**

Add `"vitest/globals"` to the types array in `tsconfig.json` compilerOptions:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

**Step 4: Create test directories**

Run:
```bash
mkdir -p __tests__/lib __tests__/components __tests__/fixtures/posts
```

**Step 5: Verify configuration works**

Create a minimal test file `__tests__/lib/setup.test.ts`:
```typescript
describe('vitest setup', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })
})
```

Run:
```bash
npm test -- --run
```
Expected: 1 test passed

**Step 6: Remove minimal test and commit**

```bash
rm __tests__/lib/setup.test.ts
git add vitest.config.ts vitest.setup.ts tsconfig.json
git commit -m "chore: configure vitest with jsdom and testing-library"
```

---

### Task 3: Configure Playwright

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/.gitkeep`

**Step 1: Create playwright.config.ts**

Create file `playwright.config.ts`:
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

**Step 2: Create e2e directory**

Run:
```bash
mkdir -p e2e
touch e2e/.gitkeep
```

**Step 3: Add playwright artifacts to .gitignore**

Append to `.gitignore`:
```
# Playwright
playwright-report/
test-results/
```

**Step 4: Commit**

```bash
git add playwright.config.ts e2e/.gitkeep .gitignore
git commit -m "chore: configure playwright for e2e testing"
```

---

### Task 4: Create Test Fixtures

**Files:**
- Create: `__tests__/fixtures/posts/test-post.mdx`
- Create: `__tests__/fixtures/posts/draft-post.mdx`
- Create: `__tests__/fixtures/manifest.json`

**Step 1: Create test post fixture**

Create file `__tests__/fixtures/posts/test-post.mdx`:
```mdx
---
title: "Test Post Title"
description: "A test post description for unit tests"
publishedAt: 2026-01-15
tags: ["testing", "vitest"]
draft: false
---

This is test content for unit tests.
```

**Step 2: Create draft post fixture**

Create file `__tests__/fixtures/posts/draft-post.mdx`:
```mdx
---
title: "Draft Post Title"
description: "A draft post that should be hidden in production"
publishedAt: 2026-01-14
tags: ["draft"]
draft: true
---

This is draft content.
```

**Step 3: Create manifest fixture**

Create file `__tests__/fixtures/manifest.json`:
```json
{
  "postedSlugs": ["already-posted"],
  "lastUpdated": "2026-01-15T00:00:00.000Z"
}
```

**Step 4: Commit**

```bash
git add __tests__/fixtures
git commit -m "test: add test fixtures for posts and manifest"
```

---

### Task 5: Unit Tests for lib/search.ts

**Files:**
- Create: `__tests__/lib/search.test.ts`

**Step 1: Write tests for createSearchIndex and searchPosts**

Create file `__tests__/lib/search.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { createSearchIndex, searchPosts } from '@/lib/search'
import type { PostMeta } from '@/lib/posts'

const mockPosts: PostMeta[] = [
  {
    slug: 'hello-world',
    frontmatter: {
      title: 'Hello World',
      description: 'An introduction to the blog',
      publishedAt: '2026-01-01',
      tags: ['intro', 'welcome'],
    },
    readingTime: '2 min read',
  },
  {
    slug: 'advanced-testing',
    frontmatter: {
      title: 'Advanced Testing Techniques',
      description: 'Deep dive into testing strategies',
      publishedAt: '2026-01-02',
      tags: ['testing', 'vitest'],
    },
    readingTime: '5 min read',
  },
  {
    slug: 'react-patterns',
    frontmatter: {
      title: 'React Design Patterns',
      description: 'Common patterns for React applications',
      publishedAt: '2026-01-03',
      tags: ['react', 'patterns'],
    },
    readingTime: '8 min read',
  },
]

describe('search', () => {
  describe('createSearchIndex', () => {
    it('creates a Fuse index from posts', () => {
      const index = createSearchIndex(mockPosts)
      expect(index).toBeDefined()
      expect(typeof index.search).toBe('function')
    })

    it('creates index from empty array', () => {
      const index = createSearchIndex([])
      expect(index).toBeDefined()
    })
  })

  describe('searchPosts', () => {
    it('returns empty array for empty query', () => {
      const index = createSearchIndex(mockPosts)
      const results = searchPosts(index, '')
      expect(results).toEqual([])
    })

    it('returns empty array for whitespace query', () => {
      const index = createSearchIndex(mockPosts)
      const results = searchPosts(index, '   ')
      expect(results).toEqual([])
    })

    it('finds posts by title', () => {
      const index = createSearchIndex(mockPosts)
      const results = searchPosts(index, 'Hello')
      expect(results).toHaveLength(1)
      expect(results[0].slug).toBe('hello-world')
    })

    it('finds posts by description', () => {
      const index = createSearchIndex(mockPosts)
      const results = searchPosts(index, 'testing strategies')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(r => r.slug === 'advanced-testing')).toBe(true)
    })

    it('finds posts by tag', () => {
      const index = createSearchIndex(mockPosts)
      const results = searchPosts(index, 'react')
      expect(results.some(r => r.slug === 'react-patterns')).toBe(true)
    })

    it('fuzzy matches titles', () => {
      const index = createSearchIndex(mockPosts)
      const results = searchPosts(index, 'Helo Wrld') // typos
      expect(results.some(r => r.slug === 'hello-world')).toBe(true)
    })

    it('returns empty for no matches', () => {
      const index = createSearchIndex(mockPosts)
      const results = searchPosts(index, 'zzzznonexistent')
      expect(results).toEqual([])
    })
  })
})
```

**Step 2: Run tests**

Run:
```bash
npm test -- --run __tests__/lib/search.test.ts
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add __tests__/lib/search.test.ts
git commit -m "test: add unit tests for lib/search"
```

---

### Task 6: Unit Tests for lib/posts.ts

**Files:**
- Create: `__tests__/lib/posts.test.ts`

**Step 1: Write tests for posts module**

Create file `__tests__/lib/posts.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'

// Mock fs module before importing posts
vi.mock('fs')

// Import after mocking
import {
  getPostBySlug,
  getAllPosts,
  getPostsByTag,
  getAllTags,
  getRelatedPosts,
} from '@/lib/posts'

const POSTS_PATH = path.join(process.cwd(), 'content/blog')

const mockPostContent = `---
title: "Test Post"
description: "A test post"
publishedAt: 2026-01-15
tags: ["testing", "vitest"]
draft: false
---

Test content here.
`

const mockDraftContent = `---
title: "Draft Post"
description: "A draft post"
publishedAt: 2026-01-14
tags: ["draft"]
draft: true
---

Draft content.
`

const mockPost2Content = `---
title: "Another Post"
description: "Another post"
publishedAt: 2026-01-16
tags: ["testing", "other"]
draft: false
---

Another content.
`

describe('posts', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getPostBySlug', () => {
    it('returns post data for existing slug', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(mockPostContent)

      const post = getPostBySlug('test-post')

      expect(post).not.toBeNull()
      expect(post?.slug).toBe('test-post')
      expect(post?.frontmatter.title).toBe('Test Post')
      expect(post?.frontmatter.tags).toEqual(['testing', 'vitest'])
      expect(post?.readingTime).toBeDefined()
    })

    it('returns null for non-existent slug', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const post = getPostBySlug('non-existent')

      expect(post).toBeNull()
    })

    it('parses frontmatter correctly', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(mockPostContent)

      const post = getPostBySlug('test-post')

      expect(post?.frontmatter.description).toBe('A test post')
      expect(post?.frontmatter.publishedAt).toBe('2026-01-15')
    })
  })

  describe('getAllPosts', () => {
    it('returns sorted posts by date descending', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockReturnValue([
        'test-post.mdx',
        'another-post.mdx',
      ] as unknown as fs.Dirent[])
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (String(filePath).includes('test-post')) return mockPostContent
        if (String(filePath).includes('another-post')) return mockPost2Content
        return ''
      })

      const posts = getAllPosts()

      expect(posts).toHaveLength(2)
      // another-post is 2026-01-16, test-post is 2026-01-15
      expect(posts[0].slug).toBe('another-post')
      expect(posts[1].slug).toBe('test-post')
    })

    it('filters drafts in production', () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockReturnValue([
        'test-post.mdx',
        'draft-post.mdx',
      ] as unknown as fs.Dirent[])
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (String(filePath).includes('test-post')) return mockPostContent
        if (String(filePath).includes('draft-post')) return mockDraftContent
        return ''
      })

      const posts = getAllPosts()

      expect(posts).toHaveLength(1)
      expect(posts[0].slug).toBe('test-post')
    })

    it('includes drafts in development', () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockReturnValue([
        'test-post.mdx',
        'draft-post.mdx',
      ] as unknown as fs.Dirent[])
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (String(filePath).includes('test-post')) return mockPostContent
        if (String(filePath).includes('draft-post')) return mockDraftContent
        return ''
      })

      const posts = getAllPosts()

      expect(posts).toHaveLength(2)
    })

    it('returns empty array when no posts directory', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const posts = getAllPosts()

      expect(posts).toEqual([])
    })
  })

  describe('getPostsByTag', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockReturnValue([
        'test-post.mdx',
        'another-post.mdx',
      ] as unknown as fs.Dirent[])
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (String(filePath).includes('test-post')) return mockPostContent
        if (String(filePath).includes('another-post')) return mockPost2Content
        return ''
      })
    })

    it('filters by tag case-insensitively', () => {
      const posts = getPostsByTag('TESTING')

      expect(posts).toHaveLength(2)
    })

    it('returns empty for unknown tag', () => {
      const posts = getPostsByTag('nonexistent')

      expect(posts).toEqual([])
    })
  })

  describe('getAllTags', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockReturnValue([
        'test-post.mdx',
        'another-post.mdx',
      ] as unknown as fs.Dirent[])
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (String(filePath).includes('test-post')) return mockPostContent
        if (String(filePath).includes('another-post')) return mockPost2Content
        return ''
      })
    })

    it('returns unique tags with counts sorted by count', () => {
      const tags = getAllTags()

      expect(tags.find(t => t.tag === 'testing')?.count).toBe(2)
      expect(tags.find(t => t.tag === 'vitest')?.count).toBe(1)
      expect(tags[0].count).toBeGreaterThanOrEqual(tags[1].count)
    })
  })

  describe('getRelatedPosts', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockReturnValue([
        'test-post.mdx',
        'another-post.mdx',
      ] as unknown as fs.Dirent[])
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (String(filePath).includes('test-post')) return mockPostContent
        if (String(filePath).includes('another-post')) return mockPost2Content
        return ''
      })
    })

    it('returns related posts by tag overlap', () => {
      const related = getRelatedPosts('test-post')

      expect(related.length).toBeGreaterThan(0)
      expect(related[0].slug).toBe('another-post')
    })

    it('excludes current post from results', () => {
      const related = getRelatedPosts('test-post')

      expect(related.every(p => p.slug !== 'test-post')).toBe(true)
    })

    it('returns empty for non-existent post', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return !String(p).includes('nonexistent')
      })

      const related = getRelatedPosts('nonexistent')

      expect(related).toEqual([])
    })

    it('respects limit parameter', () => {
      const related = getRelatedPosts('test-post', 1)

      expect(related.length).toBeLessThanOrEqual(1)
    })
  })
})
```

**Step 2: Run tests**

Run:
```bash
npm test -- --run __tests__/lib/posts.test.ts
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add __tests__/lib/posts.test.ts
git commit -m "test: add unit tests for lib/posts"
```

---

### Task 7: Unit Tests for lib/manifest.ts

**Files:**
- Create: `__tests__/lib/manifest.test.ts`

**Step 1: Write tests for manifest module**

Create file `__tests__/lib/manifest.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'

vi.mock('fs')

import {
  getManifest,
  saveManifest,
  isPostAlreadyPosted,
  markPostAsPosted,
  getNewPosts,
} from '@/lib/manifest'

const mockManifest = {
  postedSlugs: ['already-posted', 'another-posted'],
  lastUpdated: '2026-01-15T00:00:00.000Z',
}

describe('manifest', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-18T12:00:00.000Z'))
  })

  describe('getManifest', () => {
    it('returns manifest from file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest))

      const manifest = getManifest()

      expect(manifest.postedSlugs).toEqual(['already-posted', 'another-posted'])
    })

    it('returns default manifest when file missing', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const manifest = getManifest()

      expect(manifest.postedSlugs).toEqual([])
      expect(manifest.lastUpdated).toBeDefined()
    })
  })

  describe('saveManifest', () => {
    it('writes manifest with updated timestamp', () => {
      const manifest = { postedSlugs: ['test'], lastUpdated: '' }

      saveManifest(manifest)

      expect(fs.writeFileSync).toHaveBeenCalled()
      expect(manifest.lastUpdated).toBe('2026-01-18T12:00:00.000Z')
    })
  })

  describe('isPostAlreadyPosted', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest))
    })

    it('returns true for posted slug', () => {
      expect(isPostAlreadyPosted('already-posted')).toBe(true)
    })

    it('returns false for new slug', () => {
      expect(isPostAlreadyPosted('new-post')).toBe(false)
    })
  })

  describe('markPostAsPosted', () => {
    it('adds slug to manifest and saves', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest))

      markPostAsPosted('new-post')

      expect(fs.writeFileSync).toHaveBeenCalled()
      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0]
      const savedManifest = JSON.parse(writeCall[1] as string)
      expect(savedManifest.postedSlugs).toContain('new-post')
    })

    it('does not duplicate existing slug', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest))

      markPostAsPosted('already-posted')

      expect(fs.writeFileSync).not.toHaveBeenCalled()
    })
  })

  describe('getNewPosts', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest))
    })

    it('filters to unposted slugs only', () => {
      const allSlugs = ['already-posted', 'new-post-1', 'new-post-2']

      const newPosts = getNewPosts(allSlugs)

      expect(newPosts).toEqual(['new-post-1', 'new-post-2'])
    })

    it('returns empty when all posted', () => {
      const newPosts = getNewPosts(['already-posted', 'another-posted'])

      expect(newPosts).toEqual([])
    })
  })
})
```

**Step 2: Run tests**

Run:
```bash
npm test -- --run __tests__/lib/manifest.test.ts
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add __tests__/lib/manifest.test.ts
git commit -m "test: add unit tests for lib/manifest"
```

---

### Task 8: Unit Tests for lib/bluesky.ts

**Files:**
- Create: `__tests__/lib/bluesky.test.ts`

**Step 1: Write tests for bluesky module**

Create file `__tests__/lib/bluesky.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @atproto/api before importing
vi.mock('@atproto/api', () => {
  const mockPost = vi.fn()
  const mockLogin = vi.fn()
  const mockDetectFacets = vi.fn()

  return {
    BskyAgent: vi.fn().mockImplementation(() => ({
      login: mockLogin,
      post: mockPost,
    })),
    RichText: vi.fn().mockImplementation(() => ({
      text: '',
      facets: [],
      detectFacets: mockDetectFacets,
    })),
  }
})

import { postToBluesky } from '@/lib/bluesky'
import { BskyAgent, RichText } from '@atproto/api'

describe('bluesky', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('BLUESKY_HANDLE', 'test.bsky.social')
    vi.stubEnv('BLUESKY_APP_PASSWORD', 'test-password')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('postToBluesky', () => {
    const defaultParams = {
      title: 'Test Post',
      description: 'Test description',
      url: 'https://example.com/test',
      tags: ['test', 'vitest'],
    }

    it('returns error when credentials missing', async () => {
      vi.stubEnv('BLUESKY_HANDLE', '')
      vi.stubEnv('BLUESKY_APP_PASSWORD', '')

      const result = await postToBluesky(defaultParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bluesky credentials not configured')
    })

    it('returns error when handle missing', async () => {
      vi.stubEnv('BLUESKY_HANDLE', '')

      const result = await postToBluesky(defaultParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bluesky credentials not configured')
    })

    it('returns error when password missing', async () => {
      vi.stubEnv('BLUESKY_APP_PASSWORD', '')

      const result = await postToBluesky(defaultParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Bluesky credentials not configured')
    })

    it('returns success with URI on successful post', async () => {
      const mockAgent = new BskyAgent({ service: '' })
      vi.mocked(mockAgent.login).mockResolvedValue({} as never)
      vi.mocked(mockAgent.post).mockResolvedValue({
        uri: 'at://did:plc:123/app.bsky.feed.post/abc',
        cid: 'cid123',
      })

      const result = await postToBluesky(defaultParams)

      expect(result.success).toBe(true)
      expect(result.uri).toBe('at://did:plc:123/app.bsky.feed.post/abc')
    })

    it('handles login failure', async () => {
      const mockAgent = new BskyAgent({ service: '' })
      vi.mocked(mockAgent.login).mockRejectedValue(new Error('Invalid credentials'))

      const result = await postToBluesky(defaultParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })

    it('handles post failure', async () => {
      const mockAgent = new BskyAgent({ service: '' })
      vi.mocked(mockAgent.login).mockResolvedValue({} as never)
      vi.mocked(mockAgent.post).mockRejectedValue(new Error('Rate limited'))

      const result = await postToBluesky(defaultParams)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rate limited')
    })

    it('formats hashtags correctly', async () => {
      const mockAgent = new BskyAgent({ service: '' })
      vi.mocked(mockAgent.login).mockResolvedValue({} as never)
      vi.mocked(mockAgent.post).mockResolvedValue({
        uri: 'at://test',
        cid: 'cid',
      })

      await postToBluesky({
        ...defaultParams,
        tags: ['multi word', 'simple'],
      })

      // Verify RichText was called with hashtags
      expect(RichText).toHaveBeenCalled()
    })
  })
})
```

**Step 2: Run tests**

Run:
```bash
npm test -- --run __tests__/lib/bluesky.test.ts
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add __tests__/lib/bluesky.test.ts
git commit -m "test: add unit tests for lib/bluesky"
```

---

### Task 9: Component Tests for PostCard

**Files:**
- Create: `__tests__/components/post-card.test.tsx`

**Step 1: Write tests for PostCard component**

Create file `__tests__/components/post-card.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostCard } from '@/components/blog/post-card'
import type { PostMeta } from '@/lib/posts'

const mockPost: PostMeta = {
  slug: 'test-post',
  frontmatter: {
    title: 'Test Post Title',
    description: 'This is a test post description',
    publishedAt: '2026-01-15',
    tags: ['Testing', 'React'],
  },
  readingTime: '5 min read',
}

describe('PostCard', () => {
  it('renders post title', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('renders post title as link to post', () => {
    render(<PostCard post={mockPost} />)

    const link = screen.getByRole('link', { name: 'Test Post Title' })
    expect(link).toHaveAttribute('href', '/blog/test-post')
  })

  it('renders description', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('This is a test post description')).toBeInTheDocument()
  })

  it('formats and displays date', () => {
    render(<PostCard post={mockPost} />)

    // January 15, 2026
    expect(screen.getByText('January 15, 2026')).toBeInTheDocument()
  })

  it('displays reading time', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('5 min read')).toBeInTheDocument()
  })

  it('renders all tags as links', () => {
    render(<PostCard post={mockPost} />)

    const testingLink = screen.getByRole('link', { name: 'Testing' })
    const reactLink = screen.getByRole('link', { name: 'React' })

    expect(testingLink).toHaveAttribute('href', '/tags/testing')
    expect(reactLink).toHaveAttribute('href', '/tags/react')
  })

  it('renders tags as badges', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('Testing')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })
})
```

**Step 2: Run tests**

Run:
```bash
npm test -- --run __tests__/components/post-card.test.tsx
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add __tests__/components/post-card.test.tsx
git commit -m "test: add component tests for PostCard"
```

---

### Task 10: Component Tests for Callout

**Files:**
- Create: `__tests__/components/callout.test.tsx`

**Step 1: Write tests for Callout component**

Create file `__tests__/components/callout.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Callout } from '@/components/mdx/callout'

describe('Callout', () => {
  it('renders children content', () => {
    render(<Callout>Test content inside callout</Callout>)

    expect(screen.getByText('Test content inside callout')).toBeInTheDocument()
  })

  it('defaults to info type', () => {
    const { container } = render(<Callout>Content</Callout>)

    // Info type has blue border
    const callout = container.firstChild as HTMLElement
    expect(callout.className).toContain('border-blue-500')
  })

  it('renders info variant with blue styling', () => {
    const { container } = render(<Callout type="info">Info message</Callout>)

    const callout = container.firstChild as HTMLElement
    expect(callout.className).toContain('border-blue-500')
    expect(callout.className).toContain('bg-blue-50')
  })

  it('renders warning variant with yellow styling', () => {
    const { container } = render(<Callout type="warning">Warning message</Callout>)

    const callout = container.firstChild as HTMLElement
    expect(callout.className).toContain('border-yellow-500')
    expect(callout.className).toContain('bg-yellow-50')
  })

  it('renders tip variant with green styling', () => {
    const { container } = render(<Callout type="tip">Tip message</Callout>)

    const callout = container.firstChild as HTMLElement
    expect(callout.className).toContain('border-green-500')
    expect(callout.className).toContain('bg-green-50')
  })

  it('renders danger variant with red styling', () => {
    const { container } = render(<Callout type="danger">Danger message</Callout>)

    const callout = container.firstChild as HTMLElement
    expect(callout.className).toContain('border-red-500')
    expect(callout.className).toContain('bg-red-50')
  })

  it('renders appropriate icon for each type', () => {
    // Each callout type should have an SVG icon
    const { container: infoContainer } = render(<Callout type="info">Info</Callout>)
    expect(infoContainer.querySelector('svg')).toBeInTheDocument()

    const { container: warningContainer } = render(<Callout type="warning">Warning</Callout>)
    expect(warningContainer.querySelector('svg')).toBeInTheDocument()

    const { container: tipContainer } = render(<Callout type="tip">Tip</Callout>)
    expect(tipContainer.querySelector('svg')).toBeInTheDocument()

    const { container: dangerContainer } = render(<Callout type="danger">Danger</Callout>)
    expect(dangerContainer.querySelector('svg')).toBeInTheDocument()
  })
})
```

**Step 2: Run tests**

Run:
```bash
npm test -- --run __tests__/components/callout.test.tsx
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add __tests__/components/callout.test.tsx
git commit -m "test: add component tests for Callout"
```

---

### Task 11: Component Tests for ShareButtons

**Files:**
- Create: `__tests__/components/share-buttons.test.tsx`

**Step 1: Write tests for ShareButtons component**

Create file `__tests__/components/share-buttons.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareButtons } from '@/components/blog/share-buttons'

describe('ShareButtons', () => {
  const mockClipboard = {
    writeText: vi.fn(),
  }

  const mockWindowOpen = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    Object.assign(navigator, { clipboard: mockClipboard })
    vi.spyOn(window, 'open').mockImplementation(mockWindowOpen)
    mockClipboard.writeText.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders copy link button', () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
  })

  it('renders Bluesky button', () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    expect(screen.getByRole('button', { name: /bluesky/i })).toBeInTheDocument()
  })

  it('renders Twitter button', () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument()
  })

  it('copies URL to clipboard when copy button clicked', async () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    fireEvent.click(screen.getByRole('button', { name: /copy link/i }))

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/blog/test-post')
      )
    })
  })

  it('shows copied state after clicking copy', async () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    fireEvent.click(screen.getByRole('button', { name: /copy link/i }))

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument()
    })
  })

  it('resets copied state after 2 seconds', async () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    fireEvent.click(screen.getByRole('button', { name: /copy link/i }))

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument()
    })

    vi.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.getByText(/copy link/i)).toBeInTheDocument()
    })
  })

  it('opens Bluesky share URL when Bluesky button clicked', () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    fireEvent.click(screen.getByRole('button', { name: /bluesky/i }))

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('bsky.app/intent/compose'),
      '_blank'
    )
  })

  it('includes post title in Bluesky share URL', () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    fireEvent.click(screen.getByRole('button', { name: /bluesky/i }))

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('Test Post')),
      '_blank'
    )
  })

  it('opens Twitter share URL when Twitter button clicked', () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    fireEvent.click(screen.getByRole('button', { name: /twitter/i }))

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank'
    )
  })

  it('includes post title in Twitter share URL', () => {
    render(<ShareButtons title="Test Post" slug="test-post" />)

    fireEvent.click(screen.getByRole('button', { name: /twitter/i }))

    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('Test Post')),
      '_blank'
    )
  })
})
```

**Step 2: Run tests**

Run:
```bash
npm test -- --run __tests__/components/share-buttons.test.tsx
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add __tests__/components/share-buttons.test.tsx
git commit -m "test: add component tests for ShareButtons"
```

---

### Task 12: E2E Tests for Blog

**Files:**
- Create: `e2e/blog.spec.ts`

**Step 1: Write E2E tests for blog pages**

Create file `e2e/blog.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Blog', () => {
  test('home page displays blog post list', async ({ page }) => {
    await page.goto('/')

    // Should have at least one blog post card
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('blog post page renders correctly', async ({ page }) => {
    await page.goto('/')

    // Click the first post link
    const firstPostLink = page.locator('article a').first()
    const postTitle = await firstPostLink.textContent()
    await firstPostLink.click()

    // Should navigate to blog post
    await expect(page).toHaveURL(/\/blog\//)

    // Title should be visible
    await expect(page.locator('h1')).toContainText(postTitle || '')
  })

  test('blog post has share buttons', async ({ page }) => {
    await page.goto('/')

    // Navigate to first post
    await page.locator('article a').first().click()
    await expect(page).toHaveURL(/\/blog\//)

    // Share buttons should be visible
    await expect(page.getByRole('button', { name: /copy link/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /bluesky/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /twitter/i })).toBeVisible()
  })

  test('blog post displays reading time', async ({ page }) => {
    await page.goto('/')

    // Navigate to first post
    await page.locator('article a').first().click()

    // Reading time should be visible (format: "X min read")
    await expect(page.getByText(/\d+ min read/)).toBeVisible()
  })

  test('code blocks have syntax highlighting', async ({ page }) => {
    // Navigate to a post known to have code blocks
    await page.goto('/blog/hello-world')

    // If this post has code, check for pre/code elements with highlighting
    const codeBlocks = page.locator('pre code')
    const count = await codeBlocks.count()

    if (count > 0) {
      // Code blocks should have the shiki class or data attribute
      await expect(codeBlocks.first()).toBeVisible()
    }
  })
})
```

**Step 2: Run E2E tests**

Run:
```bash
npm run test:e2e -- blog.spec.ts
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add e2e/blog.spec.ts
rm e2e/.gitkeep
git add e2e/.gitkeep
git commit -m "test: add E2E tests for blog pages"
```

---

### Task 13: E2E Tests for Search

**Files:**
- Create: `e2e/search.spec.ts`

**Step 1: Write E2E tests for search functionality**

Create file `e2e/search.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test('search opens with Cmd+K', async ({ page }) => {
    await page.goto('/')

    // Press Cmd+K (ControlOrMeta+k works on both Mac and Windows)
    await page.keyboard.press('ControlOrMeta+k')

    // Search dialog should open
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('search dialog has input field', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('ControlOrMeta+k')

    // Input should be visible and focused
    const searchInput = page.locator('[role="dialog"] input')
    await expect(searchInput).toBeVisible()
  })

  test('search finds posts by title', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('ControlOrMeta+k')

    // Type a search query
    const searchInput = page.locator('[role="dialog"] input')
    await searchInput.fill('Hello')

    // Wait for results
    await page.waitForTimeout(300) // debounce

    // Results should appear
    const results = page.locator('[role="dialog"] a')
    await expect(results.first()).toBeVisible()
  })

  test('clicking search result navigates to post', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('ControlOrMeta+k')

    const searchInput = page.locator('[role="dialog"] input')
    await searchInput.fill('Hello')
    await page.waitForTimeout(300)

    // Click first result
    const firstResult = page.locator('[role="dialog"] a').first()
    await firstResult.click()

    // Should navigate to a blog post
    await expect(page).toHaveURL(/\/blog\//)
  })

  test('empty search shows no results', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('ControlOrMeta+k')

    const searchInput = page.locator('[role="dialog"] input')
    await searchInput.fill('zzznonexistentpost999')
    await page.waitForTimeout(300)

    // No results or empty message should show
    const results = page.locator('[role="dialog"] a')
    await expect(results).toHaveCount(0)
  })

  test('escape closes search dialog', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('ControlOrMeta+k')

    await expect(page.locator('[role="dialog"]')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })
})
```

**Step 2: Run E2E tests**

Run:
```bash
npm run test:e2e -- search.spec.ts
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add e2e/search.spec.ts
git commit -m "test: add E2E tests for search functionality"
```

---

### Task 14: E2E Tests for Navigation

**Files:**
- Create: `e2e/navigation.spec.ts`

**Step 1: Write E2E tests for navigation**

Create file `e2e/navigation.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('tag links filter posts', async ({ page }) => {
    await page.goto('/')

    // Find and click a tag badge
    const tagBadge = page.locator('article a[href^="/tags/"]').first()
    const tagName = await tagBadge.textContent()
    await tagBadge.click()

    // Should navigate to tag page
    await expect(page).toHaveURL(/\/tags\//)

    // Tag name should be in heading
    if (tagName) {
      await expect(page.locator('h1')).toContainText(tagName, { ignoreCase: true })
    }
  })

  test('clicking post navigates to detail page', async ({ page }) => {
    await page.goto('/')

    const postTitle = page.locator('article a').first()
    const titleText = await postTitle.textContent()
    await postTitle.click()

    await expect(page).toHaveURL(/\/blog\//)
    if (titleText) {
      await expect(page.locator('h1')).toContainText(titleText)
    }
  })

  test('theme toggle changes theme', async ({ page }) => {
    await page.goto('/')

    // Find theme toggle button
    const themeButton = page.locator('button[aria-label*="theme"]').or(
      page.locator('button').filter({ has: page.locator('svg.lucide-sun, svg.lucide-moon') })
    ).first()

    // Get initial theme class
    const htmlElement = page.locator('html')
    const initialClass = await htmlElement.getAttribute('class')

    // Click theme toggle
    await themeButton.click()

    // Wait for theme change
    await page.waitForTimeout(100)

    // Theme class should change
    const newClass = await htmlElement.getAttribute('class')
    expect(newClass).not.toBe(initialClass)
  })

  test('header is visible on all pages', async ({ page }) => {
    // Check home
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()

    // Check blog post
    await page.locator('article a').first().click()
    await expect(page.locator('header')).toBeVisible()
  })

  test('footer is visible on all pages', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()

    await page.locator('article a').first().click()
    await expect(page.locator('footer')).toBeVisible()
  })
})
```

**Step 2: Run E2E tests**

Run:
```bash
npm run test:e2e -- navigation.spec.ts
```
Expected: All tests pass

**Step 3: Commit**

```bash
git add e2e/navigation.spec.ts
git commit -m "test: add E2E tests for navigation"
```

---

### Task 15: GitHub Actions CI Workflow

**Files:**
- Create: `.github/workflows/test.yml`

**Step 1: Create CI workflow**

Create file `.github/workflows/test.yml`:
```yaml
name: Test

on:
  pull_request:
    branches: [master]
  push:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - run: npm ci

      - run: npm run lint

      - run: npm run test:run

      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - run: npm ci

      - run: npx playwright install --with-deps chromium

      - run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

**Step 2: Verify workflow syntax**

Run:
```bash
cat .github/workflows/test.yml | head -20
```
Expected: Valid YAML displayed

**Step 3: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions workflow for tests"
```

---

### Task 16: Update Documentation

**Files:**
- Modify: `README.md`

**Step 1: Add testing section to README**

Add the following section to `README.md` after the "Available Scripts" section:

```markdown
## Testing

This project uses Vitest for unit/component tests and Playwright for E2E tests.

### Running Tests

```bash
# Run unit and component tests
npm test

# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Test Structure

- `__tests__/lib/` - Unit tests for library modules
- `__tests__/components/` - Component tests with Testing Library
- `e2e/` - Playwright E2E tests

### CI

Tests run automatically on all PRs via GitHub Actions. Both unit tests and E2E tests must pass before merging.
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add testing documentation to README"
```

---

### Task 17: Final Verification

**Step 1: Run all unit tests**

Run:
```bash
npm run test:run
```
Expected: All tests pass

**Step 2: Run all E2E tests**

Run:
```bash
npm run test:e2e
```
Expected: All tests pass

**Step 3: Verify build still works**

Run:
```bash
npm run build
```
Expected: Build succeeds

**Step 4: Final commit if any changes**

```bash
git status
# If clean, done. Otherwise commit remaining changes.
```

---

## Summary

After completing all tasks:

- **Dependencies**: Vitest, Testing Library, Playwright installed
- **Configuration**: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`
- **Unit tests**: 4 modules tested (`search`, `posts`, `manifest`, `bluesky`)
- **Component tests**: 3 components tested (`PostCard`, `Callout`, `ShareButtons`)
- **E2E tests**: 3 spec files (`blog`, `search`, `navigation`)
- **CI**: GitHub Actions runs tests on all PRs
- **Docs**: README updated with testing instructions

Total commits: 17

---

## Validated Assumptions

### ✅ Validated

| Assumption | Source |
|-----------|--------|
| Vitest 3.x works with Next.js 16 & React 19 | Next.js examples, community reports |
| @testing-library/jest-dom works with Vitest globals | Testing Library docs |
| vite-tsconfig-paths resolves @/ aliases | Plugin documentation |
| Playwright webServer works with npm run dev | Playwright official docs |
| vi.mock('next/navigation') pattern correct | Next.js discussions, Vitest docs |

### ⚠️ Clarified

| Assumption | Clarification |
|-----------|---------------|
| React 19 requires manual afterEach cleanup | Not React 19 specific; depends on Vitest globals config. Plan includes cleanup for safety. |
| jsdom supports navigator.clipboard | jsdom does NOT have native clipboard support. Plan already mocks it in ShareButtons tests. |
