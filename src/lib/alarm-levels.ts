export type AlarmLevel = {
  id: string;
  min: number;
  max: number;
  label: string;
  summary: string;
  description: string;
  color: string;
};

/** Tolkningsskala för alarmindex 0–100. Trösklar matchar färgerna i poängstaplar. */
export const ALARM_LEVELS: readonly AlarmLevel[] = [
  {
    id: "low",
    min: 0,
    max: 24,
    label: "Lågt",
    summary: "Sakligt eller neutralt formspråk dominerar.",
    description:
      "Rubrikerna är mest informativa. Hot, dramatik och direkt personlig adres är sparsamt eller frånvarande.",
    color: "#0f766e",
  },
  {
    id: "moderate",
    min: 25,
    max: 44,
    label: "Måttligt",
    summary: "Viss känslomässig laddning, men ingen genomgående alarmism.",
    description:
      "Enskilda rubriker kan trycka på oro eller dramatik, men löpsedeln känns inte genomgående skräckstyrd.",
    color: "#ca8a04",
  },
  {
    id: "high",
    min: 45,
    max: 69,
    label: "Högt",
    summary: "Tydligt alarmistiskt formspråk — hot och dramatik är framträdande.",
    description:
      "Det du möter först på mobilen är konstruerat för att väcka oro, ilska eller sorg snarare än bara informera.",
    color: "#c2410c",
  },
  {
    id: "very-high",
    min: 70,
    max: 100,
    label: "Mycket högt",
    summary: "Genomgående skräck- och krisformspråk.",
    description:
      "Rubriker och löpsedel trycker hårt på fara, katastrof eller personligt hot. Indexet mäter språket — inte om nyheten är viktig.",
    color: "#b91c1c",
  },
] as const;

export function getAlarmLevel(score: number): AlarmLevel {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return (
    ALARM_LEVELS.find((level) => clamped >= level.min && clamped <= level.max) ??
    ALARM_LEVELS[0]
  );
}

export function alarmLevelColor(score: number): string {
  return getAlarmLevel(score).color;
}

export function formatAlarmLevelRange(level: AlarmLevel): string {
  if (level.min === level.max) return String(level.min);
  return `${level.min}–${level.max}`;
}

export function describeAlarmIndex(score: number): string {
  const level = getAlarmLevel(score);
  return `${level.label} — ${level.summary}`;
}
