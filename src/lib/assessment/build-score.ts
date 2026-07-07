import type { EmotionPrimary } from '@/lib/scoring'

export const PROMPT_VERSION = '1.0.0'

export const EXPOSURE_WEIGHT_ABOVE_FOLD = 1.5
export const THEORETICAL_MAX_FINAL = 20 * EXPOSURE_WEIGHT_ABOVE_FOLD

export type DimensionScores = {
  threatIntensity: number
  personalFraming: number
  decontextualization: number
  formalIntensity: number
  emotionPrimary: EmotionPrimary
  emotionIntensity: number
}

export function contentScore(dimensions: DimensionScores): number {
  return (
    dimensions.threatIntensity +
    dimensions.personalFraming +
    dimensions.decontextualization +
    dimensions.formalIntensity +
    dimensions.emotionIntensity
  )
}

export function displayScoreFromFinal(final: number): number {
  return Math.round((final / THEORETICAL_MAX_FINAL) * 100)
}

export function buildScoreFromDimensions(dimensions: DimensionScores) {
  const content = contentScore(dimensions)
  const final = content * EXPOSURE_WEIGHT_ABOVE_FOLD
  const display = displayScoreFromFinal(final)

  return {
    ...dimensions,
    contentScore: content,
    exposureWeight: EXPOSURE_WEIGHT_ABOVE_FOLD,
    finalScore: final,
    displayScore: display,
  }
}
