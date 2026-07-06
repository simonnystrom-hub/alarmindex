/**
 * Scoring utilities for Alarmindex.
 * Exposure weight is applied in code — never in the AI prompt.
 */

export const PROMPT_VERSION = '1.0.0'

export const EXPOSURE_WEIGHT_ABOVE_FOLD = 1.5
export const EXPOSURE_WEIGHT_BELOW_FOLD = 1.0

export const DAILY_MAX_WEIGHT = 0.7
export const DAILY_AVG_WEIGHT = 0.3

export const THEORETICAL_MAX_FINAL = 20 * EXPOSURE_WEIGHT_ABOVE_FOLD

export type EmotionPrimary = 'fear' | 'anger' | 'sadness' | 'disgust' | 'neutral'

export const EMOTION_LABELS: Record<EmotionPrimary, string> = {
  fear: 'Rädsla',
  anger: 'Ila',
  sadness: 'Sorg',
  disgust: 'Avsky',
  neutral: 'Neutral',
}

export function displayScore(final: number): number {
  return Math.round((final / THEORETICAL_MAX_FINAL) * 100)
}
