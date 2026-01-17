import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostCard } from '@/components/blog/post-card'
import type { PostMeta } from '@/lib/posts'

const createMockPost = (overrides?: Partial<PostMeta>): PostMeta => ({
  slug: 'test-post',
  frontmatter: {
    title: 'Test Post Title',
    description: 'This is a test post description for testing purposes.',
    publishedAt: '2026-01-15',
    tags: ['react', 'typescript', 'testing'],
  },
  readingTime: '5 min read',
  ...overrides,
})

describe('PostCard', () => {
  describe('rendering', () => {
    it('renders the post title', () => {
      const post = createMockPost()
      render(<PostCard post={post} />)

      expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    })

    it('renders the title as a link to /blog/{slug}', () => {
      const post = createMockPost({ slug: 'my-awesome-post' })
      render(<PostCard post={post} />)

      const titleLink = screen.getByRole('link', { name: 'Test Post Title' })
      expect(titleLink).toHaveAttribute('href', '/blog/my-awesome-post')
    })

    it('renders the post description', () => {
      const post = createMockPost()
      render(<PostCard post={post} />)

      expect(
        screen.getByText('This is a test post description for testing purposes.')
      ).toBeInTheDocument()
    })

    it('renders the reading time', () => {
      const post = createMockPost({ readingTime: '3 min read' })
      render(<PostCard post={post} />)

      expect(screen.getByText('3 min read')).toBeInTheDocument()
    })
  })

  describe('date formatting', () => {
    it('formats and displays the date correctly', () => {
      const post = createMockPost({
        frontmatter: {
          title: 'Date Test',
          description: 'Testing date formatting',
          publishedAt: '2026-01-15',
          tags: [],
        },
      })
      render(<PostCard post={post} />)

      // Date should be formatted as "January 15, 2026"
      expect(screen.getByText('January 15, 2026')).toBeInTheDocument()
    })

    it('includes a time element with datetime attribute', () => {
      const post = createMockPost({
        frontmatter: {
          title: 'Date Test',
          description: 'Testing date formatting',
          publishedAt: '2026-03-20',
          tags: [],
        },
      })
      render(<PostCard post={post} />)

      const timeElement = screen.getByText('March 20, 2026')
      expect(timeElement.tagName).toBe('TIME')
      expect(timeElement).toHaveAttribute('datetime', '2026-03-20')
    })
  })

  describe('tags', () => {
    it('renders all tags', () => {
      const post = createMockPost({
        frontmatter: {
          title: 'Tags Test',
          description: 'Testing tags rendering',
          publishedAt: '2026-01-15',
          tags: ['react', 'typescript', 'testing'],
        },
      })
      render(<PostCard post={post} />)

      expect(screen.getByText('react')).toBeInTheDocument()
      expect(screen.getByText('typescript')).toBeInTheDocument()
      expect(screen.getByText('testing')).toBeInTheDocument()
    })

    it('renders tags as links to /tags/{tag}', () => {
      const post = createMockPost({
        frontmatter: {
          title: 'Tags Test',
          description: 'Testing tags links',
          publishedAt: '2026-01-15',
          tags: ['React', 'TypeScript'],
        },
      })
      render(<PostCard post={post} />)

      // Tags should link to lowercase version
      const reactLink = screen.getByRole('link', { name: 'React' })
      const typescriptLink = screen.getByRole('link', { name: 'TypeScript' })

      expect(reactLink).toHaveAttribute('href', '/tags/react')
      expect(typescriptLink).toHaveAttribute('href', '/tags/typescript')
    })

    it('renders tags as badges', () => {
      const post = createMockPost({
        frontmatter: {
          title: 'Badges Test',
          description: 'Testing badges rendering',
          publishedAt: '2026-01-15',
          tags: ['react'],
        },
      })
      render(<PostCard post={post} />)

      // The badge should have the data-slot="badge" attribute from shadcn/ui Badge
      const badge = screen.getByText('react')
      expect(badge).toHaveAttribute('data-slot', 'badge')
    })

    it('renders empty tags array without errors', () => {
      const post = createMockPost({
        frontmatter: {
          title: 'No Tags',
          description: 'Testing empty tags',
          publishedAt: '2026-01-15',
          tags: [],
        },
      })

      expect(() => render(<PostCard post={post} />)).not.toThrow()
    })
  })
})
