import { getAllPosts } from "@/lib/posts";
import { HeaderClient } from "./header-client";

export function Header() {
  const posts = getAllPosts();
  return <HeaderClient posts={posts} />;
}
