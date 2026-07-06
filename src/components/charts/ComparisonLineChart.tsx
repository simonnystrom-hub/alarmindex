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
  type ComparisonSeriesPoint,
} from "@/lib/chart-data";
import { newspaperColor } from "@/lib/newspaper-colors";
import { useChartAxis } from "@/hooks/useChartAxis";

type ComparisonLineChartProps = {
  data: ComparisonSeriesPoint[];
  newspapers: Array<{ slug: string; name: string }>;
  dateLabel: string;
};

function ComparisonTooltip({
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

export function ComparisonLineChart({
  data,
  newspapers,
  dateLabel,
}: ComparisonLineChartProps) {
  const { minTickGap, tickFontSize } = useChartAxis();

  if (data.length < 2 || newspapers.length === 0) {
    return (
      <ChartFrame
        title="Jämförelse mellan tidningar"
        description="En linje per tidning."
        scoreTerm="alarmindex"
        showMethodologyLink={false}
        footnote="Grafen visas när minst två dagar med data från flera tidningar finns."
      >
        <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-[var(--ink-muted)]">
          Inte tillräckligt med historik ännu för en jämförelsegraf.
        </div>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame
      title="Jämförelse mellan tidningar"
      description="En linje per tidning."
      scoreTerm="alarmindex"
      showMethodologyLink={false}
      footnote={`Sedan start · uppdaterad ${dateLabel}.`}
    >
      <div className="mb-4">
        <NewspaperLegend newspapers={newspapers} />
      </div>
      <div className="h-64 w-full min-w-0 sm:h-80">
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
            <Tooltip content={<ComparisonTooltip newspapers={newspapers} />} />
            {newspapers.map((paper) => (
              <Line
                key={paper.slug}
                type="monotone"
                dataKey={paper.slug}
                name={paper.slug}
                stroke={newspaperColor(paper.slug)}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: newspaperColor(paper.slug), strokeWidth: 0 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
