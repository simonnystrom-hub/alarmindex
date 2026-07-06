import { computeAllMaPeriods, type HistoryPoint } from "@/lib/chart-data";
import { MovingAverageSectionClient } from "./MovingAverageSectionClient";

type MovingAverageSectionProps = {
  history: HistoryPoint[];
  dateLabel: string;
  showComparisonChart?: boolean;
  highlightSlug?: string;
};

export function MovingAverageSection({
  history,
  dateLabel,
  showComparisonChart = false,
  highlightSlug,
}: MovingAverageSectionProps) {
  const periodData = computeAllMaPeriods(history);

  return (
    <MovingAverageSectionClient
      periodData={periodData}
      dateLabel={dateLabel}
      showComparisonChart={showComparisonChart}
      highlightSlug={highlightSlug}
    />
  );
}
