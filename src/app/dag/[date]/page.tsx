import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ScoreBar } from "@/components/ScoreBar";
import { describeAlarmIndex, getAlarmLevel } from "@/lib/alarm-levels";
import { newspaperColor } from "@/lib/newspaper-colors";
import { getDailyEditions } from "@/lib/sanity/queries";

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

export default async function DayPage({ params }: PageProps) {
  const { date } = await params;
  const editions = await getDailyEditions(date);
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
              </li>
              <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
                  Högst
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{highest.newspaper.name}</p>
                <p
                  className="mt-1 text-3xl font-semibold tabular-nums"
                  style={{ color: newspaperColor(highest.newspaper.slug) }}
                >
                  {highest.dailyScore ?? 0}
                </p>
              </li>
              <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
                  Lägst
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{lowest.newspaper.name}</p>
                <p
                  className="mt-1 text-3xl font-semibold tabular-nums"
                  style={{ color: newspaperColor(lowest.newspaper.slug) }}
                >
                  {lowest.dailyScore ?? 0}
                </p>
              </li>
              <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
                  Spridning
                </p>
                <p className="mt-2 text-4xl font-semibold tabular-nums text-[var(--ink)]">
                  {spread}
                </p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">poäng mellan högsta och lägsta</p>
              </li>
            </ul>
          ) : null}

          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            {ranked.map((row) => (
              <div key={row.newspaper._id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/dag/${date}/${row.newspaper.slug}`}
                      className="text-lg font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
                      style={{
                        borderBottom: `2px solid ${newspaperColor(row.newspaper.slug)}`,
                      }}
                    >
                      {row.newspaper.name}
                    </Link>
                    {row.drivingHeadline?.text ? (
                      <p className="mt-1 text-sm text-[var(--ink-muted)]">
                        {row.drivingHeadline.text}
                      </p>
                    ) : null}
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
