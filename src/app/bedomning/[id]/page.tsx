import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AssessmentDetail } from '@/components/AssessmentDetail'
import { PendingAssessmentPoller } from '@/components/PendingAssessmentPoller'
import { PageHeader } from '@/components/PageHeader'
import { getVisitorAssessmentByShortId } from '@/lib/sanity/assessment-queries'

type PageProps = {
  params: Promise<{ id: string }>
}

export const revalidate = 30

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const assessment = await getVisitorAssessmentByShortId(id)

  if (!assessment || assessment.status !== 'published' || !assessment.headlineText) {
    return { title: 'Bedömning — Alarmindex' }
  }

  const score = assessment.displayScore ?? 0
  const title = `Alarmindex ${score}/100 — ${assessment.newspaper.name}`
  const description = `«${assessment.headlineText}». AI-bedömning av alarmistiskt formspråk.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function AssessmentPage({ params }: PageProps) {
  const { id } = await params
  const assessment = await getVisitorAssessmentByShortId(id)
  if (!assessment) notFound()

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alarmindex.com').replace(/\/$/, '')
  const shareUrl = `${siteUrl}/bedomning/${id}`

  return (
    <div className="space-y-8">
      <PageHeader
        backHref={`/tidning/${assessment.newspaper.slug}`}
        backLabel={assessment.newspaper.name}
        title="Alarmindex-bedömning"
        description={
          assessment.status === 'published' && assessment.headlineText
            ? `«${assessment.headlineText}»`
            : 'Bedömning av alarmistiskt formspråk i en artikelrubrik.'
        }
      />

      <PendingAssessmentPoller
        active={assessment.status === 'pending' || assessment.status === 'processing'}
      />

      <AssessmentDetail assessment={assessment} />

      {assessment.status === 'published' ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <h2 className="text-sm font-medium text-[var(--ink)]">Dela bedömningen</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Kopiera länken för att dela resultatet i sociala medier.
          </p>
          <p className="mt-3 break-all rounded-xl bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)]">
            {shareUrl}
          </p>
        </section>
      ) : null}
    </div>
  )
}
