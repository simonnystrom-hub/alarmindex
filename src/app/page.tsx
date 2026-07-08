import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { AssessArticleHomeSection } from "@/components/AssessArticleHomeSection";
import { ChartSkeleton } from "@/components/charts/ChartSkeleton";
import { MovingAverageSection } from "@/components/charts/MovingAverageSection";
import { HomeIntro } from "@/components/HomeIntro";
import { HomeSectionNav } from "@/components/HomeSectionNav";
import { SourceArticleCards } from "@/components/SourceArticleCards";
import { TodayOverview } from "@/components/TodayOverview";
import { PageHeader } from "@/components/PageHeader";
import { toComparisonSeries } from "@/lib/chart-data";
import {
  getDailyEditionsWithHeadlines,
  getIndexHistory,
  getLatestPublishedDate,
  getSiteSettings,
} from "@/lib/sanity/queries";
import { buildPageMetadata } from "@/lib/site-settings";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildPageMetadata(settings, "home");
}

const ComparisonLineChart = dynamic(
  () =>
    import("@/components/charts/ComparisonLineChart").then((module) => module.ComparisonLineChart),
  {
    loading: () => (
      <ChartSkeleton title="Jämförelse mellan tidningar" description="En linje per tidning." />
    ),
  },
);

export default async function HomePage() {
  const date =
    (await getLatestPublishedDate()) ?? new Date().toISOString().slice(0, 10);
  const [editions, history] = await Promise.all([
    getDailyEditionsWithHeadlines(date),
    getIndexHistory(400),
  ]);
  const { data: comparisonData, slugs: newspapers } = toComparisonSeries(history);

  return (
    <div className="space-y-10 sm:space-y-12">
      <PageHeader
        eyebrow="Daglig mätning"
        title="Alarmindex — formspråk i svenska nyhetsrubriker"
        description="Varje tidning har en egen summeringssida med historik, grafer och besökarbedömningar. Klicka på tidningens namn i listan nedan för att följa den över tid."
      >
        <div className="flex flex-wrap gap-3 pt-2 text-sm">
          <Link
            href="/metodik"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]"
          >
            Så funkar metoden
          </Link>
          <a
            href="#dagens-lage"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-4 py-2 text-[var(--surface)] hover:opacity-90"
          >
            Se dagens index
          </a>
        </div>
      </PageHeader>

      <HomeSectionNav />

      <div className="space-y-6">
        <HomeIntro />
        <SourceArticleCards />
      </div>

      <TodayOverview editions={editions} date={date} />

      <ComparisonLineChart
        data={comparisonData}
        newspapers={newspapers}
        dateLabel={date}
      />

      <MovingAverageSection history={history} dateLabel={date} showComparisonChart />

      <AssessArticleHomeSection />
    </div>
  );
}
