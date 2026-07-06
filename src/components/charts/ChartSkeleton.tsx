type ChartSkeletonProps = {
  title: string;
  description?: string;
};

export function ChartSkeleton({ title, description }: ChartSkeletonProps) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
      aria-busy="true"
      aria-label={`Laddar ${title}`}
    >
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 sm:px-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{description}</p>
        ) : null}
      </div>
      <div className="h-64 animate-pulse bg-[var(--surface-muted)] sm:h-80" />
    </section>
  );
}
