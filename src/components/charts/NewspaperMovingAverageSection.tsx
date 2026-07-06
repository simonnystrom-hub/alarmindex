import { computeSingleNewspaperMaPeriods } from "@/lib/chart-data";
import type { DailyEdition } from "@/lib/sanity/types";
import { NewspaperMovingAverageSectionClient } from "./NewspaperMovingAverageSectionClient";

type NewspaperMovingAverageSectionProps = {
  slug: string;
  name: string;
  history: DailyEdition[];
  dateLabel: string;
};

export function NewspaperMovingAverageSection({
  slug,
  name,
  history,
  dateLabel,
}: NewspaperMovingAverageSectionProps) {
  const periodData = computeSingleNewspaperMaPeriods(
    slug,
    name,
    history.map((day) => ({ date: day.date, dailyScore: day.dailyScore })),
  );

  return (
    <NewspaperMovingAverageSectionClient
      slug={slug}
      name={name}
      periodData={periodData}
      dateLabel={dateLabel}
    />
  );
}
