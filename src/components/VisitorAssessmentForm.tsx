'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useCallback, useRef, useState } from 'react'

type VisitorAssessmentFormProps = {
  newspaperSlug: string
  newspaperName: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
        },
      ) => string
      reset: (widgetId: string) => void
    }
  }
}

export function VisitorAssessmentForm({
  newspaperSlug,
  newspaperName,
}: VisitorAssessmentFormProps) {
  const router = useRouter()
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const renderTurnstile = useCallback(() => {
    if (!siteKey || !turnstileRef.current || !window.turnstile || widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      callback: (token) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
    })
  }, [siteKey])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          email,
          marketingOptIn,
          turnstileToken,
          newspaperSlug,
        }),
      })

      const data = (await response.json()) as {
        error?: string
        shortId?: string
        message?: string
        existing?: boolean
      }

      if (!response.ok) {
        setError(data.error ?? 'Något gick fel.')
        return
      }

      if (data.shortId) {
        if (data.existing) {
          router.push(`/bedomning/${data.shortId}`)
          return
        }

        setMessage(data.message ?? 'Vi mailar dig när bedömningen är klar.')
        router.push(`/bedomning/${data.shortId}`)
      }
    } catch {
      setError('Kunde inte skicka in bedömningen. Försök igen.')
    } finally {
      setSubmitting(false)
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
        setTurnstileToken('')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {siteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          onLoad={renderTurnstile}
        />
      ) : null}

      <div>
        <label htmlFor="assessment-url" className="block text-sm font-medium text-[var(--ink)]">
          Artikel-URL från {newspaperName}
        </label>
        <input
          id="assessment-url"
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://"
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[var(--ink)] outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="assessment-email" className="block text-sm font-medium text-[var(--ink)]">
          E-post
        </label>
        <input
          id="assessment-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[var(--ink)] outline-none ring-[var(--accent)] focus:ring-2"
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-[var(--ink-muted)]">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(event) => setMarketingOptIn(event.target.checked)}
          className="mt-1"
        />
        <span>Jag vill få nyheter och uppdateringar från Alarmindex</span>
      </label>

      <p className="text-xs leading-relaxed text-[var(--ink-subtle)]">
        Genom att skicka in godkänner du att vi behandlar din e-postadress för att leverera
        bedömningen.{' '}
        <Link href="/integritet" className="underline hover:text-[var(--ink)]">
          Läs mer om hur vi hanterar personuppgifter
        </Link>
        .
      </p>

      {siteKey ? <div ref={turnstileRef} /> : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--ink-muted)]">{message}</p> : null}

      <button
        type="submit"
        disabled={submitting || (Boolean(siteKey) && !turnstileToken)}
        className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Skickar…' : 'Bedöm artikel'}
      </button>
    </form>
  )
}
