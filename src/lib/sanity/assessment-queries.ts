import type { EmotionPrimary } from '@/lib/scoring'
import { safeFetch, safeFetchOne } from './fetch'

export type VisitorAssessment = {
  _id: string
  shortId: string
  sourceUrl: string
  sourceUrlRaw?: string
  urlType: 'article' | 'frontpage'
  submittedAt: string
  status: 'pending' | 'processing' | 'published' | 'failed'
  headlineText?: string
  subheading?: string
  leadText?: string
  leadMissing?: boolean
  headlineDisplayScore?: number
  leadDisplayScore?: number
  displayScore?: number
  threatIntensity?: number
  personalFraming?: number
  decontextualization?: number
  formalIntensity?: number
  emotionPrimary?: EmotionPrimary
  emotionIntensity?: number
  reasoning?: string
  leadThreatIntensity?: number
  leadPersonalFraming?: number
  leadDecontextualization?: number
  leadFormalIntensity?: number
  leadEmotionPrimary?: EmotionPrimary
  leadEmotionIntensity?: number
  leadReasoning?: string
  promptVersion?: string
  modelVersion?: string
  failureReason?: string
  newspaper: {
    _id: string
    name: string
    slug: string
  }
}

export type VisitorAssessmentListItem = {
  shortId: string
  headlineText?: string
  displayScore?: number
  submittedAt: string
  status: string
  maskedEmail: string
}

const newspaperSlugField = `"slug": coalesce(slug.current, string::split(_id, "newspaper-")[1])`

const assessmentFields = `{
  _id,
  shortId,
  sourceUrl,
  sourceUrlRaw,
  urlType,
  submittedAt,
  status,
  headlineText,
  subheading,
  leadText,
  leadMissing,
  headlineDisplayScore,
  leadDisplayScore,
  displayScore,
  threatIntensity,
  personalFraming,
  decontextualization,
  formalIntensity,
  emotionPrimary,
  emotionIntensity,
  reasoning,
  leadThreatIntensity,
  leadPersonalFraming,
  leadDecontextualization,
  leadFormalIntensity,
  leadEmotionPrimary,
  leadEmotionIntensity,
  leadReasoning,
  promptVersion,
  modelVersion,
  failureReason,
  newspaper->{_id, name, ${newspaperSlugField}}
}`

export async function getVisitorAssessmentByShortId(
  shortId: string,
): Promise<VisitorAssessment | null> {
  return safeFetchOne(
    `*[_type == "visitorAssessment" && shortId == $shortId][0]${assessmentFields}`,
    { shortId },
  )
}

export async function getVisitorAssessmentBySourceUrl(
  sourceUrl: string,
): Promise<VisitorAssessment | null> {
  return safeFetchOne(
    `*[_type == "visitorAssessment" && sourceUrl == $sourceUrl][0]${assessmentFields}`,
    { sourceUrl },
  )
}

export async function getVisitorAssessmentsForNewspaper(
  slug: string,
  limit = 10,
): Promise<VisitorAssessmentListItem[]> {
  const rows = await safeFetch<
    Array<{
      shortId: string
      headlineText?: string
      displayScore?: number
      submittedAt: string
      status: string
      submitterEmail?: string
    }>
  >(
    `*[_type == "visitorAssessment" && status == "published" && (newspaper->slug.current == $slug || newspaper._ref == $newspaperId)]
      | order(submittedAt desc)[0...$limit]{
      shortId,
      headlineText,
      displayScore,
      submittedAt,
      status,
      submitterEmail
    }`,
    { slug, newspaperId: `newspaper-${slug}`, limit },
  )

  return rows.map((row) => ({
    shortId: row.shortId,
    headlineText: row.headlineText,
    displayScore: row.displayScore,
    submittedAt: row.submittedAt,
    status: row.status,
    maskedEmail: maskEmailForQuery(row.submitterEmail ?? ''),
  }))
}

export async function getVisitorAssessmentAverageForNewspaper(
  slug: string,
): Promise<{ average: number; count: number } | null> {
  const scores = await safeFetch<number[]>(
    `*[_type == "visitorAssessment" && status == "published" && defined(displayScore) && (newspaper->slug.current == $slug || newspaper._ref == $newspaperId)].displayScore`,
    { slug, newspaperId: `newspaper-${slug}` },
  )

  if (scores.length === 0) return null

  const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  return { average, count: scores.length }
}

export async function countVisitorAssessmentsByEmailToday(email: string): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  return safeFetchOne<number>(
    `count(*[_type == "visitorAssessment" && submitterEmail == $email && submittedAt >= $since])`,
    { email: email.toLowerCase(), since: startOfDay.toISOString() },
  ).then((count) => count ?? 0)
}

function maskEmailForQuery(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  return `${local[0] ?? '*'}***@${domain}`
}

export type NewspaperWithSource = {
  _id: string
  name: string
  slug: string
  sourceUrl: string
}

export async function getActiveNewspapersWithSource(): Promise<NewspaperWithSource[]> {
  return safeFetch(
    `*[_type == "newspaper" && active == true] | order(sortOrder asc) {
      _id,
      name,
      ${newspaperSlugField},
      sourceUrl
    }`,
  )
}
