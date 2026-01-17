import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ShareButtons } from '@/components/blog/share-buttons'

// Mock navigator.clipboard
const mockWriteText = vi.fn()

// Mock window.open
const mockWindowOpen = vi.fn()

describe('ShareButtons', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockWriteText.mockReset()
    mockWindowOpen.mockReset()

    // Setup clipboard mock
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    })
    mockWriteText.mockResolvedValue(undefined)

    // Setup window.open mock
    vi.stubGlobal('open', mockWindowOpen)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
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
  })

  describe('copy to clipboard', () => {
    it('copies URL to clipboard when copy button clicked', async () => {
      render(<ShareButtons title="Test Post" slug="test-post" />)

      const copyButton = screen.getByRole('button', { name: /copy link/i })
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(mockWriteText).toHaveBeenCalledWith(
        'https://www.windybank.net/blog/test-post'
      )
    })

    it('shows copied state after clicking copy', async () => {
      render(<ShareButtons title="Test Post" slug="test-post" />)

      const copyButton = screen.getByRole('button', { name: /copy link/i })
      await act(async () => {
        fireEvent.click(copyButton)
      })

      expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()
    })

    it('resets copied state after 2 seconds', async () => {
      vi.useFakeTimers()

      render(<ShareButtons title="Test Post" slug="test-post" />)

      const copyButton = screen.getByRole('button', { name: /copy link/i })
      await act(async () => {
        fireEvent.click(copyButton)
      })

      // Verify copied state is shown
      expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument()

      // Advance timers by 2 seconds
      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      // Verify state is reset back to "Copy link"
      expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()

      vi.useRealTimers()
    })
  })

  describe('Bluesky sharing', () => {
    it('opens Bluesky share URL when button clicked', () => {
      render(<ShareButtons title="Test Post" slug="test-post" />)

      const blueskyButton = screen.getByRole('button', { name: /bluesky/i })
      fireEvent.click(blueskyButton)

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://bsky.app/intent/compose'),
        '_blank'
      )
    })

    it('includes post title in Bluesky share URL', () => {
      render(<ShareButtons title="My Amazing Post" slug="amazing-post" />)

      const blueskyButton = screen.getByRole('button', { name: /bluesky/i })
      fireEvent.click(blueskyButton)

      const calledUrl = mockWindowOpen.mock.calls[0][0] as string
      expect(calledUrl).toContain(encodeURIComponent('My Amazing Post'))
    })
  })

  describe('Twitter sharing', () => {
    it('opens Twitter share URL when button clicked', () => {
      render(<ShareButtons title="Test Post" slug="test-post" />)

      const twitterButton = screen.getByRole('button', { name: /twitter/i })
      fireEvent.click(twitterButton)

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet'),
        '_blank'
      )
    })

    it('includes post title in Twitter share URL', () => {
      render(<ShareButtons title="My Amazing Post" slug="amazing-post" />)

      const twitterButton = screen.getByRole('button', { name: /twitter/i })
      fireEvent.click(twitterButton)

      const calledUrl = mockWindowOpen.mock.calls[0][0] as string
      expect(calledUrl).toContain(encodeURIComponent('My Amazing Post'))
    })
  })
})
