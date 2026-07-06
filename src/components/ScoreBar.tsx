import { alarmLevelColor } from "@/lib/alarm-levels";

type ScoreBarProps = {
  score: number;
  label?: string;
  accentColor?: string;
};

function barColor(score: number): string {
  return alarmLevelColor(score);
}

export function ScoreBar({ score, label, accentColor }: ScoreBarProps) {
  const width = Math.max(0, Math.min(100, score));
  const fill = accentColor ?? barColor(score);

  return (
    <div className="space-y-1.5">
      {label ? <p className="text-sm text-[var(--ink-muted)]">{label}</p> : null}
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${width}%`, backgroundColor: fill }}
          />
        </div>
        <span className="w-10 text-right text-sm font-semibold tabular-nums text-[var(--ink)]">
          {score}
        </span>
      </div>
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-[var(--accent-soft)] px-2.5 py-1 text-lg font-semibold tabular-nums text-[var(--accent)]">
      {score}
    </span>
  );
}
