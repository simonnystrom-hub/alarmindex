import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { NewspaperMovingAverageSection } from "@/components/charts/NewspaperMovingAverageSection";
import { PageHeader } from "@/components/PageHeader";
import { ScoreBar } from "@/components/ScoreBar";
import { toSingleSeries } from "@/lib/chart-data";
import { getNewspaperBySlug, getNewspaperHistory } from "@/lib/sanity/queries";

export const revalidate = 3600;

const DailyScoreLineChart = dynamic(
  () =>
    import("@/components/charts/DailyScoreLineChart").then((module) => module.DailyScoreLineChart),
  {
    loading: () => <ChartSkeleton title="Dagligt formspråksindex" />,
  },
);

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const newspaper = await getNewspaperBySlug(slug);

  if (!newspaper) {
    return { title: "Saknas — Alarmindex" };
  }

  return {
    title: `${newspaper.name} — Alarmindex`,
    description: `Tidsserie och historik för alarmindex i ${newspaper.name}s rubriker och löpsedlar.`,
  };
}

export default async function NewspaperPage({ params }: PageProps) {
  const { slug } = await params;
  const newspaper = await getNewspaperBySlug(slug);
  if (!newspaper) notFound();

  const history = await getNewspaperHistory(slug, 400);
  const chartData = toSingleSeries(history);
  const latestDate = history[0]?.date ?? new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-10">
      <PageHeader
        backHref="/"
        backLabel="Dagens index"
        title={newspaper.name}
        description="Tidsserie för daglig formspråksintensitet i rubriker — baserat på mobil exponering."
      />

      <DailyScoreLineChart
        newspaperName={newspaper.name}
        slug={slug}
        data={chartData}
      />

      <NewspaperMovingAverageSection
        slug={slug}
        name={newspaper.name}
        history={history}
        dateLabel={latestDate}
      />

      {history.length === 0 ? (
        <p className="text-[var(--ink-muted)]">Ingen publicerad historik ännu.</p>
      ) : (
        <section>
          <h2 className="font-serif text-2xl font-semibold text-[var(--ink)]">
            Dag för dag
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Klicka på en rad för att se alla rubriker och poäng den dagen.
          </p>
          <div className="mt-4 space-y-2">
            {history.map((day) => (
              <Link
                key={day._id}
                href={`/dag/${day.date}/${slug}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] hover:border-[var(--ink-subtle)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--ink)]">{day.date}</p>
                    {day.drivingHeadline?.text ? (
                      <p className="mt-1 truncate text-sm text-[var(--ink-muted)]">
                        {day.drivingHeadline.text}
                      </p>
                    ) : null}
                  </div>
                  <div className="w-full sm:w-48">
                    <ScoreBar score={day.dailyScore ?? 0} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
