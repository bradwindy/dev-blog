import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Keyboard Shortcut', () => {
    test('opens search dialog with Cmd+K / Ctrl+K', async ({ page }) => {
      // Use ControlOrMeta for cross-platform support
      await page.keyboard.press('ControlOrMeta+k')

      // Wait for dialog to appear
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()

      // Verify dialog title
      await expect(dialog.getByText('Search posts')).toBeVisible()
    })

    test('closes search dialog with Escape', async ({ page }) => {
      // Open the search dialog
      await page.keyboard.press('ControlOrMeta+k')
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()

      // Press Escape to close
      await page.keyboard.press('Escape')

      // Verify dialog is closed
      await expect(dialog).not.toBeVisible()
    })

    test('toggles search dialog with repeated Cmd+K', async ({ page }) => {
      const dialog = page.locator('[role="dialog"]')

      // Open the dialog
      await page.keyboard.press('ControlOrMeta+k')
      await expect(dialog).toBeVisible()

      // Close with same shortcut
      await page.keyboard.press('ControlOrMeta+k')
      await expect(dialog).not.toBeVisible()
    })
  })

  test.describe('Search Input', () => {
    test('has input field with placeholder', async ({ page }) => {
      await page.keyboard.press('ControlOrMeta+k')

      const input = page.getByPlaceholder('Type to search...')
      await expect(input).toBeVisible()
      await expect(input).toBeFocused()
    })

    test('empty search shows no results', async ({ page }) => {
      await page.keyboard.press('ControlOrMeta+k')

      const dialog = page.locator('[role="dialog"]')
      const input = page.getByPlaceholder('Type to search...')
      await expect(input).toBeVisible()

      // With empty input, there should be no results list
      const resultsList = dialog.locator('ul')
      await expect(resultsList).not.toBeVisible()

      // And no "No results found" message
      await expect(dialog.getByText('No results found.')).not.toBeVisible()
    })

    test('shows "No results found" for non-matching query', async ({ page }) => {
      await page.keyboard.press('ControlOrMeta+k')

      const input = page.getByPlaceholder('Type to search...')
      await input.fill('xyznonexistentquery123')

      // Wait for debounce
      await page.waitForTimeout(300)

      const dialog = page.locator('[role="dialog"]')
      await expect(dialog.getByText('No results found.')).toBeVisible()
    })
  })

  test.describe('Search Results', () => {
    test('finds posts by title', async ({ page }) => {
      await page.keyboard.press('ControlOrMeta+k')

      const input = page.getByPlaceholder('Type to search...')
      await input.fill('Hello World')

      // Wait for debounce
      await page.waitForTimeout(300)

      const dialog = page.locator('[role="dialog"]')
      const resultsList = dialog.locator('ul')
      await expect(resultsList).toBeVisible()

      // Check that Hello World post appears in results
      await expect(dialog.getByText('Hello World')).toBeVisible()
    })

    test('finds posts by partial title match', async ({ page }) => {
      await page.keyboard.press('ControlOrMeta+k')

      const input = page.getByPlaceholder('Type to search...')
      await input.fill('Geohash')

      // Wait for debounce
      await page.waitForTimeout(300)

      const dialog = page.locator('[role="dialog"]')
      const resultsList = dialog.locator('ul')
      await expect(resultsList).toBeVisible()

      // Check that the Geohash post appears in results
      await expect(dialog.getByText(/Geohash-Based IDs/)).toBeVisible()
    })

    test('clicking search result navigates to post', async ({ page }) => {
      await page.keyboard.press('ControlOrMeta+k')

      const input = page.getByPlaceholder('Type to search...')
      await input.fill('Hello World')

      // Wait for debounce
      await page.waitForTimeout(300)

      const dialog = page.locator('[role="dialog"]')

      // Click on the search result
      const result = dialog.locator('button').filter({ hasText: 'Hello World' })
      await result.click()

      // Verify navigation to the post
      await expect(page).toHaveURL(/\/blog\/hello-world/)

      // Verify the dialog is closed
      await expect(dialog).not.toBeVisible()

      // Verify the post page content
      await expect(page.locator('h1')).toContainText('Hello World')
    })
  })

  test.describe('Search Button', () => {
    test('opens search dialog when clicking search button', async ({ page }) => {
      // Click the search button in the header
      const searchButton = page.getByRole('button', { name: 'Search' })
      await searchButton.click()

      // Verify dialog opens
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
      await expect(dialog.getByText('Search posts')).toBeVisible()
    })
  })
})
