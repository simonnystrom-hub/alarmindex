/**
 * Torrkörning av besökarbedömning — extraherar rubrik + ingress och kör AI-scoring
 * utan att spara i Sanity.
 *
 *   npx tsx scripts/preview-visitor-assessment.ts "https://..."
 *   npm run preview-assessment -- "https://..."
 *
 * Dokumenterat i Sanity Studio under Besökarbedömningar → Verktyg & torrkörning.
 */
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file)
  if (!existsSync(path)) continue
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^ANTHROPIC_API_KEY=(.+)$/)
    if (match) {
      process.env.ANTHROPIC_API_KEY = match[1]!.trim().replace(/^["']|["']$/g, '')
    }
  }
}

import { extractArticleContent } from '../src/lib/assessment/extract-article'
import { scoreArticleWithLead } from '../src/lib/assessment/score-headline'
import { buildScoreFromDimensions, combinedDisplayScore } from '../src/lib/assessment/build-score'
import { internal04ToDisplay10 } from '../src/lib/assessment/dimension-scale'
import type { DimensionScores } from '../src/lib/assessment/build-score'

const url =
  process.argv[2] ??
  'https://www.expressen.se/nyheter/varlden/david-59-blev-plotsligt-sjuk-pa-vag-hem-fran-turkiet/'

function show(label: string, built: ReturnType<typeof buildScoreFromDimensions>, reasoning: string) {
  console.log(`=== ${label.toUpperCase()} ===`)
  console.log(`Poäng: ${built.displayScore}/100`)
  console.log(`Hot: ${Math.round(internal04ToDisplay10(built.threatIntensity))}/10`)
  console.log(
    `Personifiering: ${Math.round(internal04ToDisplay10(built.personalFraming))}/10`,
  )
  console.log(
    `Kontextlöshet: ${Math.round(internal04ToDisplay10(built.decontextualization))}/10`,
  )
  console.log(`Formspråk: ${Math.round(internal04ToDisplay10(built.formalIntensity))}/10`)
  console.log(
    `Känsla: ${built.emotionPrimary} (${Math.round(internal04ToDisplay10(built.emotionIntensity))}/10)`,
  )
  console.log(`Motivering: ${reasoning}`)
  console.log('')
}

function toBuilt(dimensions: DimensionScores) {
  return buildScoreFromDimensions(dimensions)
}

async function main() {
  console.log(`URL: ${url}\n`)

  const extracted = await extractArticleContent(url)
  console.log('=== EXTRAHERAT ===')
  console.log(`Rubrik: ${extracted.headline}`)
  if (extracted.subheading) console.log(`Underrubrik: ${extracted.subheading}`)
  console.log(`Ingress: ${extracted.leadText ?? '(saknas)'}`)
  console.log('')

  const ai = await scoreArticleWithLead({
    newspaperName: 'Expressen',
    date: new Date().toISOString().slice(0, 10),
    headline: extracted.headline,
    subheading: extracted.subheading,
    leadText: extracted.leadText,
  })

  const headlineBuilt = toBuilt({
    threatIntensity: ai.headline.threatIntensity,
    personalFraming: ai.headline.personalFraming,
    decontextualization: ai.headline.decontextualization,
    formalIntensity: ai.headline.formalIntensity,
    emotionPrimary: ai.headline.emotionPrimary,
    emotionIntensity: ai.headline.emotionIntensity,
  })

  const leadBuilt = ai.lead
    ? toBuilt({
        threatIntensity: ai.lead.threatIntensity,
        personalFraming: ai.lead.personalFraming,
        decontextualization: ai.lead.decontextualization,
        formalIntensity: ai.lead.formalIntensity,
        emotionPrimary: ai.lead.emotionPrimary,
        emotionIntensity: ai.lead.emotionIntensity,
      })
    : null

  const combined = combinedDisplayScore(headlineBuilt.displayScore, leadBuilt?.displayScore)

  show('Rubrik', headlineBuilt, ai.headline.reasoning)
  if (leadBuilt && ai.lead) show('Ingress', leadBuilt, ai.lead.reasoning)

  console.log('=== SAMMANLAGT ===')
  console.log(
    `Poäng: ${combined}/100${leadBuilt ? ' (medel av rubrik och ingress)' : ' (endast rubrik — ingress saknas)'}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
