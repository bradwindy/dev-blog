import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Use vi.hoisted to ensure mock functions are available during mock hoisting
const { mockLogin, mockPost, mockDetectFacets } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockPost: vi.fn(),
  mockDetectFacets: vi.fn(),
}))

// Mock @atproto/api before importing the module under test
vi.mock('@atproto/api', () => {
  return {
    BskyAgent: class MockBskyAgent {
      login = mockLogin
      post = mockPost
    },
    RichText: class MockRichText {
      text: string
      facets: unknown[] = []
      constructor({ text }: { text: string }) {
        this.text = text
      }
      detectFacets = mockDetectFacets
    },
  }
})

// Import after mocking
import { postToBluesky } from '@/lib/bluesky'

describe('lib/bluesky', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockDetectFacets.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('postToBluesky', () => {
    const validParams = {
      title: 'Test Post',
      description: 'A test description',
      url: 'https://example.com/test-post',
      tags: ['react', 'typescript'],
    }

    describe('credential validation', () => {
      it('returns error when handle is missing', async () => {
        vi.stubEnv('BLUESKY_HANDLE', '')
        vi.stubEnv('BLUESKY_APP_PASSWORD', 'test-password')

        const result = await postToBluesky(validParams)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Bluesky credentials not configured')
        expect(mockLogin).not.toHaveBeenCalled()
      })

      it('returns error when password is missing', async () => {
        vi.stubEnv('BLUESKY_HANDLE', 'test.bsky.social')
        vi.stubEnv('BLUESKY_APP_PASSWORD', '')

        const result = await postToBluesky(validParams)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Bluesky credentials not configured')
        expect(mockLogin).not.toHaveBeenCalled()
      })

      it('returns error when both credentials are missing', async () => {
        vi.stubEnv('BLUESKY_HANDLE', '')
        vi.stubEnv('BLUESKY_APP_PASSWORD', '')

        const result = await postToBluesky(validParams)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Bluesky credentials not configured')
        expect(mockLogin).not.toHaveBeenCalled()
      })
    })

    describe('successful posting', () => {
      beforeEach(() => {
        vi.stubEnv('BLUESKY_HANDLE', 'test.bsky.social')
        vi.stubEnv('BLUESKY_APP_PASSWORD', 'test-password')
        mockLogin.mockResolvedValue({})
      })

      it('returns success with URI on successful post', async () => {
        const expectedUri = 'at://did:plc:abc123/app.bsky.feed.post/xyz789'
        mockPost.mockResolvedValue({ uri: expectedUri })

        const result = await postToBluesky(validParams)

        expect(result.success).toBe(true)
        expect(result.uri).toBe(expectedUri)
        expect(result.error).toBeUndefined()
      })

      it('calls login with correct credentials', async () => {
        mockPost.mockResolvedValue({ uri: 'at://test' })

        await postToBluesky(validParams)

        expect(mockLogin).toHaveBeenCalledWith({
          identifier: 'test.bsky.social',
          password: 'test-password',
        })
      })

      it('calls detectFacets to process rich text', async () => {
        mockPost.mockResolvedValue({ uri: 'at://test' })

        await postToBluesky(validParams)

        expect(mockDetectFacets).toHaveBeenCalled()
      })

      it('creates post with correct structure', async () => {
        mockPost.mockResolvedValue({ uri: 'at://test' })

        await postToBluesky(validParams)

        expect(mockPost).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.any(String),
            facets: expect.any(Array),
            createdAt: expect.any(String),
          })
        )
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        vi.stubEnv('BLUESKY_HANDLE', 'test.bsky.social')
        vi.stubEnv('BLUESKY_APP_PASSWORD', 'test-password')
      })

      it('handles login failure', async () => {
        mockLogin.mockRejectedValue(new Error('Invalid credentials'))

        const result = await postToBluesky(validParams)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Invalid credentials')
        expect(result.uri).toBeUndefined()
      })

      it('handles post failure', async () => {
        mockLogin.mockResolvedValue({})
        mockPost.mockRejectedValue(new Error('Rate limited'))

        const result = await postToBluesky(validParams)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Rate limited')
        expect(result.uri).toBeUndefined()
      })

      it('handles non-Error exceptions', async () => {
        mockLogin.mockResolvedValue({})
        mockPost.mockRejectedValue('String error')

        const result = await postToBluesky(validParams)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Unknown error')
      })
    })

    describe('hashtag formatting', () => {
      beforeEach(() => {
        vi.stubEnv('BLUESKY_HANDLE', 'test.bsky.social')
        vi.stubEnv('BLUESKY_APP_PASSWORD', 'test-password')
        mockLogin.mockResolvedValue({})
        mockPost.mockResolvedValue({ uri: 'at://test' })
      })

      it('formats single tag correctly', async () => {
        await postToBluesky({
          ...validParams,
          tags: ['javascript'],
        })

        expect(mockPost).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('#javascript'),
          })
        )
      })

      it('formats multiple tags correctly', async () => {
        await postToBluesky({
          ...validParams,
          tags: ['react', 'nextjs', 'typescript'],
        })

        const callArg = mockPost.mock.calls[0][0]
        expect(callArg.text).toContain('#react')
        expect(callArg.text).toContain('#nextjs')
        expect(callArg.text).toContain('#typescript')
      })

      it('removes spaces from tags', async () => {
        await postToBluesky({
          ...validParams,
          tags: ['react native', 'next js'],
        })

        const callArg = mockPost.mock.calls[0][0]
        expect(callArg.text).toContain('#reactnative')
        expect(callArg.text).toContain('#nextjs')
        expect(callArg.text).not.toContain('#react native')
        expect(callArg.text).not.toContain('#next js')
      })

      it('handles empty tags array', async () => {
        await postToBluesky({
          ...validParams,
          tags: [],
        })

        expect(mockPost).toHaveBeenCalled()
        const callArg = mockPost.mock.calls[0][0]
        // Should end with URL and empty hashtags section
        expect(callArg.text).toContain(validParams.url)
      })

      it('includes title, description, and URL in post text', async () => {
        await postToBluesky(validParams)

        const callArg = mockPost.mock.calls[0][0]
        expect(callArg.text).toContain(validParams.title)
        expect(callArg.text).toContain(validParams.description)
        expect(callArg.text).toContain(validParams.url)
      })
    })
  })
})
