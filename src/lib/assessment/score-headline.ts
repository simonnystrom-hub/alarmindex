import Anthropic from '@anthropic-ai/sdk'
import type { EmotionPrimary } from '@/lib/scoring'
import { PROMPT_VERSION } from './build-score'
import { SCORING_SYSTEM_PROMPT, buildScoringUserPrompt } from './scoring-prompt'

const FALLBACK_MODEL = 'claude-haiku-4-5-20251001'

export type AiScoreResult = {
  threatIntensity: number
  personalFraming: number
  decontextualization: number
  formalIntensity: number
  emotionPrimary: EmotionPrimary
  emotionIntensity: number
  reasoning: string
  promptVersion: string
  modelVersion: string
}

type RawAiJson = {
  threat_intensity: number
  personal_framing: number
  decontextualization: number
  formal_intensity: number
  emotion_primary: EmotionPrimary
  emotion_intensity: number
  reasoning: string
}

function clamp04(value: number): number {
  return Math.max(0, Math.min(4, Math.round(value)))
}

function parseAiJson(text: string): RawAiJson {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('AI returnerade ingen JSON')
  }
  return JSON.parse(match[0]) as RawAiJson
}

export async function scoreHeadlineWithAi(params: {
  newspaperName: string
  date: string
  headline: string
  subheading?: string
}): Promise<AiScoreResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY saknas')
  }

  const model = process.env.ANTHROPIC_MODEL ?? FALLBACK_MODEL
  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model,
    max_tokens: 600,
    temperature: 0,
    system: SCORING_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildScoringUserPrompt(params) }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('AI returnerade inget textsvar')
  }

  const raw = parseAiJson(textBlock.text)

  return {
    threatIntensity: clamp04(raw.threat_intensity),
    personalFraming: clamp04(raw.personal_framing),
    decontextualization: clamp04(raw.decontextualization),
    formalIntensity: clamp04(raw.formal_intensity),
    emotionPrimary: raw.emotion_primary,
    emotionIntensity: clamp04(raw.emotion_intensity),
    reasoning: raw.reasoning,
    promptVersion: PROMPT_VERSION,
    modelVersion: model,
  }
}
