import Link from 'next/link'
import { VisitorAssessmentForm } from '@/components/VisitorAssessmentForm'
import {
  getVisitorAssessmentAverageForNewspaper,
  getVisitorAssessmentsForNewspaper,
} from '@/lib/sanity/assessment-queries'
import { newspaperColor } from '@/lib/newspaper-colors'

type VisitorAssessmentSectionProps = {
  slug: string
  name: string
}

export async function VisitorAssessmentSection({ slug, name }: VisitorAssessmentSectionProps) {
  const [recent, average] = await Promise.all([
    getVisitorAssessmentsForNewspaper(slug, 10),
    getVisitorAssessmentAverageForNewspaper(slug),
  ])

  const color = newspaperColor(slug)

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 sm:px-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">Bedöm en artikel</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--ink-muted)]">
          Klistra in en artikel-URL från {name}. Vi analyserar rubriken med samma metod som
          dagliga indexet och skickar resultatet till din e-post.
        </p>
      </div>

      <div className="grid gap-8 px-5 py-6 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <VisitorAssessmentForm newspaperSlug={slug} newspaperName={name} />

        <div className="space-y-5">
          {average ? (
            <div className="rounded-xl bg-[var(--surface-muted)] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--ink-subtle)]">
                Snitt besökarbedömningar
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums" style={{ color }}>
                {average.average}
                <span className="text-lg font-medium text-[var(--ink-muted)]">/100</span>
              </p>
              <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                Baserat på {average.count} bedömningar
              </p>
            </div>
          ) : null}

          {recent.length > 0 ? (
            <div>
              <h3 className="text-sm font-medium text-[var(--ink)]">Senaste bedömningar</h3>
              <ul className="mt-3 space-y-2">
                {recent.map((item) => (
                  <li key={item.shortId}>
                    <Link
                      href={`/bedomning/${item.shortId}`}
                      className="block rounded-xl border border-[var(--border)] px-4 py-3 hover:border-[var(--ink-subtle)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--ink)]">
                            {item.headlineText ?? 'Bedömning'}
                          </p>
                          <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                            {new Date(item.submittedAt).toLocaleDateString('sv-SE')} ·{' '}
                            {item.maskedEmail}
                          </p>
                        </div>
                        {item.displayScore != null ? (
                          <span
                            className="shrink-0 text-sm font-semibold tabular-nums"
                            style={{ color }}
                          >
                            {item.displayScore}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">
              Inga publicerade besökarbedömningar ännu. Var först med att bedöma en artikel.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
