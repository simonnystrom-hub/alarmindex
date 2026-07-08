"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dagens index", hideOnHome: true },
  { href: "/#bedom-artikel", label: "Bedöm en artikel" },
  { href: "/metodik", label: "Metodik" },
] as const;

export function SiteHeaderNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const visibleLinks = links.filter((link) => !("hideOnHome" in link && link.hideOnHome && isHome));

  return (
    <nav className="flex gap-2 text-sm">
      {visibleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex min-h-11 items-center rounded-full px-4 text-[var(--ink-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
