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
