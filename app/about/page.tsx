import type { Metadata } from "next";
import { PersonJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about me and this blog",
};

export default function AboutPage() {
  return (
    <>
      <PersonJsonLd />
      <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl tracking-tight lg:text-5xl mb-8">
          About
        </h1>
        <div className="prose prose-neutral dark:prose-invert">
          <p>
            Hi! I&apos;m a software developer passionate about building great
            software and sharing what I learn along the way.
          </p>

          <h2>What I Write About</h2>
          <ul>
            <li>
              <strong>Tutorials</strong> - Step-by-step guides on various
              technologies
            </li>
            <li>
              <strong>Deep Dives</strong> - In-depth exploration of technical
              topics
            </li>
            <li>
              <strong>Quick Tips</strong> - Short, actionable development tips
            </li>
            <li>
              <strong>Project Showcases</strong> - Walkthroughs of projects I&apos;m
              working on
            </li>
          </ul>

          <h2>Connect</h2>
          <p>
            You can find me on{" "}
            <a
              href="https://bsky.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bluesky
            </a>{" "}
            and{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </p>

          <h2>About This Blog</h2>
          <p>
            This blog is built with Next.js 15, MDX, and Tailwind CSS. It&apos;s
            hosted on Vercel. The source code is available on GitHub.
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
