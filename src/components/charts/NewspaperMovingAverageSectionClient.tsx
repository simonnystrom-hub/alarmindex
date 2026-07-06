"use client";

import { useState } from "react";
import { NewspaperSwatch } from "@/components/NewspaperSwatch";
import {
  getMaPeriod,
  maPeriodDescription,
  MA_PERIODS,
  type MaPeriodId,
  type SingleMaPeriodDataset,
} from "@/lib/chart-data";
import { newspaperColor } from "@/lib/newspaper-colors";
import { SingleMaLineChart } from "./SingleMaLineChart";

type NewspaperMovingAverageSectionClientProps = {
  slug: string;
  name: string;
  periodData: Record<MaPeriodId, SingleMaPeriodDataset>;
  dateLabel: string;
};

function formatChange(change: number | null): string {
  if (change == null) return "—";
  return `${change > 0 ? "+" : ""}${change}`;
}

export function NewspaperMovingAverageSectionClient({
  slug,
  name,
  periodData,
  dateLabel,
}: NewspaperMovingAverageSectionClientProps) {
  const [periodId, setPeriodId] = useState<MaPeriodId>("week");
  const period = getMaPeriod(periodId);
  const { summary, series } = periodData[periodId];
  const color = newspaperColor(slug);
  const showChange = summary.change != null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 sm:px-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">
          Glidande medelvärden
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--ink-muted)]">
          {maPeriodDescription(period.window)} för {name}. Trendgrafen visar hur medelvärdet
          utvecklats.
          {showChange
            ? " Förändring jämför med föregående fönster av samma längd."
            : null}
        </p>

        <div
          className="mt-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Välj tidsperiod för glidande medelvärde"
        >
          {MA_PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={periodId === item.id}
              onClick={() => setPeriodId(item.id)}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition ${
                periodId === item.id
                  ? "bg-[var(--ink)] text-[var(--surface)]"
                  : "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 border-b border-[var(--border)] p-5 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
            Medelvärde
          </p>
          <div className="mt-2 flex items-center gap-2">
            <NewspaperSwatch slug={slug} size="md" />
            <p className="text-3xl font-semibold tabular-nums" style={{ color }}>
              {summary.average ?? "—"}
            </p>
          </div>
        </div>

        {showChange ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
              Förändring
            </p>
            <p
              className={`mt-2 text-3xl font-semibold tabular-nums ${
                summary.change == null
                  ? "text-[var(--ink-subtle)]"
                  : summary.change > 0
                    ? "text-[var(--accent)]"
                    : summary.change < 0
                      ? "text-emerald-700"
                      : "text-[var(--ink-muted)]"
              }`}
            >
              {formatChange(summary.change)}
            </p>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
            Dagar i snitt
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--ink)]">
            {summary.observationCount}
          </p>
        </div>
      </div>

      <div className="space-y-3 bg-[var(--surface-muted)]/40 px-5 py-5 sm:px-6">
        <p className="text-sm font-medium text-[var(--ink)]">Trend</p>
        <p className="text-xs text-[var(--ink-subtle)]">
          Glidande medelvärde · {period.label.toLowerCase()} · senast {dateLabel}
        </p>
        <SingleMaLineChart slug={slug} data={series} />
      </div>
    </section>
  );
}
