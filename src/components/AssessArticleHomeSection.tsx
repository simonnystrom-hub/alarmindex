import Link from 'next/link'
import { NewspaperSwatch } from '@/components/NewspaperSwatch'
import { getNewspapers } from '@/lib/sanity/queries'
import { newspaperColor } from '@/lib/newspaper-colors'

export async function AssessArticleHomeSection() {
  const newspapers = await getNewspapers()

  if (newspapers.length === 0) return null

  return (
    <section
      id="bedom-artikel"
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
    >
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 sm:px-6">
        <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">Bedöm en artikel</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--ink-muted)]">
          Klistra in en artikel-URL från en av våra listade tidningar. Du får ett alarmindex-poäng
          för rubriken — med samma metod som det officiella dagliga indexet, men för en artikel du
          väljer själv.
        </p>
      </div>

      <ul className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        {newspapers.map((paper) => {
          const color = newspaperColor(paper.slug)
          return (
            <li key={paper._id}>
              <Link
                href={`/tidning/${paper.slug}/bedom`}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition hover:border-[var(--ink-subtle)] hover:bg-[var(--surface-muted)]"
              >
                <NewspaperSwatch slug={paper.slug} size="md" />
                <span className="font-medium" style={{ color }}>
                  {paper.name}
                </span>
                <span className="ml-auto text-sm text-[var(--ink-subtle)]">→</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
