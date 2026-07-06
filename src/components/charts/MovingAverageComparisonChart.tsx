"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NewspaperLegend, NewspaperSwatch } from "@/components/NewspaperSwatch";
import { ChartFrame } from "./ChartFrame";
import {
  formatChartDate,
  formatChartDateLong,
  maPeriodDescription,
  type ComparisonSeriesPoint,
} from "@/lib/chart-data";
import { newspaperColor } from "@/lib/newspaper-colors";
import { useChartAxis } from "@/hooks/useChartAxis";

type MovingAverageComparisonChartProps = {
  data: ComparisonSeriesPoint[];
  newspapers: Array<{ slug: string; name: string }>;
  window: number;
  periodLabel: string;
  dateLabel: string;
  highlightSlug?: string;
  embedded?: boolean;
};

function MaComparisonTooltip({
  active,
  payload,
  label,
  newspapers,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
  newspapers: Array<{ slug: string; name: string }>;
}) {
  if (!active || !payload?.length || !label) return null;

  const nameBySlug = new Map(newspapers.map((n) => [n.slug, n.name]));

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-[var(--ink)]">{formatChartDateLong(String(label))}</p>
      <ul className="mt-2 space-y-2">
        {payload
          .filter((item) => item.value != null)
          .sort((a, b) => b.value - a.value)
          .map((item) => (
            <li key={item.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[var(--ink-muted)]">
                <NewspaperSwatch slug={item.dataKey} size="sm" />
                {nameBySlug.get(item.dataKey) ?? item.dataKey}
              </span>
              <span className="font-semibold tabular-nums text-[var(--ink)]">{item.value}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export function MovingAverageComparisonChart({
  data,
  newspapers,
  window,
  periodLabel,
  dateLabel,
  highlightSlug,
  embedded = false,
}: MovingAverageComparisonChartProps) {
  const { minTickGap, tickFontSize } = useChartAxis();

  if (data.length < 2 || newspapers.length === 0) {
    const empty = (
      <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-[var(--ink-muted)]">
        Inte tillräckligt med historik för denna period.
      </div>
    );
    if (embedded) {
      return (
        <div className="px-5 py-4 sm:px-6">
          <h3 className="mb-3 text-sm font-medium text-[var(--ink-muted)]">Trendgraf</h3>
          {empty}
        </div>
      );
    }
    return (
      <ChartFrame
        title={`Glidande medelvärde — ${periodLabel.toLowerCase()}`}
        description="Jämförelse av utjämnade index över tid."
        footnote="Kräver minst två dagar med data."
      >
        {empty}
      </ChartFrame>
    );
  }

  const chart = (
    <div className="h-64 w-full min-w-0 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatChartDate}
            tick={{ fill: "var(--ink-subtle)", fontSize: tickFontSize }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            minTickGap={minTickGap}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={{ fill: "var(--ink-subtle)", fontSize: tickFontSize }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<MaComparisonTooltip newspapers={newspapers} />} />
          {newspapers.map((paper) => {
            const color = newspaperColor(paper.slug);
            const dimmed = highlightSlug && highlightSlug !== paper.slug;
            return (
              <Line
                key={paper.slug}
                type="monotone"
                dataKey={paper.slug}
                name={paper.slug}
                stroke={color}
                strokeWidth={highlightSlug === paper.slug ? 3 : 2.5}
                strokeOpacity={dimmed ? 0.22 : 1}
                dot={false}
                activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const legend = (
    <NewspaperLegend newspapers={newspapers} highlightSlug={highlightSlug} />
  );

  if (embedded) {
    return (
      <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h3 className="text-sm font-medium text-[var(--ink)]">Trendgraf</h3>
          <p className="mt-1 text-xs text-[var(--ink-subtle)]">
            {maPeriodDescription(window)} · senast {dateLabel}
          </p>
        </div>
        {legend}
        {chart}
      </div>
    );
  }

  return (
    <ChartFrame
      title={`Glidande medelvärde — ${periodLabel.toLowerCase()}`}
      description={`${maPeriodDescription(window)}. Linjerna visar hur det glidande medelvärdet utvecklats.`}
      footnote={`Senast uppdaterad ${dateLabel}.`}
    >
      <div className="space-y-4">
        {legend}
        {chart}
      </div>
    </ChartFrame>
  );
}
