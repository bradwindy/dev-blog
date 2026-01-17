import { test, expect } from '@playwright/test'

test.describe('Blog', () => {
  test.describe('Home Page', () => {
    test('displays blog post list', async ({ page }) => {
      await page.goto('/')

      // Check for the Recent Posts section
      await expect(page.getByRole('heading', { name: 'Recent Posts' })).toBeVisible()

      // Check that at least one post card is displayed
      const postCards = page.locator('article, [class*="card"]').filter({
        has: page.locator('a[href^="/blog/"]'),
      })
      await expect(postCards.first()).toBeVisible()
    })
  })

  test.describe('Blog Listing Page', () => {
    test('displays all blog posts', async ({ page }) => {
      await page.goto('/blog')

      // Check for the Blog heading
      await expect(page.getByRole('heading', { name: 'Blog', level: 1 })).toBeVisible()

      // Check that posts are displayed
      const postLinks = page.locator('a[href^="/blog/"]').filter({
        hasNot: page.locator('[href="/blog"]'),
      })
      const count = await postLinks.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Blog Post Page', () => {
    test('renders correctly when clicking a post', async ({ page }) => {
      await page.goto('/')

      // Find and click the first blog post link
      const firstPostLink = page.locator('a[href^="/blog/"]').first()
      const postTitle = await firstPostLink.textContent()
      await firstPostLink.click()

      // Wait for navigation and verify the title is visible
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('h1')).toContainText(postTitle || '')
    })

    test('has share buttons', async ({ page }) => {
      // Navigate directly to hello-world post which we know exists
      await page.goto('/blog/hello-world')

      // Check for share section
      await expect(page.getByText('Share:')).toBeVisible()

      // Check for share buttons
      await expect(page.getByRole('button', { name: /copy link/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /bluesky/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /twitter/i })).toBeVisible()
    })

    test('displays reading time', async ({ page }) => {
      await page.goto('/blog/hello-world')

      // Check for reading time (format: "X min read")
      await expect(page.getByText(/\d+ min read/)).toBeVisible()
    })

    test('has syntax highlighted code blocks', async ({ page }) => {
      // hello-world.mdx contains code examples
      await page.goto('/blog/hello-world')

      // Check for code block with syntax highlighting
      // rehype-pretty-code adds data-language attribute to highlighted code
      const codeBlock = page.locator('pre code, figure[data-rehype-pretty-code-figure]')
      await expect(codeBlock.first()).toBeVisible()

      // Verify that syntax highlighting is applied (code has styled spans)
      const highlightedSpans = page.locator('pre code span[style]')
      const spanCount = await highlightedSpans.count()
      expect(spanCount).toBeGreaterThan(0)
    })
  })
})
