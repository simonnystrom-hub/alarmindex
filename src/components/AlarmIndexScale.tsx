import Link from "next/link";
import {
  ALARM_LEVELS,
  formatAlarmLevelRange,
  getAlarmLevel,
  type AlarmLevel,
} from "@/lib/alarm-levels";

type AlarmIndexScaleProps = {
  /** Markera vilken nivå ett givet värde hamnar i */
  highlightScore?: number;
  /** Kompakt layout för inbäddning på startsidan */
  compact?: boolean;
  showMethodLink?: boolean;
};

function LevelCard({
  level,
  active,
  compact,
}: {
  level: AlarmLevel;
  active: boolean;
  compact: boolean;
}) {
  return (
    <li
      className={`rounded-xl border p-4 transition ${
        active
          ? "border-[var(--ink-subtle)] bg-[var(--surface-muted)] shadow-[var(--shadow-card)]"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold" style={{ color: level.color }}>
          {level.label}
        </p>
        <p className="text-xs tabular-nums text-[var(--ink-subtle)]">
          {formatAlarmLevelRange(level)}
        </p>
      </div>
      <p className={`mt-1.5 text-[var(--ink)] ${compact ? "text-sm" : "text-sm font-medium"}`}>
        {level.summary}
      </p>
      {!compact ? (
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{level.description}</p>
      ) : null}
    </li>
  );
}

export function AlarmIndexScale({
  highlightScore,
  compact = false,
  showMethodLink = false,
}: AlarmIndexScaleProps) {
  const activeLevel = highlightScore != null ? getAlarmLevel(highlightScore) : null;

  return (
    <div className="space-y-4">
      {highlightScore != null && activeLevel ? (
        <p className="text-sm text-[var(--ink-muted)]">
          <span className="font-semibold tabular-nums text-[var(--ink)]">{highlightScore}</span>{" "}
          tolkas som{" "}
          <span className="font-medium" style={{ color: activeLevel.color }}>
            {activeLevel.label.toLowerCase()}
          </span>
          : {activeLevel.summary}
        </p>
      ) : (
        <p className="text-sm text-[var(--ink-muted)]">
          Alarmindex går från 0 till 100. Högre betyder mer alarmistiska rubriker den dagen — inte
          viktigare nyheter.
        </p>
      )}

      <ul className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "lg:grid-cols-2"}`}>
        {ALARM_LEVELS.map((level) => (
          <LevelCard
            key={level.id}
            level={level}
            active={activeLevel?.id === level.id}
            compact={compact}
          />
        ))}
      </ul>

      {showMethodLink ? (
        <p className="text-xs text-[var(--ink-subtle)]">
          Siffrorna härleds från fem dimensionspoäng och exponering på mobil.{" "}
          <Link href="/metodik#skala" className="underline hover:text-[var(--ink-muted)]">
            Läs hur poängen räknas
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
