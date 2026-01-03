# Developer Blog

A modern developer blog built with Next.js 15, MDX, and Tailwind CSS. Write blog posts in Markdown with powerful features like syntax highlighting, dark mode, search, and automatic social sharing.

## Features

- **MDX Blog Posts** - Write content in MDX with frontmatter metadata (title, description, publishedAt, tags, draft)
- **Shiki Syntax Highlighting** - Beautiful code blocks with copy-to-clipboard functionality
- **Dark/Light Mode** - Theme switching with system preference detection using next-themes
- **Client-Side Search** - Fast fuzzy search with Fuse.js, accessible via ⌘K (Cmd+K) or Ctrl+K
- **RSS Feed** - Auto-generated RSS feed at `/feed.xml`
- **Auto-Generated Sitemap** - SEO-friendly sitemap at `/sitemap.xml`
- **OG Image Generation** - Dynamic Open Graph images using @vercel/og
- **Share Buttons** - Easy sharing with copy link, Bluesky, and Twitter/X buttons
- **Bluesky Auto-Posting** - Automatically post new blog posts to Bluesky via webhook
- **JSON-LD Structured Data** - Rich snippets for better SEO
- **Custom MDX Components** - Built-in Callout and CodeBlock components
- **Reading Time Estimates** - Auto-calculated reading time for each post
- **Responsive Design** - Mobile-friendly UI with shadcn/ui components

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Content:** [MDX](https://mdxjs.com/) with gray-matter for frontmatter
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Syntax Highlighting:** [Shiki](https://shiki.style/)
- **Search:** [Fuse.js](https://fusejs.io/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Analytics:** [@vercel/analytics](https://vercel.com/analytics)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd dev-blog
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local` (see [Environment Variables](#environment-variables) below)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Writing Blog Posts

Blog posts are stored in the `/content/blog/` directory as MDX files.

### Creating a New Post

1. Create a new `.mdx` file in `/content/blog/`:
```bash
touch content/blog/my-new-post.mdx
```

2. Add frontmatter and content:
```mdx
---
title: "My New Post Title"
description: "A brief description of the post for SEO and previews"
publishedAt: 2026-01-04
tags: ["nextjs", "react", "tutorial"]
draft: false
---

Your content here in Markdown/MDX format.

## Headings

Regular Markdown syntax works great.

<Callout type="tip">
You can use custom MDX components!
</Callout>

\`\`\`typescript
// Code blocks with syntax highlighting
const example = "Beautiful code";
\`\`\`
```

### Frontmatter Fields

- `title` (required): Post title
- `description` (required): Short description for SEO and post previews
- `publishedAt` (required): Publication date in YYYY-MM-DD format
- `tags` (optional): Array of tags for categorization
- `draft` (optional): Set to `true` to hide the post in production

### Custom MDX Components

**Callout Component:**
```mdx
<Callout type="info">
Info message here
</Callout>

<Callout type="warning">
Warning message here
</Callout>

<Callout type="tip">
Tip message here
</Callout>
```

**Code Blocks:**
Code blocks automatically include syntax highlighting and a copy button. Just use standard Markdown fenced code blocks with a language identifier.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Bluesky Integration (Optional)
BLUESKY_HANDLE=your-handle.bsky.social
BLUESKY_APP_PASSWORD=your-app-password
BLUESKY_WEBHOOK_SECRET=your-webhook-secret
```

### Variable Descriptions

- **NEXT_PUBLIC_SITE_URL**: Your production site URL (used for RSS, sitemap, OG images, and share buttons)
- **BLUESKY_HANDLE**: Your Bluesky handle (optional, for auto-posting)
- **BLUESKY_APP_PASSWORD**: Your Bluesky app password (optional, for auto-posting)
- **BLUESKY_WEBHOOK_SECRET**: Secret for webhook authentication (optional, for auto-posting)

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

### Deploy to Vercel

The easiest way to deploy this blog is with [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy!

Vercel will automatically:
- Build your site on every push
- Generate the sitemap and RSS feed
- Create OG images dynamically
- Serve your content globally via CDN

### Environment Variables in Vercel

Add the following environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SITE_URL`
- `BLUESKY_HANDLE` (if using Bluesky integration)
- `BLUESKY_APP_PASSWORD` (if using Bluesky integration)
- `BLUESKY_WEBHOOK_SECRET` (if using Bluesky integration)

## Project Structure

```
dev-blog/
├── app/                      # Next.js App Router
│   ├── blog/[slug]/         # Individual blog post pages
│   ├── api/bluesky-post/    # Bluesky webhook endpoint
│   ├── feed.xml/            # RSS feed
│   ├── sitemap.ts           # Sitemap generation
│   └── robots.ts            # Robots.txt
├── components/              # React components
│   ├── blog/               # Blog-specific components
│   ├── mdx/                # MDX custom components
│   └── ui/                 # shadcn/ui components
├── content/
│   └── blog/               # MDX blog posts
├── lib/                    # Utility functions
│   ├── posts.ts           # Post loading and parsing
│   ├── bluesky.ts         # Bluesky API integration
│   └── search.ts          # Search functionality
└── public/                # Static assets
```

## Features in Detail

### Search (⌘K)

Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to open the search dialog. The search uses Fuse.js for fast, fuzzy searching across post titles, descriptions, and tags.

### Bluesky Auto-Posting

When enabled, the blog can automatically post to Bluesky when new blog posts are published. Set up a webhook in your deployment platform to call `/api/bluesky-post` after successful builds.

### Syntax Highlighting

Code blocks use Shiki with the GitHub Dark theme for syntax highlighting. All code blocks include a copy-to-clipboard button for easy code sharing.

### Dark Mode

The blog supports dark mode with automatic system preference detection. Users can manually toggle between light and dark themes using the theme switcher in the header.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
