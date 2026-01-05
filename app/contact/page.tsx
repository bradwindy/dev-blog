import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with me",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl tracking-tight lg:text-5xl mb-8">
          Contact
        </h1>
        <div className="prose prose-neutral dark:prose-invert">
          <p>
            Want to get in touch? Feel free to reach out through any of the
            channels below.
          </p>

          <h2>Email</h2>
          <p>
            <a href="mailto:hello@windybank.net">hello@windybank.net</a>
          </p>

          <h2>GitHub</h2>
          <p>
            <Link
              href="https://github.com/bradwindy"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/bradwindy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
