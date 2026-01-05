import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { postToBluesky } from "@/lib/bluesky";
import { getNewPosts, markPostAsPosted } from "@/lib/manifest";

const WEBHOOK_SECRET = process.env.BLUESKY_WEBHOOK_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.windybank.net";

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const authHeader = request.headers.get("authorization");
  if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allPosts = getAllPosts();
    const allSlugs = allPosts.map((p) => p.slug);
    const newSlugs = getNewPosts(allSlugs);

    if (newSlugs.length === 0) {
      return NextResponse.json({ message: "No new posts to share" });
    }

    const results = [];

    for (const slug of newSlugs) {
      const post = getPostBySlug(slug);
      if (!post || post.frontmatter.draft) {
        continue;
      }

      const result = await postToBluesky({
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        url: `${SITE_URL}/blog/${slug}`,
        tags: post.frontmatter.tags,
      });

      if (result.success) {
        markPostAsPosted(slug);
        results.push({ slug, success: true, uri: result.uri });
      } else {
        results.push({ slug, success: false, error: result.error });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
