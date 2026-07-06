export type HistoryPoint = {
  date: string;
  slug: string;
  name: string;
  dailyScore: number | null;
};

export type SingleSeriesPoint = {
  date: string;
  score: number;
  label: string;
};

export type ComparisonSeriesPoint = {
  date: string;
  [slug: string]: string | number | null;
};

export const MA_PERIODS = [
  { id: "week", label: "Vecka", window: 7 },
  { id: "month", label: "Månad", window: 30 },
  { id: "quarter", label: "Kvartal", window: 90 },
  { id: "year", label: "År", window: 365 },
] as const;

export type MaPeriodId = (typeof MA_PERIODS)[number]["id"];

export type MovingAverageSummary = {
  slug: string;
  name: string;
  average: number | null;
  change: number | null;
  observationCount: number;
};

export function getMaPeriod(id: MaPeriodId) {
  return MA_PERIODS.find((period) => period.id === id) ?? MA_PERIODS[0];
}

/** Glidande medelvärde över senaste `window` icke-null observationer. */
export function movingAverageNullable(
  values: (number | null)[],
  window: number,
): (number | null)[] {
  return values.map((_, i) => {
    const slice: number[] = [];
    for (let j = i; j >= 0 && slice.length < window; j--) {
      const value = values[j];
      if (value != null) slice.unshift(value);
    }
    if (slice.length === 0) return null;
    return Math.round(slice.reduce((sum, value) => sum + value, 0) / slice.length);
  });
}

function scoresBySlug(history: HistoryPoint[]): Map<string, { name: string; scores: number[] }> {
  const bySlug = new Map<string, { name: string; points: Array<{ date: string; score: number }> }>();

  for (const row of history) {
    if (!row.slug || row.dailyScore == null) continue;
    const existing = bySlug.get(row.slug) ?? { name: row.name, points: [] };
    existing.points.push({ date: row.date, score: row.dailyScore });
    bySlug.set(row.slug, existing);
  }

  const result = new Map<string, { name: string; scores: number[] }>();
  for (const [slug, entry] of bySlug) {
    entry.points.sort((a, b) => a.date.localeCompare(b.date));
    result.set(slug, {
      name: entry.name,
      scores: entry.points.map((point) => point.score),
    });
  }
  return result;
}

function rollingMeanAtEnd(scores: number[], window: number, endIndex: number): number | null {
  const slice: number[] = [];
  for (let j = endIndex; j >= 0 && slice.length < window; j--) {
    slice.unshift(scores[j]);
  }
  if (slice.length === 0) return null;
  return Math.round(slice.reduce((sum, value) => sum + value, 0) / slice.length);
}

/** Senaste medelvärde + förändring mot föregående fönster (samma längd). */
export function computeMovingAverageSummaries(
  history: HistoryPoint[],
  window: number,
): MovingAverageSummary[] {
  const bySlug = scoresBySlug(history);

  return [...bySlug.entries()]
    .map(([slug, entry]) => {
      const { scores, name } = entry;
      const endIndex = scores.length - 1;
      const average = endIndex >= 0 ? rollingMeanAtEnd(scores, window, endIndex) : null;

      const observationCount = Math.min(scores.length, window);
      let change: number | null = null;

      if (scores.length > window && average != null) {
        const previousEnd = endIndex - window;
        const previous = rollingMeanAtEnd(scores, window, previousEnd);
        if (previous != null) change = average - previous;
      }

      return { slug, name, average, change, observationCount };
    })
    .sort((a, b) => (b.average ?? -1) - (a.average ?? -1));
}

export function toComparisonMaSeries(
  history: HistoryPoint[],
  window: number,
): { data: ComparisonSeriesPoint[]; slugs: Array<{ slug: string; name: string }> } {
  const bySlug = scoresBySlug(history);
  const slugList = [...bySlug.entries()]
    .map(([slug, entry]) => ({ slug, name: entry.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "sv"));

  const dateSet = new Set<string>();
  for (const row of history) {
    if (row.date) dateSet.add(row.date);
  }
  const dates = [...dateSet].sort();

  const data: ComparisonSeriesPoint[] = dates.map((date) => {
    const row: ComparisonSeriesPoint = { date };
    for (const { slug } of slugList) {
      const entry = bySlug.get(slug);
      if (!entry) continue;

      const points = history
        .filter((item) => item.slug === slug && item.dailyScore != null)
        .sort((a, b) => a.date.localeCompare(b.date));

      const index = points.findIndex((item) => item.date === date);
      if (index === -1) continue;

      const scores = points.map((item) => item.dailyScore as number);
      row[slug] = movingAverageNullable(scores, window)[index];
    }
    return row;
  });

  return { data, slugs: slugList };
}

export function movingAverageKey(slug: string): string {
  return slug;
}

export function toSingleSeries(
  rows: Array<{ date: string; dailyScore: number | null }>,
): SingleSeriesPoint[] {
  return [...rows]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((row) => row.dailyScore != null)
    .map((row) => ({
      date: row.date,
      score: row.dailyScore as number,
      label: formatChartDate(row.date),
    }));
}

export function toComparisonSeries(
  rows: HistoryPoint[],
): { data: ComparisonSeriesPoint[]; slugs: Array<{ slug: string; name: string }> } {
  const slugs = new Map<string, string>();
  for (const row of rows) {
    if (row.slug) slugs.set(row.slug, row.name);
  }

  const byDate = new Map<string, ComparisonSeriesPoint>();

  for (const row of rows) {
    if (!row.slug || row.dailyScore == null) continue;
    const existing = byDate.get(row.date) ?? { date: row.date };
    existing[row.slug] = row.dailyScore;
    byDate.set(row.date, existing);
  }

  const data = [...byDate.values()].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );

  return {
    data,
    slugs: [...slugs.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "sv")),
  };
}

export function formatChartDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export function formatChartDateLong(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function maPeriodDescription(window: number): string {
  return `Senaste ${window} publicerade dagarna`;
}

/** Etikett för tabell/KPI: ett ögonblicksvärde, inte en tidsserie. */
export function maSnapshotLabel(window: number): string {
  return `Snitt, ${window} dagar`;
}

export type MaPeriodDataset = {
  summaries: MovingAverageSummary[];
  comparison: { data: ComparisonSeriesPoint[]; slugs: Array<{ slug: string; name: string }> };
};

export function computeAllMaPeriods(
  history: HistoryPoint[],
): Record<MaPeriodId, MaPeriodDataset> {
  const result = {} as Record<MaPeriodId, MaPeriodDataset>;

  for (const period of MA_PERIODS) {
    result[period.id] = {
      summaries: computeMovingAverageSummaries(history, period.window),
      comparison: toComparisonMaSeries(history, period.window),
    };
  }

  return result;
}

export type SingleMaPeriodDataset = {
  summary: MovingAverageSummary;
  series: SingleSeriesPoint[];
};

export function computeSingleNewspaperMaPeriods(
  slug: string,
  name: string,
  rows: Array<{ date: string; dailyScore: number | null }>,
): Record<MaPeriodId, SingleMaPeriodDataset> {
  const history: HistoryPoint[] = rows
    .filter((row) => row.dailyScore != null)
    .map((row) => ({
      date: row.date,
      slug,
      name,
      dailyScore: row.dailyScore,
    }));

  const sorted = [...rows]
    .filter((row) => row.dailyScore != null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const scores = sorted.map((row) => row.dailyScore as number);
  const result = {} as Record<MaPeriodId, SingleMaPeriodDataset>;

  for (const period of MA_PERIODS) {
    const summaries = computeMovingAverageSummaries(history, period.window);
    const summary = summaries[0] ?? {
      slug,
      name,
      average: null,
      change: null,
      observationCount: 0,
    };

    const maValues = movingAverageNullable(scores, period.window);
    const series: SingleSeriesPoint[] = sorted.flatMap((row, index) => {
      const score = maValues[index];
      if (score == null) return [];
      return [{ date: row.date, score, label: formatChartDate(row.date) }];
    });

    result[period.id] = { summary, series };
  }

  return result;
}
