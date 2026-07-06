import Link from "next/link";
import { AlarmIndexScale } from "./AlarmIndexScale";
import { NewspaperSwatch } from "./NewspaperSwatch";
import { ScoreBar, ScoreBadge } from "./ScoreBar";
import { describeAlarmIndex, getAlarmLevel } from "@/lib/alarm-levels";
import { newspaperColor, newspaperColorSoft } from "@/lib/newspaper-colors";
import type { DailyEdition } from "@/lib/sanity/types";

type TodayOverviewProps = {
  editions: DailyEdition[];
  date: string;
};

function sortByScore(editions: DailyEdition[]) {
  return [...editions].sort((a, b) => (b.dailyScore ?? 0) - (a.dailyScore ?? 0));
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function TodayOverview({ editions, date }: TodayOverviewProps) {
  if (editions.length === 0) {
    return (
      <section
        className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center text-sm text-[var(--ink-muted)]"
        aria-labelledby="dagens-lage-heading"
      >
        <h2 id="dagens-lage-heading" className="font-serif text-xl font-semibold text-[var(--ink)]">
          Dagens läge
        </h2>
        <p className="mt-2">Ingen publicerad data för {date} ännu.</p>
      </section>
    );
  }

  const ranked = sortByScore(editions);
  const scores = ranked.map((e) => e.dailyScore ?? 0);
  const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];
  const spread = (highest.dailyScore ?? 0) - (lowest.dailyScore ?? 0);
  const averageLevel = getAlarmLevel(average);

  return (
    <section className="space-y-4" aria-labelledby="dagens-lage-heading">
      <header>
        <h2 id="dagens-lage-heading" className="font-serif text-xl font-semibold text-[var(--ink)]">
          Dagens läge
        </h2>
        <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{date}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
            Snitt idag
          </p>
          <p
            className="mt-2 text-4xl font-semibold tabular-nums"
            style={{ color: averageLevel.color }}
          >
            {average}
          </p>
          <p className="mt-1 text-sm font-medium text-[var(--ink)]">{averageLevel.label}</p>
          <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{averageLevel.summary}</p>
          <p className="mt-2 text-xs text-[var(--ink-subtle)]">{editions.length} tidningar</p>
        </li>

        <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
            Högst idag
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <NewspaperSwatch slug={highest.newspaper.slug} size="md" />
            <Link
              href={`/tidning/${highest.newspaper.slug}`}
              className="font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
            >
              {highest.newspaper.name}
            </Link>
            <ScoreBadge score={highest.dailyScore ?? 0} />
          </div>
          {highest.drivingHeadline?.text ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--ink-muted)]">
              &ldquo;{highest.drivingHeadline.text}&rdquo;
            </p>
          ) : null}
        </li>

        <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
            Lägst idag
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <NewspaperSwatch slug={lowest.newspaper.slug} size="md" />
            <Link
              href={`/tidning/${lowest.newspaper.slug}`}
              className="font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
            >
              {lowest.newspaper.name}
            </Link>
            <ScoreBadge score={lowest.dailyScore ?? 0} />
          </div>
        </li>

        <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
            Spridning
          </p>
          <p className="mt-2 text-4xl font-semibold tabular-nums text-[var(--ink)]">{spread}</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">Mellan högsta och lägsta</p>
        </li>
      </ul>

      <details className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[var(--ink)]">
              Vad betyder alarmindex?
            </h3>
            <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
              Dagens snitt ({average}) tolkas som {describeAlarmIndex(average).toLowerCase()}
            </p>
          </div>
          <ChevronIcon className="h-5 w-5 shrink-0 text-[var(--ink-subtle)] transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-[var(--border)] px-5 py-5 sm:px-6">
          <AlarmIndexScale highlightScore={average} compact showMethodLink />
        </div>
      </details>

      <details className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[var(--ink)]">
              Alla tidningar idag
            </h3>
            <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
              Sorterat efter alarmindex · {editions.length} tidningar
            </p>
          </div>
          <ChevronIcon className="h-5 w-5 shrink-0 text-[var(--ink-subtle)] transition-transform group-open:rotate-180" />
        </summary>

        <div className="border-t border-[var(--border)] px-5 py-5 sm:px-6">
          <ol className="grid gap-3">
            {ranked.map((edition, index) => (
              <li
                key={edition._id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                        style={{
                          backgroundColor: newspaperColorSoft(edition.newspaper.slug),
                          color: newspaperColor(edition.newspaper.slug),
                        }}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <NewspaperSwatch slug={edition.newspaper.slug} size="md" />
                          <Link
                            href={`/tidning/${edition.newspaper.slug}`}
                            className="text-lg font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
                          >
                            {edition.newspaper.name}
                          </Link>
                          <ScoreBadge score={edition.dailyScore ?? 0} />
                        </div>
                        {edition.drivingHeadline?.text ? (
                          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                            Drivande rubrik: &ldquo;{edition.drivingHeadline.text}&rdquo;
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-44">
                    <ScoreBar
                      score={edition.dailyScore ?? 0}
                      accentColor={newspaperColor(edition.newspaper.slug)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <Link
                    href={`/dag/${date}/${edition.newspaper.slug}`}
                    className="font-medium text-[var(--accent)] hover:underline"
                  >
                    Alla rubriker →
                  </Link>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-right text-sm">
            <Link
              href={`/dag/${date}`}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Visa alla rubriker för {date} →
            </Link>
          </p>
        </div>
      </details>
    </section>
  );
}
