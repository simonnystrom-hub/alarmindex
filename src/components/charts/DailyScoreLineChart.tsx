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
import { ChartFrame } from "./ChartFrame";
import { formatChartDate, formatChartDateLong, type SingleSeriesPoint } from "@/lib/chart-data";
import { newspaperColor } from "@/lib/newspaper-colors";
import { useChartAxis } from "@/hooks/useChartAxis";

type DailyScoreLineChartProps = {
  newspaperName: string;
  slug: string;
  data: SingleSeriesPoint[];
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SingleSeriesPoint }>;
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-[var(--ink)]">{formatChartDateLong(point.date)}</p>
      <p className="mt-1 tabular-nums text-[var(--ink-muted)]">
        Dagspoäng: <span className="font-semibold text-[var(--ink)]">{point.score}</span>
      </p>
    </div>
  );
}

export function DailyScoreLineChart({
  newspaperName,
  slug,
  data,
}: DailyScoreLineChartProps) {
  const color = newspaperColor(slug);
  const { minTickGap, tickFontSize } = useChartAxis();

  if (data.length < 2) {
    return (
      <ChartFrame
        title={`Dagligt formspråksindex — ${newspaperName}`}
        description="Linjen visar tidningens dagspoäng över tid. Varje punkt är ett publicerat index för en dag."
        footnote="Grafen visas när minst två dagar med publicerad data finns."
      >
        <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm text-[var(--ink-muted)]">
          För få dagar ännu — kom tillbaka efter fler dagliga körningar.
        </div>
      </ChartFrame>
    );
  }

  const latest = data[data.length - 1]?.score;
  const earliest = data[0]?.score;
  const delta = latest != null && earliest != null ? latest - earliest : null;

  return (
    <ChartFrame
      title={`Dagligt formspråksindex — ${newspaperName}`}
      description="Linjen visar hur intensivt formspråket i rubrikerna varit per dag, baserat på mobil exponering. Högre värde betyder mer känslomässigt laddade rubriker — inte att nyheterna är viktigare eller mer sanna."
      footnote={
        delta != null
          ? `Förändring sedan ${formatChartDateLong(data[0].date)}: ${delta > 0 ? "+" : ""}${delta} poäng.`
          : undefined
      }
    >
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
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}
