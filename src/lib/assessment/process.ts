import {
  buildScoreFromDimensions,
  combinedDisplayScore,
} from '@/lib/assessment/build-score'
import { extractArticleContent } from '@/lib/assessment/extract-article'
import {
  buildFailureEmailHtml,
  buildSuccessEmailHtml,
  sendAssessmentEmail,
} from '@/lib/assessment/send-email'
import { scoreArticleWithLead } from '@/lib/assessment/score-headline'
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

    const extracted = await extractArticleContent(assessment.sourceUrl)
    const aiScore = await scoreArticleWithLead({
      newspaperName: assessment.newspaper.name,
      date,
      headline: extracted.headline,
      subheading: extracted.subheading,
      leadText: extracted.leadText,
    })

    const headlineBuilt = buildScoreFromDimensions({
      threatIntensity: aiScore.headline.threatIntensity,
      personalFraming: aiScore.headline.personalFraming,
      decontextualization: aiScore.headline.decontextualization,
      formalIntensity: aiScore.headline.formalIntensity,
      emotionPrimary: aiScore.headline.emotionPrimary,
      emotionIntensity: aiScore.headline.emotionIntensity,
    })

    const leadBuilt = aiScore.lead
      ? buildScoreFromDimensions({
          threatIntensity: aiScore.lead.threatIntensity,
          personalFraming: aiScore.lead.personalFraming,
          decontextualization: aiScore.lead.decontextualization,
          formalIntensity: aiScore.lead.formalIntensity,
          emotionPrimary: aiScore.lead.emotionPrimary,
          emotionIntensity: aiScore.lead.emotionIntensity,
        })
      : null

    const headlineDisplayScore = headlineBuilt.displayScore
    const leadDisplayScore = leadBuilt?.displayScore
    const displayScore = combinedDisplayScore(headlineDisplayScore, leadDisplayScore)

    await client
      .patch(assessment._id)
      .set({
        status: 'published',
        headlineText: extracted.headline,
        subheading: extracted.subheading,
        leadText: extracted.leadText ?? null,
        leadMissing: !extracted.leadText,
        headlineDisplayScore,
        leadDisplayScore: leadDisplayScore ?? null,
        displayScore,
        threatIntensity: headlineBuilt.threatIntensity,
        personalFraming: headlineBuilt.personalFraming,
        decontextualization: headlineBuilt.decontextualization,
        formalIntensity: headlineBuilt.formalIntensity,
        emotionPrimary: headlineBuilt.emotionPrimary,
        emotionIntensity: headlineBuilt.emotionIntensity,
        reasoning: aiScore.headline.reasoning,
        leadThreatIntensity: leadBuilt?.threatIntensity ?? null,
        leadPersonalFraming: leadBuilt?.personalFraming ?? null,
        leadDecontextualization: leadBuilt?.decontextualization ?? null,
        leadFormalIntensity: leadBuilt?.formalIntensity ?? null,
        leadEmotionPrimary: leadBuilt?.emotionPrimary ?? null,
        leadEmotionIntensity: leadBuilt?.emotionIntensity ?? null,
        leadReasoning: aiScore.lead?.reasoning ?? null,
        promptVersion: aiScore.headline.promptVersion,
        modelVersion: aiScore.headline.modelVersion,
        processedAt: new Date().toISOString(),
        failureReason: null,
      })
      .commit()

    await sendAssessmentEmail({
      to: assessment.submitterEmail,
      subject: 'Din alarmindex-bedömning är klar',
      html: buildSuccessEmailHtml({
        headline: extracted.headline,
        score: displayScore,
        headlineScore: headlineDisplayScore,
        leadScore: leadDisplayScore,
        leadMissing: !extracted.leadText,
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
