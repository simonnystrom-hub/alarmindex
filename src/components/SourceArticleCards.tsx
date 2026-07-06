const sources = [
  {
    href: "https://www.apa.org/monitor/2022/11/strain-media-overload",
    title: "Rubrikstress och nyhetsöverbelastning",
    description:
      "Forskning och klinisk erfarenhet om rubrikstress, doomscrolling och hur nyhetsflöden påverkar psykisk hälsa.",
    publisher: "American Psychological Association",
  },
  {
    href: "https://www.bbc.com/future/article/20200512-how-the-news-changes-the-way-we-think-and-behave/",
    title: "Hur nyheter påverkar hur vi tänker och känner",
    description:
      "Om negativitetsbias, stress och hur nyhetskonsumtion kan påverka humör och vardagsliv.",
    publisher: "BBC Future",
  },
] as const;

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M11 3h5v5M10 10 16 4M15 11v5H5V6h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SourceArticleCards() {
  return (
    <section className="space-y-4">
      <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">
        Hur alarmistiska nyheter påverkar oss
      </h2>

      <ul className="grid gap-4 sm:grid-cols-2">
        {sources.map((source) => (
          <li key={source.href}>
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--ink-subtle)] hover:bg-[var(--surface-muted)]"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
                {source.publisher}
              </p>
              <h3 className="mt-2 font-serif text-base font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]">
                {source.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">
                {source.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)]">
                Läs artikeln
                <ExternalLinkIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
