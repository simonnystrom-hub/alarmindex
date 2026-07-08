import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { VisitorAssessmentSection } from '@/components/VisitorAssessmentSection'
import { getNewspaperBySlug } from '@/lib/sanity/queries'

export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const newspaper = await getNewspaperBySlug(slug)

  if (!newspaper) {
    return { title: 'Saknas — Alarmindex' }
  }

  return {
    title: `Bedöm artikel — ${newspaper.name}`,
    description: `Klistra in en artikel-URL från ${newspaper.name} och få ett alarmindex-poäng med samma metod som dagliga indexet.`,
  }
}

export default async function NewspaperAssessPage({ params }: PageProps) {
  const { slug } = await params
  const newspaper = await getNewspaperBySlug(slug)
  if (!newspaper) notFound()

  return (
    <div className="space-y-8">
      <PageHeader
        backHref={`/tidning/${slug}`}
        backLabel={newspaper.name}
        title={`Bedöm en artikel`}
        description={`Klistra in en artikel-URL från ${newspaper.name}. Vi analyserar rubriken med samma AI-metod som det officiella dagliga indexet — men för en enskild artikel du väljer.`}
      >
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)]">
          Detta är en <strong className="font-medium text-[var(--ink)]">besökarbedömning</strong>,
          separat från det{' '}
          <Link href={`/tidning/${slug}`} className="text-[var(--accent)] hover:underline">
            officiella dagliga indexet
          </Link>{' '}
          för {newspaper.name}.
        </p>
      </PageHeader>

      <VisitorAssessmentSection slug={slug} name={newspaper.name} />
    </div>
  )
}
