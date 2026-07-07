import { buildScoreFromDimensions } from '@/lib/assessment/build-score'
import { extractArticleHeadline } from '@/lib/assessment/extract-article'
import {
  buildFailureEmailHtml,
  buildSuccessEmailHtml,
  sendAssessmentEmail,
} from '@/lib/assessment/send-email'
import { scoreHeadlineWithAi } from '@/lib/assessment/score-headline'
import { getSanityWriteClient } from '@/lib/sanity/write-client'

function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alarmindex.com').replace(/\/$/, '')
}

export async function processVisitorAssessment(documentId: string): Promise<void> {
  const client = getSanityWriteClient()
  if (!client) {
    throw new Error('SANITY_API_WRITE_TOKEN saknas')
  }

  const assessment = await client.fetch<{
    _id: string
    shortId: string
    sourceUrl: string
    urlType: 'article' | 'frontpage'
    status: string
    submitterEmail: string
    newspaper: { name: string }
  } | null>(
    `*[_type == "visitorAssessment" && _id == $id][0]{
      _id,
      shortId,
      sourceUrl,
      urlType,
      status,
      submitterEmail,
      "newspaper": newspaper->{name}
    }`,
    { id: documentId },
  )

  if (!assessment || assessment.status !== 'pending') {
    return
  }

  const assessmentUrl = `${siteBaseUrl()}/bedomning/${assessment.shortId}`
  const date = new Date().toISOString().slice(0, 10)

  await client
    .patch(assessment._id)
    .set({ status: 'processing' })
    .commit()

  try {
    if (assessment.urlType === 'frontpage') {
      throw new Error(
        'Löpsedels-URL:er stöds inte ännu — klistra in en artikel-URL från samma tidning.',
      )
    }

    const extracted = await extractArticleHeadline(assessment.sourceUrl)
    const aiScore = await scoreHeadlineWithAi({
      newspaperName: assessment.newspaper.name,
      date,
      headline: extracted.headline,
      subheading: extracted.subheading,
    })

    const built = buildScoreFromDimensions({
      threatIntensity: aiScore.threatIntensity,
      personalFraming: aiScore.personalFraming,
      decontextualization: aiScore.decontextualization,
      formalIntensity: aiScore.formalIntensity,
      emotionPrimary: aiScore.emotionPrimary,
      emotionIntensity: aiScore.emotionIntensity,
    })

    await client
      .patch(assessment._id)
      .set({
        status: 'published',
        headlineText: extracted.headline,
        subheading: extracted.subheading,
        displayScore: built.displayScore,
        threatIntensity: built.threatIntensity,
        personalFraming: built.personalFraming,
        decontextualization: built.decontextualization,
        formalIntensity: built.formalIntensity,
        emotionPrimary: built.emotionPrimary,
        emotionIntensity: built.emotionIntensity,
        reasoning: aiScore.reasoning,
        promptVersion: aiScore.promptVersion,
        modelVersion: aiScore.modelVersion,
        processedAt: new Date().toISOString(),
        failureReason: null,
      })
      .commit()

    await sendAssessmentEmail({
      to: assessment.submitterEmail,
      subject: 'Din alarmindex-bedömning är klar',
      html: buildSuccessEmailHtml({
        headline: extracted.headline,
        score: built.displayScore,
        newspaperName: assessment.newspaper.name,
        assessmentUrl,
      }),
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Okänt fel vid bedömning'

    await client
      .patch(assessment._id)
      .set({
        status: 'failed',
        failureReason: reason,
        processedAt: new Date().toISOString(),
      })
      .commit()

    await sendAssessmentEmail({
      to: assessment.submitterEmail,
      subject: 'Vi kunde inte bedöma din länk',
      html: buildFailureEmailHtml({ reason, assessmentUrl }),
    })
  }
}
