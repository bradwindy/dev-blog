import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Callout } from '@/components/mdx/Callout'

describe('Callout', () => {
  describe('rendering', () => {
    it('renders children content', () => {
      render(<Callout>Test content</Callout>)

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders complex children', () => {
      render(
        <Callout>
          <p>Paragraph content</p>
          <strong>Bold text</strong>
        </Callout>
      )

      expect(screen.getByText('Paragraph content')).toBeInTheDocument()
      expect(screen.getByText('Bold text')).toBeInTheDocument()
    })
  })

  describe('default type', () => {
    it('defaults to info type when no type is provided', () => {
      const { container } = render(<Callout>Default callout</Callout>)

      const calloutDiv = container.firstChild as HTMLElement
      expect(calloutDiv.className).toContain('border-blue-500')
      expect(calloutDiv.className).toContain('bg-blue-50')
    })
  })

  describe('info variant', () => {
    it('renders with blue styling', () => {
      const { container } = render(
        <Callout type="info">Info callout</Callout>
      )

      const calloutDiv = container.firstChild as HTMLElement
      expect(calloutDiv.className).toContain('border-blue-500')
      expect(calloutDiv.className).toContain('bg-blue-50')
      expect(calloutDiv.className).toContain('text-blue-900')
    })

    it('renders the Info icon', () => {
      const { container } = render(
        <Callout type="info">Info callout</Callout>
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('h-5', 'w-5')
    })
  })

  describe('warning variant', () => {
    it('renders with yellow styling', () => {
      const { container } = render(
        <Callout type="warning">Warning callout</Callout>
      )

      const calloutDiv = container.firstChild as HTMLElement
      expect(calloutDiv.className).toContain('border-yellow-500')
      expect(calloutDiv.className).toContain('bg-yellow-50')
      expect(calloutDiv.className).toContain('text-yellow-900')
    })

    it('renders the AlertTriangle icon', () => {
      const { container } = render(
        <Callout type="warning">Warning callout</Callout>
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('h-5', 'w-5')
    })
  })

  describe('tip variant', () => {
    it('renders with green styling', () => {
      const { container } = render(<Callout type="tip">Tip callout</Callout>)

      const calloutDiv = container.firstChild as HTMLElement
      expect(calloutDiv.className).toContain('border-green-500')
      expect(calloutDiv.className).toContain('bg-green-50')
      expect(calloutDiv.className).toContain('text-green-900')
    })

    it('renders the Lightbulb icon', () => {
      const { container } = render(<Callout type="tip">Tip callout</Callout>)

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('h-5', 'w-5')
    })
  })

  describe('danger variant', () => {
    it('renders with red styling', () => {
      const { container } = render(
        <Callout type="danger">Danger callout</Callout>
      )

      const calloutDiv = container.firstChild as HTMLElement
      expect(calloutDiv.className).toContain('border-red-500')
      expect(calloutDiv.className).toContain('bg-red-50')
      expect(calloutDiv.className).toContain('text-red-900')
    })

    it('renders the AlertCircle icon', () => {
      const { container } = render(
        <Callout type="danger">Danger callout</Callout>
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg).toHaveClass('h-5', 'w-5')
    })
  })

  describe('common styling', () => {
    it('has consistent base styling across all variants', () => {
      const { container } = render(<Callout>Base styling test</Callout>)

      const calloutDiv = container.firstChild as HTMLElement
      expect(calloutDiv.className).toContain('my-6')
      expect(calloutDiv.className).toContain('flex')
      expect(calloutDiv.className).toContain('gap-3')
      expect(calloutDiv.className).toContain('rounded-lg')
      expect(calloutDiv.className).toContain('border-l-4')
      expect(calloutDiv.className).toContain('p-4')
    })
  })
})
