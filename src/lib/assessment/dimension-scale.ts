export const INTERNAL_MIN = 0
export const INTERNAL_MAX = 4

export const DISPLAY10_MIN = 1
export const DISPLAY10_MAX = 10

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Mappning som gör att vi kan ändra AI:s "display-skala" till 1–10
 * utan att bryta hela indexberäkningen (som fortfarande förväntar 0–4 internt).
 *
 * 1  -> 0
 * 10 -> 4
 */
export function display10ToInternal04(value: number): number {
  const v = clamp(value, DISPLAY10_MIN, DISPLAY10_MAX)
  return ((v - DISPLAY10_MIN) * (INTERNAL_MAX - INTERNAL_MIN)) / (DISPLAY10_MAX - DISPLAY10_MIN)
}

/**
 * Inversen till `display10ToInternal04`.
 * 0  -> 1
 * 4  -> 10
 */
export function internal04ToDisplay10(value: number): number {
  const v = clamp(value, INTERNAL_MIN, INTERNAL_MAX)
  return DISPLAY10_MIN + ((v - INTERNAL_MIN) * (DISPLAY10_MAX - DISPLAY10_MIN)) / (INTERNAL_MAX - INTERNAL_MIN)
}

/**
 * Robust normalisering om modellen (av misstag) fortfarande output:ar 0–4.
 * Returnerar alltid intern 0–4 (kan vara flyttal).
 */
export function normalizeAiDimensionToInternal04(value: number): number {
  // Heuristik: om den ligger i 0–4 antar vi att det är "old behavior"
  if (value >= INTERNAL_MIN && value <= INTERNAL_MAX) return clamp(value, INTERNAL_MIN, INTERNAL_MAX)
  return display10ToInternal04(value)
}

