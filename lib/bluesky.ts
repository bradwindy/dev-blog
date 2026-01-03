import { BskyAgent, RichText } from "@atproto/api";

const agent = new BskyAgent({
  service: "https://bsky.social",
});

interface PostToBlueskyParams {
  title: string;
  description: string;
  url: string;
  tags: string[];
}

export async function postToBluesky({
  title,
  description,
  url,
  tags,
}: PostToBlueskyParams): Promise<{ success: boolean; uri?: string; error?: string }> {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;

  if (!handle || !password) {
    return { success: false, error: "Bluesky credentials not configured" };
  }

  try {
    await agent.login({ identifier: handle, password });

    const hashtags = tags.map((tag) => `#${tag.replace(/\s+/g, "")}`).join(" ");
    const postText = `New blog post: "${title}"\n\n${description}\n\n${url}\n\n${hashtags}`;

    // Create rich text with facets for links and hashtags
    const rt = new RichText({ text: postText });
    await rt.detectFacets(agent);

    const response = await agent.post({
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    });

    return { success: true, uri: response.uri };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
