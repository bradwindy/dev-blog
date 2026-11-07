import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <div className="sub">
      <SiteNav />
      <h1>Contact</h1>
      <p className="lede">Email is best. I read everything that isn&apos;t selling something.</p>
      <div className="contact">
        <a href="mailto:hello@windybank.net">hello@windybank.net</a>
        <a href="https://x.com/bradwindy">@bradwindy on X</a>
        <a href="https://github.com/bradwindy">GitHub</a>
      </div>
    </div>
  );
}
