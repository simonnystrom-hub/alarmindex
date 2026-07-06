import Link from "next/link";
import { SiteHeaderNav } from "./SiteHeaderNav";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] sm:bg-[var(--surface)]/95 sm:backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <Link href="/" className="group min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            Alarmindex
          </p>
          <p className="text-base font-semibold text-[var(--ink)] group-hover:text-[var(--ink-muted)] sm:text-lg">
            <span className="sm:hidden">Formspråk i nyhetsrubriker</span>
            <span className="hidden sm:inline">Alarmindex för svenska nyhetsrubriker</span>
          </p>
        </Link>
        <SiteHeaderNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm leading-relaxed text-[var(--ink-muted)]">
        <p>
          Alarmindex mäter rubrikers formspråk — inte journalistisk kvalitet eller
          sanningshalt. Data insamlas och publiceras automatiskt varje dag.
        </p>
      </div>
    </footer>
  );
}
