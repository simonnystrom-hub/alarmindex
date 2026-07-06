import type { Metadata } from "next";
import Link from "next/link";
import { AlarmIndexScale } from "@/components/AlarmIndexScale";
import { DayEditionHeadlineList } from "@/components/DayEditionHeadlineList";
import { NewspaperSwatch } from "@/components/NewspaperSwatch";
import { PageHeader } from "@/components/PageHeader";
import { ScoreBar, ScoreBadge } from "@/components/ScoreBar";
import { describeAlarmIndex, getAlarmLevel } from "@/lib/alarm-levels";
import { newspaperColor, newspaperColorSoft } from "@/lib/newspaper-colors";
import { getDailyEditions, getDailyEditionsWithHeadlines } from "@/lib/sanity/queries";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  const editions = await getDailyEditions(date);

  if (editions.length === 0) {
    return {
      title: `${date} — Alarmindex`,
      description: `Ingen publicerad data för ${date}.`,
    };
  }

  const scores = editions.map((e) => e.dailyScore ?? 0);
  const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const level = getAlarmLevel(average);

  return {
    title: `Index ${date} — Alarmindex`,
    description: `${editions.length} tidningar · snitt ${average} (${level.label}). ${describeAlarmIndex(average)}`,
  };
}

function NewspaperDayLink({
  date,
  slug,
  name,
  className = "text-lg font-semibold hover:opacity-80",
}: {
  date: string;
  slug: string;
  name: string;
  className?: string;
}) {
  const color = newspaperColor(slug);

  return (
    <Link
      href={`/dag/${date}/${slug}`}
      className={className}
      style={{ color }}
    >
      {name}
    </Link>
  );
}

export default async function DayPage({ params }: PageProps) {
  const { date } = await params;
  const editions = await getDailyEditionsWithHeadlines(date);
  const ranked = [...editions].sort((a, b) => (b.dailyScore ?? 0) - (a.dailyScore ?? 0));

  const scores = ranked.map((e) => e.dailyScore ?? 0);
  const average =
    scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null;
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];
  const spread =
    highest && lowest ? (highest.dailyScore ?? 0) - (lowest.dailyScore ?? 0) : null;
  const averageLevel = average != null ? getAlarmLevel(average) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/dag"
        backLabel="Alla dagar"
        title={`Index ${date}`}
        description="Alla tidningar för vald dag, sorterade efter dagspoäng."
      />

      {ranked.length === 0 ? (
        <p className="text-[var(--ink-muted)]">Ingen publicerad data för detta datum.</p>
      ) : (
        <>
          {averageLevel != null && average != null && spread != null && highest && lowest ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
                  Snitt
                </p>
                <p
                  className="mt-2 text-4xl font-semibold tabular-nums"
                  style={{ color: averageLevel.color }}
                >
                  {average}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--ink)]">{averageLevel.label}</p>
                <p className="mt-0.5 text-sm text-[var(--ink-muted)]">{averageLevel.summary}</p>
                <p className="mt-2 text-xs text-[var(--ink-subtle)]">
                  Medel av {ranked.length} tidningars dagspoäng
                </p>
              </li>

              <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
                  Högst
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <NewspaperSwatch slug={highest.newspaper.slug} size="md" />
                  <NewspaperDayLink
                    date={date}
                    slug={highest.newspaper.slug}
                    name={highest.newspaper.name}
                    className="font-semibold hover:opacity-80"
                  />
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
                  Lägst
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <NewspaperSwatch slug={lowest.newspaper.slug} size="md" />
                  <NewspaperDayLink
                    date={date}
                    slug={lowest.newspaper.slug}
                    name={lowest.newspaper.name}
                    className="font-semibold hover:opacity-80"
                  />
                  <ScoreBadge score={lowest.dailyScore ?? 0} />
                </div>
              </li>

              <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
                  Spridning
                </p>
                <p className="mt-2 text-4xl font-semibold tabular-nums text-[var(--ink)]">
                  {spread}
                </p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">Mellan högsta och lägsta</p>
              </li>
            </ul>
          ) : null}

          {average != null ? (
            <details className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">
                    Vad betyder snittet?
                  </h2>
                  <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
                    {average} tolkas som {describeAlarmIndex(average).toLowerCase()}
                  </p>
                </div>
                <span
                  className="text-[var(--ink-subtle)] transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  ▾
                </span>
              </summary>
              <div className="border-t border-[var(--border)] px-5 py-5 sm:px-6">
                <AlarmIndexScale highlightScore={average} compact showMethodLink />
              </div>
            </details>
          ) : null}

          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            {ranked.map((row, index) => (
              <div key={row.newspaper._id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
                        style={{
                          backgroundColor: newspaperColorSoft(row.newspaper.slug),
                          color: newspaperColor(row.newspaper.slug),
                        }}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <NewspaperSwatch slug={row.newspaper.slug} size="md" />
                          <NewspaperDayLink
                            date={date}
                            slug={row.newspaper.slug}
                            name={row.newspaper.name}
                          />
                          <ScoreBadge score={row.dailyScore ?? 0} />
                        </div>
                        {row.headlines && row.headlines.length > 0 ? (
                          <DayEditionHeadlineList
                            slug={row.newspaper.slug}
                            date={date}
                            headlines={row.headlines}
                            drivingHeadlineId={row.drivingHeadline?._id}
                          />
                        ) : row.drivingHeadline?.text ? (
                          <p className="mt-1 text-sm text-[var(--ink-muted)]">
                            {row.drivingHeadline.text}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <ScoreBar
                      score={row.dailyScore ?? 0}
                      accentColor={newspaperColor(row.newspaper.slug)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
