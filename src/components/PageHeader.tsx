import type { ReactNode } from "react";
import Link from "next/link";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Tillbaka",
  children,
}: PageHeaderProps) {
  return (
    <header className="space-y-3">
      {backHref ? (
        <p className="text-sm">
          <Link href={backHref} className="text-[var(--ink-muted)] hover:text-[var(--ink)]">
            ← {backLabel}
          </Link>
        </p>
      ) : null}
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="max-w-3xl font-serif text-2xl font-semibold leading-tight text-[var(--ink)] sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
          {description}
        </p>
      ) : null}
      {children}
    </header>
  );
}
