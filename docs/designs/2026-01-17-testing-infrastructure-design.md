# Testing Infrastructure Design

**Date:** 2026-01-17
**Status:** Research Complete

---

## Problem Statement

The dev-blog project currently has no test infrastructure, which means:
- Code changes can't be verified automatically
- Regressions can slip into production unnoticed
- PRs are merged based on manual review only
- No confidence when refactoring or adding features

## Success Criteria

The testing implementation is complete when:

1. **Infrastructure exists**: Vitest and Playwright are configured and working
2. **Unit tests cover lib/**: All modules in `lib/` have tests for their exported functions
3. **Component tests exist**: Key components (PostCard, Callout, ShareButtons) have render tests
4. **E2E tests work**: Critical user flows (blog listing, post reading, search, tags) are covered
5. **CI blocks bad PRs**: GitHub Actions runs all tests on PR, merge is blocked if any fail
6. **Tests are documented**: README includes how to run tests locally
7. **All tests pass**: `npm test` and `npm run test:e2e` succeed

## Constraints & Out of Scope

- Visual regression testing (screenshot comparisons)
- Performance/load testing
- API contract testing with external services (Bluesky API will be mocked)
- Coverage thresholds (can add later once baseline exists)
- Pre-commit hooks (keep commits fast, let CI catch issues)

---

## Approach

### Tech Stack

| Layer | Tool | Why |
|-------|------|-----|
| Unit/Component | **Vitest 3.x** | Fast, native ESM, great Next.js support |
| React Testing | **@testing-library/react** | Standard for component testing |
| DOM utilities | **happy-dom** | Faster than jsdom, good enough for this project |
| E2E | **Playwright** | Best cross-browser support, fast, reliable |
| CI | **GitHub Actions** | Free, native PR integration |

### File Structure

```
dev-blog/
├── __tests__/              # Unit and component tests
│   ├── lib/
│   │   ├── posts.test.ts
│   │   ├── search.test.ts
│   │   ├── manifest.test.ts
│   │   └── bluesky.test.ts
│   └── components/
│       ├── post-card.test.tsx
│       ├── callout.test.tsx
│       └── share-buttons.test.tsx
├── e2e/                    # Playwright E2E tests
│   ├── blog.spec.ts
│   ├── search.spec.ts
│   └── navigation.spec.ts
├── vitest.config.ts        # Vitest configuration
├── playwright.config.ts    # Playwright configuration
└── .github/
    └── workflows/
        └── test.yml        # CI workflow
```

### npm Scripts

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

### Dependencies to Install

```bash
npm install -D vitest @testing-library/react @testing-library/dom happy-dom @vitejs/plugin-react @playwright/test
```

---

## Unit Tests (lib/ modules)

### lib/posts.ts

| Function | Tests |
|----------|-------|
| `getPostBySlug()` | Returns post data, handles missing file, parses frontmatter correctly |
| `getAllPosts()` | Returns sorted posts, filters drafts in production, includes drafts in dev |
| `getPostsByTag()` | Filters by tag (case-insensitive), returns empty for unknown tag |
| `getAllTags()` | Returns unique tags with counts, sorted by count |
| `getRelatedPosts()` | Returns related posts by tag overlap, excludes current post, respects limit |

### lib/search.ts

| Function | Tests |
|----------|-------|
| `createSearchIndex()` | Creates Fuse index from posts |
| `searchPosts()` | Returns matching posts, handles empty query, fuzzy matches |

### lib/manifest.ts

| Function | Tests |
|----------|-------|
| `getManifest()` | Reads manifest file, returns empty on missing file |
| `saveManifest()` | Writes manifest correctly |
| `isPostAlreadyPosted()` | Returns true/false correctly |
| `getNewPosts()` | Filters to unposted posts only |

### lib/bluesky.ts

| Function | Tests |
|----------|-------|
| `postToBluesky()` | Calls API correctly (mocked), handles errors gracefully |

### Mocking Strategy

- File system operations: Mock with `vi.mock('fs')` or use temp directories
- Bluesky API: Mock with `vi.mock('@atproto/api')`
- Environment variables: Set via `vi.stubEnv()`

---

## Component Tests

### PostCard (`components/blog/post-card.tsx`)

| Test Case | What to verify |
|-----------|----------------|
| Renders post title | Title text appears and links to correct slug |
| Renders description | Description text visible |
| Formats date | Date displayed in expected format |
| Renders tags | Tags appear as badges, link to `/tags/[tag]` |
| Shows reading time | Reading time displayed |

### Callout (`components/mdx/callout.tsx`)

| Test Case | What to verify |
|-----------|----------------|
| Renders info variant | Blue styling, info icon |
| Renders warning variant | Yellow styling, warning icon |
| Renders tip variant | Green styling, lightbulb icon |
| Renders children | Content inside callout visible |

### ShareButtons (`components/blog/share-buttons.tsx`)

| Test Case | What to verify |
|-----------|----------------|
| Renders all buttons | Copy, Bluesky, Twitter buttons visible |
| Copy button works | Copies URL to clipboard (mock navigator.clipboard) |
| Social links correct | Bluesky/Twitter URLs contain post URL and title |

### Testing Approach

- Use `@testing-library/react` with `render()` and `screen`
- Query by role/text (accessible testing)
- No snapshot tests (brittle, low value)
- Mock `next/link` and `next/navigation` as needed

---

## E2E Tests (Playwright)

### blog.spec.ts

| Test | Steps |
|------|-------|
| Home page loads | Navigate to `/`, verify blog list visible |
| Blog post renders | Click post, verify title/content/date visible |
| Code blocks work | Navigate to post with code, verify syntax highlighting |
| Share buttons visible | On post page, verify share buttons present |

### search.spec.ts

| Test | Steps |
|------|-------|
| Search opens with Cmd+K | Press keyboard shortcut, verify dialog opens |
| Search finds posts | Type query, verify results appear |
| Search navigates to post | Click result, verify navigation |
| Empty search state | Search for nonsense, verify empty message |

### navigation.spec.ts

| Test | Steps |
|------|-------|
| Tag filtering works | Click tag, verify filtered results |
| About page loads | Navigate to `/about`, verify content |
| Theme toggle works | Click theme button, verify class changes |
| Mobile navigation | Set viewport small, verify mobile menu works |

### Playwright Configuration

- Run against `npm run dev` (using `webServer` config)
- Test in Chromium only for CI speed (full browsers optional locally)
- Screenshots on failure for debugging
- Retry once on CI to handle flakiness

---

## GitHub Actions CI

### Workflow: `.github/workflows/test.yml`

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
      - run: npm test -- --run  # Unit + component tests
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
```

### Key Design Decisions

- **Two parallel jobs**: Unit tests and E2E run simultaneously for faster feedback
- **Chromium only in CI**: Faster than testing all browsers, catches 99% of issues
- **Artifact upload on failure**: Playwright HTML report available for debugging
- **Runs on both PR and push**: Ensures master stays green
- **Build verification**: Ensures no build errors (per CLAUDE.md requirement)

### Branch Protection (Manual Setup)

After first successful run, configure in GitHub repo settings:
- Require status checks: `test` and `e2e` jobs must pass
- Require branches to be up to date

---

## Open Questions

1. **Test data strategy**: Should we use existing blog posts as test fixtures, or create dedicated test fixtures in `__tests__/fixtures/`? (Recommendation: dedicated fixtures for predictable tests)

2. **Coverage thresholds**: Do you want to enforce minimum coverage later? (Can add after baseline established)

---

## Implementation Order

| Phase | Tasks |
|-------|-------|
| 1. Setup | Install Vitest, Playwright, configure both |
| 2. Unit tests | Write tests for all lib/ modules |
| 3. Component tests | Write tests for key components |
| 4. E2E tests | Write Playwright tests |
| 5. CI | Add GitHub Actions workflow |
| 6. Docs | Update README with test commands |
