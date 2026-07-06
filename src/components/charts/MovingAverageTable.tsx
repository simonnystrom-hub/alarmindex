import Link from "next/link";
import { NewspaperSwatch } from "@/components/NewspaperSwatch";
import type { MovingAverageSummary } from "@/lib/chart-data";
import { newspaperColor, newspaperColorSoft } from "@/lib/newspaper-colors";

function formatChange(change: number | null): string {
  if (change == null) return "—";
  return `${change > 0 ? "+" : ""}${change}`;
}

type MovingAverageTableProps = {
  rows: MovingAverageSummary[];
  highlightSlug?: string;
};

export function MovingAverageTable({ rows, highlightSlug }: MovingAverageTableProps) {
  if (rows.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-[var(--ink-muted)] sm:px-6">
        Ingen data för vald period ännu.
      </p>
    );
  }

  const showChangeColumn = rows.some((row) => row.change != null);

  return (
    <div>
      <div
        className={`hidden border-b border-[var(--border)] bg-[var(--surface-muted)] px-6 py-2.5 text-xs font-medium text-[var(--ink-subtle)] sm:grid sm:gap-6 ${
          showChangeColumn
            ? "sm:grid-cols-[1fr_auto_auto_auto]"
            : "sm:grid-cols-[1fr_auto_auto]"
        }`}
      >
        <span>Tidning</span>
        <span className="text-right">Medelvärde</span>
        {showChangeColumn ? <span className="text-right">Förändring</span> : null}
        <span className="text-right">Dagar i snitt</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {rows.map((row, index) => {
          const color = newspaperColor(row.slug);
          const soft = newspaperColorSoft(row.slug);
          const highlighted = highlightSlug === row.slug;
          const dimmed = highlightSlug && !highlighted;

          return (
            <div
              key={row.slug}
              className={`grid gap-3 px-5 py-4 transition sm:items-center sm:gap-6 sm:px-6 ${
                showChangeColumn
                  ? "sm:grid-cols-[1fr_auto_auto_auto]"
                  : "sm:grid-cols-[1fr_auto_auto]"
              } ${dimmed ? "opacity-50" : ""} ${highlighted ? "bg-[var(--surface-muted)]" : ""}`}
              style={{ boxShadow: highlighted ? `inset 4px 0 0 ${color}` : undefined }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                  style={{ backgroundColor: soft, color }}
                >
                  {index + 1}
                </span>
                <NewspaperSwatch slug={row.slug} size="md" />
                <Link
                  href={`/tidning/${row.slug}`}
                  className="truncate font-medium text-[var(--ink)] hover:text-[var(--accent)]"
                >
                  {row.name}
                </Link>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-[var(--ink-subtle)] sm:hidden">Medelvärde</p>
                <p className="text-xl font-semibold tabular-nums" style={{ color }}>
                  {row.average ?? "—"}
                </p>
              </div>

              {showChangeColumn ? (
                <div className="sm:text-right">
                  <p className="text-xs text-[var(--ink-subtle)] sm:hidden">Förändring</p>
                  <p
                    className={`text-sm font-medium tabular-nums ${
                      row.change == null
                        ? "text-[var(--ink-subtle)]"
                        : row.change > 0
                          ? "text-[var(--accent)]"
                          : row.change < 0
                            ? "text-emerald-700"
                            : "text-[var(--ink-muted)]"
                    }`}
                  >
                    {formatChange(row.change)}
                  </p>
                </div>
              ) : null}

              <div className="sm:text-right">
                <p className="text-xs text-[var(--ink-subtle)] sm:hidden">Dagar i snitt</p>
                <p className="text-sm tabular-nums text-[var(--ink-muted)]">{row.observationCount}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
