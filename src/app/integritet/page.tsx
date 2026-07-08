import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Integritet — Alarmindex',
  description: 'Hur Alarmindex hanterar personuppgifter vid besökarbedömningar.',
}

export default function IntegritetPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        backHref="/"
        backLabel="Startsida"
        title="Integritet"
        description="Kort om hur vi hanterar personuppgifter."
      />

      <div className="prose prose-neutral max-w-3xl space-y-4 text-[var(--ink-muted)]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="font-serif text-xl font-semibold text-[var(--ink)]">Besökarbedömningar</h2>
          <p className="mt-3 text-sm leading-relaxed">
            När du skickar in en artikel-URL för bedömning behandlar vi din e-postadress för att
            skicka resultatet till dig. Genom att klicka på &quot;Bedöm artikel&quot; samtycker du
            till den behandlingen.
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Om du kryssar i för marknadsutskick samtycker du även till att vi får skicka nyheter
            och uppdateringar från Alarmindex. Du kan när som helst återkalla det samtycket genom
            att kontakta oss.
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Vi sparar den inskickade URL:en, bedömningsresultatet och datum för att kunna visa och
            dela bedömningen. E-postadresser maskeras i publika listor.
          </p>
        </section>

        <p className="text-sm">
          Frågor? Se även vår{' '}
          <Link href="/metodik" className="text-[var(--accent)] underline">
            metodik
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
