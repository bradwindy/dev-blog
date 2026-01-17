import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getManifest,
  saveManifest,
  isPostAlreadyPosted,
  markPostAsPosted,
  getNewPosts,
} from '@/lib/manifest'

// Mock fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}))

// Import fs after mocking
import fs from 'fs'

const mockExistsSync = vi.mocked(fs.existsSync)
const mockReadFileSync = vi.mocked(fs.readFileSync)
const mockWriteFileSync = vi.mocked(fs.writeFileSync)

// Mock manifest data
const mockManifestData = {
  postedSlugs: ['already-posted', 'another-posted'],
  lastUpdated: '2026-01-15T00:00:00.000Z',
}

describe('lib/manifest', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-18T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getManifest', () => {
    it('returns manifest from file when it exists', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(mockManifestData))

      const result = getManifest()

      expect(result).toEqual(mockManifestData)
      expect(mockExistsSync).toHaveBeenCalled()
      expect(mockReadFileSync).toHaveBeenCalled()
    })

    it('returns default manifest when file is missing', () => {
      mockExistsSync.mockReturnValue(false)

      const result = getManifest()

      expect(result.postedSlugs).toEqual([])
      expect(result.lastUpdated).toBe('2026-01-18T12:00:00.000Z')
      expect(mockReadFileSync).not.toHaveBeenCalled()
    })
  })

  describe('saveManifest', () => {
    it('writes manifest with updated timestamp', () => {
      const manifest = {
        postedSlugs: ['test-slug'],
        lastUpdated: '2026-01-01T00:00:00.000Z',
      }

      saveManifest(manifest)

      expect(mockWriteFileSync).toHaveBeenCalledTimes(1)
      const writtenContent = mockWriteFileSync.mock.calls[0][1] as string
      const parsedContent = JSON.parse(writtenContent)

      expect(parsedContent.postedSlugs).toEqual(['test-slug'])
      expect(parsedContent.lastUpdated).toBe('2026-01-18T12:00:00.000Z')
    })

    it('formats JSON with 2-space indentation', () => {
      const manifest = {
        postedSlugs: ['slug-1'],
        lastUpdated: '2026-01-01T00:00:00.000Z',
      }

      saveManifest(manifest)

      const writtenContent = mockWriteFileSync.mock.calls[0][1] as string
      // Should have proper indentation (2 spaces)
      expect(writtenContent).toContain('  "postedSlugs"')
    })
  })

  describe('isPostAlreadyPosted', () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(mockManifestData))
    })

    it('returns true when slug is already in manifest', () => {
      const result = isPostAlreadyPosted('already-posted')

      expect(result).toBe(true)
    })

    it('returns false when slug is not in manifest', () => {
      const result = isPostAlreadyPosted('new-post')

      expect(result).toBe(false)
    })

    it('returns false when manifest file does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      const result = isPostAlreadyPosted('any-slug')

      expect(result).toBe(false)
    })
  })

  describe('markPostAsPosted', () => {
    it('adds slug to manifest and saves', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(mockManifestData))

      markPostAsPosted('new-post')

      expect(mockWriteFileSync).toHaveBeenCalledTimes(1)
      const writtenContent = mockWriteFileSync.mock.calls[0][1] as string
      const parsedContent = JSON.parse(writtenContent)

      expect(parsedContent.postedSlugs).toContain('new-post')
      expect(parsedContent.postedSlugs).toContain('already-posted')
      expect(parsedContent.postedSlugs).toContain('another-posted')
    })

    it('does not duplicate slug if already present', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(mockManifestData))

      markPostAsPosted('already-posted')

      // Should not call writeFileSync since slug already exists
      expect(mockWriteFileSync).not.toHaveBeenCalled()
    })

    it('creates manifest with slug when file does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      markPostAsPosted('first-post')

      expect(mockWriteFileSync).toHaveBeenCalledTimes(1)
      const writtenContent = mockWriteFileSync.mock.calls[0][1] as string
      const parsedContent = JSON.parse(writtenContent)

      expect(parsedContent.postedSlugs).toEqual(['first-post'])
    })
  })

  describe('getNewPosts', () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(JSON.stringify(mockManifestData))
    })

    it('filters to unposted slugs only', () => {
      const allSlugs = ['already-posted', 'new-post-1', 'another-posted', 'new-post-2']

      const result = getNewPosts(allSlugs)

      expect(result).toEqual(['new-post-1', 'new-post-2'])
    })

    it('returns empty array when all slugs are posted', () => {
      const allSlugs = ['already-posted', 'another-posted']

      const result = getNewPosts(allSlugs)

      expect(result).toEqual([])
    })

    it('returns all slugs when none are posted', () => {
      const allSlugs = ['brand-new-1', 'brand-new-2', 'brand-new-3']

      const result = getNewPosts(allSlugs)

      expect(result).toEqual(['brand-new-1', 'brand-new-2', 'brand-new-3'])
    })

    it('returns all slugs when manifest does not exist', () => {
      mockExistsSync.mockReturnValue(false)
      const allSlugs = ['post-1', 'post-2']

      const result = getNewPosts(allSlugs)

      expect(result).toEqual(['post-1', 'post-2'])
    })

    it('preserves order of input slugs', () => {
      const allSlugs = ['z-post', 'a-post', 'm-post']

      const result = getNewPosts(allSlugs)

      expect(result).toEqual(['z-post', 'a-post', 'm-post'])
    })
  })
})
