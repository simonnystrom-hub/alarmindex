import Link from "next/link";
import type { DayEditionHeadline } from "@/lib/sanity/types";
import { newspaperColor } from "@/lib/newspaper-colors";

function sortHeadlines(headlines: DayEditionHeadline[]): DayEditionHeadline[] {
  return [...headlines].sort((a, b) => (b.displayScore ?? 0) - (a.displayScore ?? 0));
}

type DayEditionHeadlineListProps = {
  slug: string;
  date: string;
  headlines: DayEditionHeadline[];
  drivingHeadlineId?: string | null;
};

export function DayEditionHeadlineList({
  slug,
  date,
  headlines,
  drivingHeadlineId,
}: DayEditionHeadlineListProps) {
  if (headlines.length === 0) return null;

  const color = newspaperColor(slug);
  const sorted = sortHeadlines(headlines);

  return (
    <div className="mt-3 min-w-0">
      <ul
        className="space-y-1 border-l-2 pl-3"
        style={{ borderColor: `${color}55` }}
        aria-label={`${sorted.length} bedömda rubriker`}
      >
        {sorted.map((headline) => {
          const isDriving = drivingHeadlineId != null && headline._id === drivingHeadlineId;

          return (
            <li
              key={headline._id}
              className={`flex min-w-0 items-baseline gap-2 text-sm leading-snug ${
                isDriving ? "text-[var(--ink)]" : "text-[var(--ink-muted)]"
              }`}
            >
              <span
                className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums"
                style={{ color }}
              >
                {headline.displayScore ?? "—"}
              </span>
              <span className="min-w-0 flex-1">
                <span className={isDriving ? "font-medium" : undefined}>{headline.text}</span>
                {isDriving ? (
                  <span className="ml-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--accent)]">
                    drivande
                  </span>
                ) : null}
                {headline.aboveFoldMobile ? (
                  <span className="sr-only">Synlig utan scroll</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs">
        <Link
          href={`/dag/${date}/${slug}`}
          className="font-medium text-[var(--accent)] hover:underline"
        >
          Poäng och motivering →
        </Link>
      </p>
    </div>
  );
}
