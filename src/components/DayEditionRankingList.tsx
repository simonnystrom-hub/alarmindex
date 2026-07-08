import Link from "next/link";
import { DayEditionHeadlineList } from "@/components/DayEditionHeadlineList";
import { NewspaperSwatch } from "@/components/NewspaperSwatch";
import { ScoreBar, ScoreBadge } from "@/components/ScoreBar";
import { newspaperColor, newspaperColorSoft } from "@/lib/newspaper-colors";
import { OFFICIAL_DAILY_SCORE_LABEL } from "@/lib/score-labels";
import type { DailyEdition } from "@/lib/sanity/types";

export function NewspaperDayLink({
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
  return (
    <Link
      href={`/dag/${date}/${slug}`}
      className={className}
      style={{ color: newspaperColor(slug) }}
    >
      {name}
    </Link>
  );
}

type DayEditionRankingListProps = {
  ranked: DailyEdition[];
  date: string;
  footerLink?: { href: string; label: string };
};

export function DayEditionRankingList({ ranked, date, footerLink }: DayEditionRankingListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <div className="divide-y divide-[var(--border)]">
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
                  label={OFFICIAL_DAILY_SCORE_LABEL}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {footerLink ? (
        <p className="border-t border-[var(--border)] px-5 py-4 text-right text-sm sm:px-6">
          <Link href={footerLink.href} className="font-medium text-[var(--accent)] hover:underline">
            {footerLink.label}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
