const sections = [
  { href: "#dagens-lage", label: "Dagens läge" },
  { href: "#jamforelse", label: "Jämförelse" },
  { href: "#medelvarden", label: "Medelvärden" },
  { href: "#bedom-artikel", label: "Bedöm artikel" },
] as const;

export function HomeSectionNav() {
  return (
    <nav aria-label="Hoppa till sektion på sidan">
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {sections.map((section) => (
          <li key={section.href} className="shrink-0">
            <a
              href={section.href}
              className="inline-flex min-h-10 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--ink-muted)] transition hover:border-[var(--ink-subtle)] hover:text-[var(--ink)]"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
