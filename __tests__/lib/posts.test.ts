import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getPostBySlug,
  getAllPosts,
  getPostsByTag,
  getAllTags,
  getRelatedPosts,
} from '@/lib/posts'

// Mock fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}))

// Import fs after mocking
import fs from 'fs'

const mockExistsSync = vi.mocked(fs.existsSync)
const mockReaddirSync = vi.mocked(fs.readdirSync)
const mockReadFileSync = vi.mocked(fs.readFileSync)

// Sample MDX content for testing
const createMockMdxContent = (
  title: string,
  description: string,
  publishedAt: string,
  tags: string[],
  draft = false,
  content = 'This is sample content for the blog post.'
) => `---
title: "${title}"
description: "${description}"
publishedAt: ${publishedAt}
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
${draft ? 'draft: true' : ''}
---

${content}
`

describe('lib/posts', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Default: posts directory exists
    mockExistsSync.mockReturnValue(true)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getPostBySlug', () => {
    it('returns null when file does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      const result = getPostBySlug('non-existent-post')

      expect(result).toBeNull()
    })

    it('returns post data when file exists', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(
        createMockMdxContent(
          'Hello World',
          'An introduction post',
          '2026-01-01',
          ['intro', 'welcome']
        )
      )

      const result = getPostBySlug('hello-world')

      expect(result).not.toBeNull()
      expect(result?.slug).toBe('hello-world')
      expect(result?.frontmatter.title).toBe('Hello World')
      expect(result?.frontmatter.description).toBe('An introduction post')
      // gray-matter parses dates as Date objects
      expect(new Date(result?.frontmatter.publishedAt).toISOString()).toBe('2026-01-01T00:00:00.000Z')
      expect(result?.frontmatter.tags).toEqual(['intro', 'welcome'])
      expect(result?.content).toContain('sample content')
      expect(result?.readingTime).toBeDefined()
    })

    it('includes reading time calculation', () => {
      mockExistsSync.mockReturnValue(true)
      // Longer content for more accurate reading time
      const longContent = 'Word '.repeat(500)
      mockReadFileSync.mockReturnValue(
        createMockMdxContent(
          'Long Post',
          'A post with lots of content',
          '2026-01-01',
          ['reading'],
          false,
          longContent
        )
      )

      const result = getPostBySlug('long-post')

      expect(result?.readingTime).toMatch(/\d+ min read/)
    })

    it('handles draft posts', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(
        createMockMdxContent(
          'Draft Post',
          'A work in progress',
          '2026-01-01',
          ['draft'],
          true
        )
      )

      const result = getPostBySlug('draft-post')

      expect(result).not.toBeNull()
      expect(result?.frontmatter.draft).toBe(true)
    })
  })

  describe('getAllPosts', () => {
    const setupMockPosts = () => {
      mockReaddirSync.mockReturnValue([
        'post-a.mdx' as unknown as import('fs').Dirent,
        'post-b.mdx' as unknown as import('fs').Dirent,
        'draft-post.mdx' as unknown as import('fs').Dirent,
      ])

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((filePath) => {
        const path = filePath.toString()
        if (path.includes('post-a')) {
          return createMockMdxContent(
            'Post A',
            'Description A',
            '2026-01-02',
            ['tag1']
          )
        }
        if (path.includes('post-b')) {
          return createMockMdxContent(
            'Post B',
            'Description B',
            '2026-01-03',
            ['tag2']
          )
        }
        if (path.includes('draft-post')) {
          return createMockMdxContent(
            'Draft Post',
            'Draft description',
            '2026-01-04',
            ['draft'],
            true
          )
        }
        return ''
      })
    }

    it('returns empty array when posts directory does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      const result = getAllPosts()

      expect(result).toEqual([])
    })

    it('returns posts sorted by date descending', () => {
      setupMockPosts()
      vi.stubEnv('NODE_ENV', 'development')

      const result = getAllPosts()

      expect(result.length).toBeGreaterThanOrEqual(2)
      // Most recent post should be first
      const dates = result.map((p) => new Date(p.frontmatter.publishedAt).getTime())
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i])
      }
    })

    it('includes drafts in development mode', () => {
      setupMockPosts()
      vi.stubEnv('NODE_ENV', 'development')

      const result = getAllPosts()

      expect(result.some((p) => p.frontmatter.draft === true)).toBe(true)
    })

    it('excludes drafts in production mode', () => {
      setupMockPosts()
      vi.stubEnv('NODE_ENV', 'production')

      const result = getAllPosts()

      expect(result.every((p) => !p.frontmatter.draft)).toBe(true)
      expect(result.some((p) => p.slug === 'draft-post')).toBe(false)
    })

    it('filters out non-mdx files', () => {
      mockReaddirSync.mockReturnValue([
        'post-a.mdx' as unknown as import('fs').Dirent,
        'readme.txt' as unknown as import('fs').Dirent,
        'image.png' as unknown as import('fs').Dirent,
      ])
      mockReadFileSync.mockReturnValue(
        createMockMdxContent('Post A', 'Description A', '2026-01-01', ['tag1'])
      )

      const result = getAllPosts()

      // Should only include the mdx file
      expect(result.length).toBe(1)
      expect(result[0].slug).toBe('post-a')
    })

    it('returns PostMeta without content field', () => {
      setupMockPosts()
      vi.stubEnv('NODE_ENV', 'development')

      const result = getAllPosts()

      result.forEach((post) => {
        expect(post).toHaveProperty('slug')
        expect(post).toHaveProperty('frontmatter')
        expect(post).toHaveProperty('readingTime')
        expect(post).not.toHaveProperty('content')
      })
    })
  })

  describe('getPostsByTag', () => {
    beforeEach(() => {
      mockReaddirSync.mockReturnValue([
        'react-post.mdx' as unknown as import('fs').Dirent,
        'typescript-post.mdx' as unknown as import('fs').Dirent,
        'both-post.mdx' as unknown as import('fs').Dirent,
      ])

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((filePath) => {
        const path = filePath.toString()
        if (path.includes('react-post')) {
          return createMockMdxContent(
            'React Post',
            'About React',
            '2026-01-01',
            ['react', 'frontend']
          )
        }
        if (path.includes('typescript-post')) {
          return createMockMdxContent(
            'TypeScript Post',
            'About TypeScript',
            '2026-01-02',
            ['typescript', 'backend']
          )
        }
        if (path.includes('both-post')) {
          return createMockMdxContent(
            'Both Post',
            'About both',
            '2026-01-03',
            ['react', 'typescript']
          )
        }
        return ''
      })
    })

    it('returns posts with matching tag', () => {
      const result = getPostsByTag('react')

      expect(result.length).toBe(2)
      expect(result.every((p) => p.frontmatter.tags.includes('react'))).toBe(true)
    })

    it('is case insensitive', () => {
      const lowerResult = getPostsByTag('react')
      const upperResult = getPostsByTag('REACT')
      const mixedResult = getPostsByTag('ReAcT')

      expect(lowerResult.length).toBe(upperResult.length)
      expect(lowerResult.length).toBe(mixedResult.length)
    })

    it('returns empty array for non-existent tag', () => {
      const result = getPostsByTag('nonexistent')

      expect(result).toEqual([])
    })
  })

  describe('getAllTags', () => {
    beforeEach(() => {
      mockReaddirSync.mockReturnValue([
        'post-1.mdx' as unknown as import('fs').Dirent,
        'post-2.mdx' as unknown as import('fs').Dirent,
        'post-3.mdx' as unknown as import('fs').Dirent,
      ])

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((filePath) => {
        const path = filePath.toString()
        if (path.includes('post-1')) {
          return createMockMdxContent(
            'Post 1',
            'Description 1',
            '2026-01-01',
            ['react', 'nextjs']
          )
        }
        if (path.includes('post-2')) {
          return createMockMdxContent(
            'Post 2',
            'Description 2',
            '2026-01-02',
            ['react', 'typescript']
          )
        }
        if (path.includes('post-3')) {
          return createMockMdxContent(
            'Post 3',
            'Description 3',
            '2026-01-03',
            ['typescript', 'testing']
          )
        }
        return ''
      })
    })

    it('returns all unique tags with counts', () => {
      const result = getAllTags()

      expect(result.find((t) => t.tag === 'react')?.count).toBe(2)
      expect(result.find((t) => t.tag === 'typescript')?.count).toBe(2)
      expect(result.find((t) => t.tag === 'nextjs')?.count).toBe(1)
      expect(result.find((t) => t.tag === 'testing')?.count).toBe(1)
    })

    it('sorts tags by count descending', () => {
      const result = getAllTags()

      const counts = result.map((t) => t.count)
      for (let i = 1; i < counts.length; i++) {
        expect(counts[i - 1]).toBeGreaterThanOrEqual(counts[i])
      }
    })

    it('normalizes tags to lowercase', () => {
      mockReaddirSync.mockReturnValue([
        'post-1.mdx' as unknown as import('fs').Dirent,
      ])
      mockReadFileSync.mockReturnValue(
        createMockMdxContent('Post', 'Desc', '2026-01-01', ['React', 'REACT', 'react'])
      )

      const result = getAllTags()

      expect(result.length).toBe(1)
      expect(result[0].tag).toBe('react')
      expect(result[0].count).toBe(3)
    })

    it('returns empty array when no posts', () => {
      mockExistsSync.mockReturnValue(false)

      const result = getAllTags()

      expect(result).toEqual([])
    })
  })

  describe('getRelatedPosts', () => {
    beforeEach(() => {
      mockReaddirSync.mockReturnValue([
        'current-post.mdx' as unknown as import('fs').Dirent,
        'related-1.mdx' as unknown as import('fs').Dirent,
        'related-2.mdx' as unknown as import('fs').Dirent,
        'unrelated.mdx' as unknown as import('fs').Dirent,
        'highly-related.mdx' as unknown as import('fs').Dirent,
      ])

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((filePath) => {
        const path = filePath.toString()
        if (path.includes('current-post')) {
          return createMockMdxContent(
            'Current Post',
            'The main post',
            '2026-01-01',
            ['react', 'typescript', 'testing']
          )
        }
        if (path.includes('related-1')) {
          return createMockMdxContent(
            'Related 1',
            'One matching tag',
            '2026-01-02',
            ['react']
          )
        }
        if (path.includes('related-2')) {
          return createMockMdxContent(
            'Related 2',
            'Two matching tags',
            '2026-01-03',
            ['react', 'typescript']
          )
        }
        if (path.includes('unrelated')) {
          return createMockMdxContent(
            'Unrelated',
            'No matching tags',
            '2026-01-04',
            ['python', 'django']
          )
        }
        if (path.includes('highly-related')) {
          return createMockMdxContent(
            'Highly Related',
            'All matching tags',
            '2026-01-05',
            ['react', 'typescript', 'testing']
          )
        }
        return ''
      })
    })

    it('returns empty array for non-existent post', () => {
      mockExistsSync.mockImplementation((path) => {
        return !path.toString().includes('nonexistent')
      })

      const result = getRelatedPosts('nonexistent')

      expect(result).toEqual([])
    })

    it('excludes the current post from results', () => {
      const result = getRelatedPosts('current-post')

      expect(result.every((p) => p.slug !== 'current-post')).toBe(true)
    })

    it('excludes posts with no matching tags', () => {
      const result = getRelatedPosts('current-post')

      expect(result.every((p) => p.slug !== 'unrelated')).toBe(true)
    })

    it('sorts by number of matching tags descending', () => {
      const result = getRelatedPosts('current-post')

      // highly-related (3 matches) should come before related-2 (2 matches)
      const highlyRelatedIndex = result.findIndex((p) => p.slug === 'highly-related')
      const related2Index = result.findIndex((p) => p.slug === 'related-2')
      const related1Index = result.findIndex((p) => p.slug === 'related-1')

      if (highlyRelatedIndex !== -1 && related2Index !== -1) {
        expect(highlyRelatedIndex).toBeLessThan(related2Index)
      }
      if (related2Index !== -1 && related1Index !== -1) {
        expect(related2Index).toBeLessThan(related1Index)
      }
    })

    it('respects the limit parameter', () => {
      const result = getRelatedPosts('current-post', 2)

      expect(result.length).toBeLessThanOrEqual(2)
    })

    it('uses default limit of 3', () => {
      // Add more related posts to test default limit
      mockReaddirSync.mockReturnValue([
        'current-post.mdx' as unknown as import('fs').Dirent,
        'related-1.mdx' as unknown as import('fs').Dirent,
        'related-2.mdx' as unknown as import('fs').Dirent,
        'related-3.mdx' as unknown as import('fs').Dirent,
        'related-4.mdx' as unknown as import('fs').Dirent,
        'related-5.mdx' as unknown as import('fs').Dirent,
      ])

      mockReadFileSync.mockImplementation((filePath) => {
        const path = filePath.toString()
        if (path.includes('current-post')) {
          return createMockMdxContent(
            'Current',
            'Current',
            '2026-01-01',
            ['react']
          )
        }
        // All related posts have matching tag
        return createMockMdxContent('Related', 'Related', '2026-01-02', ['react'])
      })

      const result = getRelatedPosts('current-post')

      expect(result.length).toBeLessThanOrEqual(3)
    })

    it('matches tags case-insensitively', () => {
      mockReaddirSync.mockReturnValue([
        'current.mdx' as unknown as import('fs').Dirent,
        'related.mdx' as unknown as import('fs').Dirent,
      ])

      mockReadFileSync.mockImplementation((filePath) => {
        const path = filePath.toString()
        if (path.includes('current')) {
          return createMockMdxContent('Current', 'Desc', '2026-01-01', ['REACT'])
        }
        return createMockMdxContent('Related', 'Desc', '2026-01-02', ['react'])
      })

      const result = getRelatedPosts('current')

      expect(result.length).toBe(1)
      expect(result[0].slug).toBe('related')
    })
  })
})
