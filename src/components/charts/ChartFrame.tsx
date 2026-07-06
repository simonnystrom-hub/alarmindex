import type { ReactNode } from "react";
import Link from "next/link";

type ChartFrameProps = {
  id?: string;
  title: string;
  description: string;
  methodologyHref?: string;
  scoreTerm?: string;
  showMethodologyLink?: boolean;
  footnote?: string;
  children: ReactNode;
};

export function ChartFrame({
  id,
  title,
  description,
  methodologyHref = "/metodik",
  scoreTerm = "dagspoäng",
  showMethodologyLink = true,
  footnote,
  children,
}: ChartFrameProps) {
  return (
    <section
      id={id}
      className={`overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]${id ? " scroll-mt-28" : ""}`}
    >
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 sm:px-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--ink-muted)]">
          {description}
        </p>
        <p className="mt-2 text-xs text-[var(--ink-subtle)]">
          Y-axeln visar {scoreTerm} 0–100
          {showMethodologyLink ? (
            <>
              .{" "}
              <Link href={methodologyHref} className="underline hover:text-[var(--ink)]">
                Läs hur poängen räknas
              </Link>
              .
            </>
          ) : (
            "."
          )}
        </p>
      </div>
      <div className="px-2 py-4 sm:px-4 sm:py-6">{children}</div>
      {footnote ? (
        <p className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--ink-subtle)] sm:px-6">
          {footnote}
        </p>
      ) : null}
    </section>
  );
}
