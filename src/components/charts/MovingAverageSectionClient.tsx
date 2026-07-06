"use client";

import { useState } from "react";
import {
  getMaPeriod,
  maSnapshotLabel,
  MA_PERIODS,
  type MaPeriodDataset,
  type MaPeriodId,
} from "@/lib/chart-data";
import { MovingAverageComparisonChart } from "./MovingAverageComparisonChart";
import { MovingAverageTable } from "./MovingAverageTable";

type MovingAverageSectionClientProps = {
  periodData: Record<MaPeriodId, MaPeriodDataset>;
  dateLabel: string;
  showComparisonChart?: boolean;
  highlightSlug?: string;
};

export function MovingAverageSectionClient({
  periodData,
  dateLabel,
  showComparisonChart = false,
  highlightSlug,
}: MovingAverageSectionClientProps) {
  const [periodId, setPeriodId] = useState<MaPeriodId>("week");
  const period = getMaPeriod(periodId);
  const { summaries, comparison } = periodData[periodId];
  const legendNewspapers = summaries.map((row) => ({ slug: row.slug, name: row.name }));

  return (
    <section
      id="medelvarden"
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
    >
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 sm:px-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">
          Medelvärden
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--ink-muted)]">
          Tabellen visar {maSnapshotLabel(period.window).toLowerCase()} per tidning — snittet av
          dagspoäng idag. Grafen nedan visar hur det glidande medelvärdet utvecklats över tid.
          Förändring jämför med föregående fönster av samma längd.
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

      <MovingAverageTable rows={summaries} window={period.window} highlightSlug={highlightSlug} />

      {showComparisonChart ? (
        <div className="border-t border-[var(--border)] bg-[var(--surface-muted)]/40">
          <MovingAverageComparisonChart
            data={comparison.data}
            newspapers={legendNewspapers}
            window={period.window}
            periodLabel={period.label}
            dateLabel={dateLabel}
            highlightSlug={highlightSlug}
            embedded
          />
        </div>
      ) : null}
    </section>
  );
}
