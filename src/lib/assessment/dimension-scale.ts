export const INTERNAL_MIN = 0
export const INTERNAL_MAX = 4

export const DISPLAY10_MIN = 1
export const DISPLAY10_MAX = 10

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * AI graderar på 1–10.
 * Vi mappar till intern 0–4 så att 0–100-beräkningen behåller samma beteende.
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
  return (
    DISPLAY10_MIN +
    ((v - INTERNAL_MIN) * (DISPLAY10_MAX - DISPLAY10_MIN)) / (INTERNAL_MAX - INTERNAL_MIN)
  )
}

/**
 * Tolka AI-dimensioner som 1–10 och mappa till intern 0–4.
 *
 * Från metodversion 1.2.1: vi antar alltid 1–10. Tidigare heuristik
 * (värden ≤4 = gammal 0–4-skala) blåste upp måttliga poäng till max.
 */
export function normalizeAiDimensionToInternal04(value: number): number {
  return display10ToInternal04(value)
}
