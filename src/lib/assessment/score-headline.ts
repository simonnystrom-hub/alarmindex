import Anthropic from '@anthropic-ai/sdk'
import type { EmotionPrimary } from '@/lib/scoring'
import { PROMPT_VERSION } from './build-score'
import {
  ARTICLE_WITH_LEAD_SYSTEM_PROMPT,
  SCORING_SYSTEM_PROMPT,
  buildArticleWithLeadUserPrompt,
  buildScoringUserPrompt,
} from './scoring-prompt'
import { normalizeAiDimensionToInternal04 } from './dimension-scale'

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

export type ArticleAiScoreResult = {
  headline: AiScoreResult
  lead?: AiScoreResult
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

type RawArticleAiJson = {
  headline: RawAiJson
  lead: RawAiJson
}

function parseAiJson(text: string): RawAiJson {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('AI returnerade ingen JSON')
  }
  return JSON.parse(match[0]) as RawAiJson
}

function parseArticleAiJson(text: string): RawArticleAiJson {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('AI returnerade ingen JSON')
  }
  return JSON.parse(match[0]) as RawArticleAiJson
}

function rawToAiScore(raw: RawAiJson, modelVersion: string): AiScoreResult {
  return {
    threatIntensity: normalizeAiDimensionToInternal04(raw.threat_intensity),
    personalFraming: normalizeAiDimensionToInternal04(raw.personal_framing),
    decontextualization: normalizeAiDimensionToInternal04(raw.decontextualization),
    formalIntensity: normalizeAiDimensionToInternal04(raw.formal_intensity),
    emotionPrimary: raw.emotion_primary,
    emotionIntensity: normalizeAiDimensionToInternal04(raw.emotion_intensity),
    reasoning: raw.reasoning,
    promptVersion: PROMPT_VERSION,
    modelVersion,
  }
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

  return rawToAiScore(parseAiJson(textBlock.text), model)
}

export async function scoreArticleWithLead(params: {
  newspaperName: string
  date: string
  headline: string
  subheading?: string
  leadText?: string
}): Promise<ArticleAiScoreResult> {
  if (!params.leadText) {
    const headline = await scoreHeadlineWithAi(params)
    return { headline }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY saknas')
  }

  const model = process.env.ANTHROPIC_MODEL ?? FALLBACK_MODEL
  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model,
    max_tokens: 1200,
    temperature: 0,
    system: ARTICLE_WITH_LEAD_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildArticleWithLeadUserPrompt({
          newspaperName: params.newspaperName,
          date: params.date,
          headline: params.headline,
          subheading: params.subheading,
          leadText: params.leadText,
        }),
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('AI returnerade inget textsvar')
  }

  const raw = parseArticleAiJson(textBlock.text)

  return {
    headline: rawToAiScore(raw.headline, model),
    lead: rawToAiScore(raw.lead, model),
  }
}
