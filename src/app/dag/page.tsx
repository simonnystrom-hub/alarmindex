import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { NewspaperSwatch } from "@/components/NewspaperSwatch";
import { getPublishedDaySummaries, getSiteSettings } from "@/lib/sanity/queries";
import { buildPageMetadata } from "@/lib/site-settings";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildPageMetadata(settings, "dag");
}

function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DayIndexPage() {
  const days = await getPublishedDaySummaries();

  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/"
        backLabel="Startsida"
        title="Alla dagar"
        description="Bläddra bland publicerade dagliga index. Välj en dag för att se alla tidningar och deras alarmindex."
      />

      {days.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center text-[var(--ink-muted)]">
          <p>Inga publicerade dagar ännu.</p>
          <p className="mt-2 text-sm">Kom tillbaka efter nästa dagliga insamling.</p>
        </div>
      ) : (
        <ol className="grid gap-3">
          {days.map((day) => (
            <li key={day.date}>
              <Link
                href={`/dag/${day.date}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] transition hover:border-[var(--ink-subtle)] sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-serif text-lg font-semibold capitalize text-[var(--ink)]">
                      {formatDayLabel(day.date)}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--ink-subtle)]">{day.date}</p>
                    <p className="mt-2 text-sm text-[var(--ink-muted)]">
                      {day.newspaperCount} tidningar · snitt {day.averageScore}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-[var(--ink-subtle)]">Högst</p>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        <NewspaperSwatch slug={day.highest.slug} size="sm" />
                        <span className="text-sm font-medium text-[var(--ink)]">
                          {day.highest.name}
                        </span>
                        <span className="rounded-lg bg-[var(--accent-soft)] px-2 py-0.5 text-sm font-semibold tabular-nums text-[var(--accent)]">
                          {day.highest.score}
                        </span>
                      </div>
                    </div>
                    <span className="hidden text-[var(--ink-subtle)] sm:inline" aria-hidden="true">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
