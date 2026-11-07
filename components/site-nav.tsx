"use client";

import { usePathname } from "next/navigation";
import { TransitionLink } from "./transition-link";

const PAGES = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav({ big = false }: { big?: boolean }) {
  const pathname = usePathname();
  const items = big ? PAGES : [{ href: "/", label: "Home" }, ...PAGES];
  return (
    <nav className={big ? "nav-big" : "nav"} aria-label="Site">
      {items.map(({ href, label }) => (
        <TransitionLink key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
          {label}
        </TransitionLink>
      ))}
    </nav>
  );
}
