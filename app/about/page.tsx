import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <div className="sub tall">
      <SiteNav />
      <h1>About</h1>
      <p className="lede">I&apos;m Bradley, a senior software engineer at Trade Me in Auckland. Most of my work there is on iOS.</p>
      <h2>Outside work</h2>
      <p>I build websites and MCP servers, usually on Cloudflare Workers. I like small tools that do one job well.</p>
      <h2>Security and privacy</h2>
      <p>
        I care about what software collects and who gets to see it. I would rather ask for less data, keep it on the device and make
        things work offline.
      </p>
      <p>
        This site has no cookies, no analytics and no trackers. The shape next to this text is raymarched on your GPU and never leaves
        your machine.
      </p>
    </div>
  );
}
