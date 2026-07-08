import { after } from 'next/server'
import { NextResponse, type NextRequest } from 'next/server'
import { classifyUrlType, hostMatchesNewspaper, normalizeAssessmentUrl } from '@/lib/assessment/normalize-url'
import { processVisitorAssessment } from '@/lib/assessment/process'
import { createShortId } from '@/lib/assessment/short-id'
import { verifyTurnstileToken } from '@/lib/assessment/verify-turnstile'
import {
  countVisitorAssessmentsByEmailToday,
  getActiveNewspapersWithSource,
  getVisitorAssessmentBySourceUrl,
} from '@/lib/sanity/assessment-queries'
import { getSanityWriteClient } from '@/lib/sanity/write-client'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DAILY_EMAIL_LIMIT = 3

type AssessBody = {
  url?: string
  email?: string
  marketingOptIn?: boolean
  turnstileToken?: string
  newspaperSlug?: string
}

export async function POST(request: NextRequest) {
  const writeClient = getSanityWriteClient()
  if (!writeClient) {
    return NextResponse.json({ error: 'Bedömningar är inte konfigurerade ännu.' }, { status: 503 })
  }

  let body: AssessBody
  try {
    body = (await request.json()) as AssessBody
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran.' }, { status: 400 })
  }

  const rawUrl = body.url?.trim()
  const email = body.email?.trim().toLowerCase()
  const turnstileToken = body.turnstileToken?.trim()
  const newspaperSlug = body.newspaperSlug?.trim()
  const marketingOptIn = Boolean(body.marketingOptIn)

  if (!rawUrl) {
    return NextResponse.json({ error: 'Ange en URL.' }, { status: 400 })
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Ange en giltig e-postadress.' }, { status: 400 })
  }

  if (!turnstileToken) {
    return NextResponse.json({ error: 'Bekräfta att du inte är en robot.' }, { status: 400 })
  }

  const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const captchaOk = await verifyTurnstileToken(turnstileToken, remoteIp)
  if (!captchaOk) {
    return NextResponse.json({ error: 'CAPTCHA-verifiering misslyckades.' }, { status: 400 })
  }

  let normalizedUrl: string
  try {
    normalizedUrl = normalizeAssessmentUrl(rawUrl)
    new URL(normalizedUrl)
  } catch {
    return NextResponse.json({ error: 'Ogiltig URL.' }, { status: 400 })
  }

  const existing = await getVisitorAssessmentBySourceUrl(normalizedUrl)
  if (existing?.shortId) {
    return NextResponse.json({
      shortId: existing.shortId,
      status: existing.status,
      existing: true,
      message: 'Den här URL:en har redan bedömts.',
    })
  }

  const submissionsToday = await countVisitorAssessmentsByEmailToday(email)
  if (submissionsToday >= DAILY_EMAIL_LIMIT) {
    return NextResponse.json(
      { error: `Max ${DAILY_EMAIL_LIMIT} bedömningar per e-post och dag.` },
      { status: 429 },
    )
  }

  const newspapers = await getActiveNewspapersWithSource()
  const parsed = new URL(normalizedUrl)

  const newspaper = newspapers.find((paper) => {
    if (newspaperSlug && paper.slug !== newspaperSlug) return false
    return hostMatchesNewspaper(parsed, paper.sourceUrl)
  })

  if (!newspaper) {
    return NextResponse.json(
      { error: 'URL:en tillhör ingen av våra listade tidningar.' },
      { status: 400 },
    )
  }

  const urlType = classifyUrlType(normalizedUrl, newspaper.sourceUrl)
  const shortId = createShortId()
  const documentId = `visitorAssessment-${shortId}`

  await writeClient.create({
    _id: documentId,
    _type: 'visitorAssessment',
    shortId,
    sourceUrl: normalizedUrl,
    sourceUrlRaw: rawUrl,
    urlType,
    newspaper: { _type: 'reference', _ref: newspaper._id },
    submittedAt: new Date().toISOString(),
    submitterEmail: email,
    marketingOptIn,
    status: 'pending',
  })

  after(async () => {
    try {
      await processVisitorAssessment(documentId)
    } catch (error) {
      console.error('[assess] background processing failed', error)
    }
  })

  return NextResponse.json(
    {
      shortId,
      status: 'pending',
      existing: false,
      message: 'Vi analyserar rubriken och ingressen och mailar dig när bedömningen är klar.',
    },
    { status: 202 },
  )
}
