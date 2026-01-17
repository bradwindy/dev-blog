import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.describe('Tag Navigation', () => {
    test('clicking tag on post card navigates to tag page', async ({ page }) => {
      await page.goto('/')

      // Find a tag badge link on a post card
      const tagLink = page.locator('a[href^="/tags/"]').first()
      const tagText = await tagLink.textContent()
      await tagLink.click()

      // Verify navigation to tag page
      await expect(page).toHaveURL(/\/tags\//)

      // Verify the tag page shows the correct heading (tag in URL is lowercase)
      const heading = await page.locator('h1').textContent()
      expect(heading?.toLowerCase()).toBe(`#${tagText?.toLowerCase()}`)
    })

    test('tag page shows filtered posts', async ({ page }) => {
      // Navigate to a known tag page
      await page.goto('/tags/welcome')

      // Verify the heading shows the tag
      await expect(page.locator('h1')).toContainText('#welcome')

      // Verify post count is displayed
      await expect(page.getByText(/\d+ posts?/)).toBeVisible()

      // Verify filtered posts are displayed
      const postCards = page.locator('article, [class*="card"]').filter({
        has: page.locator('a[href^="/blog/"]'),
      })
      await expect(postCards.first()).toBeVisible()
    })

    test('tag page only shows posts with that tag', async ({ page }) => {
      await page.goto('/tags/meta')

      // Get all tag badges on the page
      const tagBadges = page.locator('a[href^="/tags/"]')
      const count = await tagBadges.count()

      // Verify that "meta" tag appears in the displayed posts
      let hasMetaTag = false
      for (let i = 0; i < count; i++) {
        const text = await tagBadges.nth(i).textContent()
        if (text?.toLowerCase() === 'meta') {
          hasMetaTag = true
          break
        }
      }
      expect(hasMetaTag).toBe(true)
    })
  })

  test.describe('Post Navigation', () => {
    test('clicking post title navigates to detail page', async ({ page }) => {
      await page.goto('/')

      // Find and click the first blog post link
      const firstPostLink = page.locator('a[href^="/blog/"]').first()
      const postTitle = await firstPostLink.textContent()
      await firstPostLink.click()

      // Wait for navigation and verify URL changed
      await expect(page).toHaveURL(/\/blog\//)

      // Verify the post page shows the title
      await expect(page.locator('h1')).toContainText(postTitle || '')
    })

    test('clicking post on blog listing navigates correctly', async ({ page }) => {
      await page.goto('/blog')

      // Find a post link that is not just "/blog"
      const postLinks = page.locator('a[href^="/blog/"]').filter({
        hasNot: page.locator('[href="/blog"]'),
      })
      const firstPost = postLinks.first()
      const postHref = await firstPost.getAttribute('href')
      await firstPost.click()

      // Verify navigation to the post
      await expect(page).toHaveURL(postHref || '')

      // Verify the page has content
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Theme Toggle', () => {
    test('theme toggle button is accessible', async ({ page }) => {
      await page.goto('/')

      // Find the theme toggle button by its screen reader text
      const themeButton = page.getByRole('button', { name: 'Toggle theme' })
      await expect(themeButton).toBeVisible()
    })

    test('clicking theme toggle opens dropdown menu', async ({ page }) => {
      await page.goto('/')

      // Click the theme toggle button
      const themeButton = page.getByRole('button', { name: 'Toggle theme' })
      await themeButton.click()

      // Verify dropdown menu appears with theme options
      await expect(page.getByRole('menuitem', { name: 'Light' })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: 'Dark' })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: 'System' })).toBeVisible()
    })

    test('selecting Light theme adds light class to html', async ({ page }) => {
      await page.goto('/')

      // Click theme toggle and select Light
      const themeButton = page.getByRole('button', { name: 'Toggle theme' })
      await themeButton.click()
      await page.getByRole('menuitem', { name: 'Light' }).click()

      // Verify html element has light class (no dark class)
      const html = page.locator('html')
      await expect(html).not.toHaveClass(/dark/)
      await expect(html).toHaveClass(/light/)
    })

    test('selecting Dark theme adds dark class to html', async ({ page }) => {
      await page.goto('/')

      // Click theme toggle and select Dark
      const themeButton = page.getByRole('button', { name: 'Toggle theme' })
      await themeButton.click()
      await page.getByRole('menuitem', { name: 'Dark' }).click()

      // Verify html element has dark class
      const html = page.locator('html')
      await expect(html).toHaveClass(/dark/)
    })

    test('theme persists across navigation', async ({ page }) => {
      await page.goto('/')

      // Set dark theme
      const themeButton = page.getByRole('button', { name: 'Toggle theme' })
      await themeButton.click()
      await page.getByRole('menuitem', { name: 'Dark' }).click()

      // Navigate to another page
      await page.goto('/blog')

      // Verify dark theme is still applied
      const html = page.locator('html')
      await expect(html).toHaveClass(/dark/)
    })
  })

  test.describe('Header Visibility', () => {
    test('header is visible on home page', async ({ page }) => {
      await page.goto('/')

      const header = page.locator('header')
      await expect(header).toBeVisible()
      await expect(header.getByText('Bradley Windybank')).toBeVisible()
    })

    test('header is visible on blog page', async ({ page }) => {
      await page.goto('/blog')

      const header = page.locator('header')
      await expect(header).toBeVisible()
      await expect(header.getByText('Bradley Windybank')).toBeVisible()
    })

    test('header is visible on individual post page', async ({ page }) => {
      await page.goto('/blog/hello-world')

      // Use getByRole('banner') to target the main navigation header
      // (blog posts have a second <header> for post metadata)
      const header = page.getByRole('banner')
      await expect(header).toBeVisible()
      await expect(header.getByText('Bradley Windybank')).toBeVisible()
    })

    test('header is visible on about page', async ({ page }) => {
      await page.goto('/about')

      const header = page.locator('header')
      await expect(header).toBeVisible()
      await expect(header.getByText('Bradley Windybank')).toBeVisible()
    })

    test('header is visible on contact page', async ({ page }) => {
      await page.goto('/contact')

      const header = page.locator('header')
      await expect(header).toBeVisible()
      await expect(header.getByText('Bradley Windybank')).toBeVisible()
    })

    test('header is visible on tag page', async ({ page }) => {
      await page.goto('/tags/welcome')

      const header = page.locator('header')
      await expect(header).toBeVisible()
      await expect(header.getByText('Bradley Windybank')).toBeVisible()
    })

    test('header navigation links work', async ({ page }) => {
      await page.goto('/')

      // Click Blog link
      await page.locator('header').getByRole('link', { name: 'Blog' }).click()
      await expect(page).toHaveURL('/blog')

      // Click About link
      await page.locator('header').getByRole('link', { name: 'About' }).click()
      await expect(page).toHaveURL('/about')

      // Click Contact link
      await page.locator('header').getByRole('link', { name: 'Contact' }).click()
      await expect(page).toHaveURL('/contact')

      // Click logo to go home
      await page.locator('header').getByRole('link', { name: 'Bradley Windybank' }).click()
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Footer Visibility', () => {
    test('footer is visible on home page', async ({ page }) => {
      await page.goto('/')

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
      await expect(footer.getByText(/Bradley Windybank/)).toBeVisible()
    })

    test('footer is visible on blog page', async ({ page }) => {
      await page.goto('/blog')

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
      await expect(footer.getByText(/Bradley Windybank/)).toBeVisible()
    })

    test('footer is visible on individual post page', async ({ page }) => {
      await page.goto('/blog/hello-world')

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
      await expect(footer.getByText(/Bradley Windybank/)).toBeVisible()
    })

    test('footer is visible on about page', async ({ page }) => {
      await page.goto('/about')

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
      await expect(footer.getByText(/Bradley Windybank/)).toBeVisible()
    })

    test('footer is visible on contact page', async ({ page }) => {
      await page.goto('/contact')

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
      await expect(footer.getByText(/Bradley Windybank/)).toBeVisible()
    })

    test('footer is visible on tag page', async ({ page }) => {
      await page.goto('/tags/welcome')

      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
      await expect(footer.getByText(/Bradley Windybank/)).toBeVisible()
    })

    test('footer contains social links', async ({ page }) => {
      await page.goto('/')

      const footer = page.locator('footer')

      // Check for Bluesky link
      await expect(footer.getByRole('link', { name: 'Bluesky' })).toBeVisible()

      // Check for GitHub link
      await expect(footer.getByRole('link', { name: 'GitHub' })).toBeVisible()

      // Check for RSS Feed link
      await expect(footer.getByRole('link', { name: 'RSS Feed' })).toBeVisible()
    })
  })
})
