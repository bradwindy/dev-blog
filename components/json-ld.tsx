import type { Post } from "@/lib/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

interface ArticleJsonLdProps {
  post: Post;
}

export function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.publishedAt,
    dateModified: post.frontmatter.updatedAt || post.frontmatter.publishedAt,
    articleSection: "Technology",
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/about#person`,
      name: "Bradley Windybank",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Bradley Windybank",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.frontmatter.tags.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bradley Windybank",
    url: SITE_URL,
    description: "A blog about software development, AI, iOS, and thoughts on building sometimes great software.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/about#person`,
    name: "Bradley Windybank",
    url: `${SITE_URL}/about`,
    sameAs: [
      "https://github.com/bradwindy",
      "https://bsky.app/profile/bradwindy.bsky.social",
    ],
    jobTitle: "Software Developer",
    knowsAbout: ["Software Development", "iOS", "AI", "Web Development"],
    description: "A software developer passionate about building great software and sharing knowledge.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url?: string; // Optional - omit for last item
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const listItem: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
      };
      // Only add item URL if provided (omit for last breadcrumb)
      if (item.url) {
        listItem.item = item.url;
      }
      return listItem;
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
