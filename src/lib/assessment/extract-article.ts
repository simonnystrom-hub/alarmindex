const MAX_LEAD_LENGTH = 800

export type ExtractedArticleContent = {
  headline: string
  subheading?: string
  leadText?: string
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function metaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtmlEntities(match[1].trim())
  }

  return null
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

function truncateLead(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_LEAD_LENGTH) return trimmed
  return `${trimmed.slice(0, MAX_LEAD_LENGTH).trimEnd()}…`
}

function firstParagraphFromText(text: string): string {
  const cleaned = stripHtml(text)
  const parts = cleaned
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
  return parts[0] ?? cleaned
}

function collectJsonLdKey(node: unknown, key: string, results: string[]): void {
  if (!node || typeof node !== 'object') return
  const record = node as Record<string, unknown>
  const value = record[key]
  if (typeof value === 'string' && value.trim()) {
    results.push(value.trim())
  }
  if (record['@graph'] && Array.isArray(record['@graph'])) {
    for (const child of record['@graph']) {
      collectJsonLdKey(child, key, results)
    }
  }
}

function jsonLdValues(html: string, key: string): string[] {
  const results: string[] = []
  const scripts = [
    ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ]

  for (const script of scripts) {
    try {
      const json = JSON.parse(script[1]!) as unknown
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        collectJsonLdKey(item, key, results)
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
  }

  return results
}

function jsonLdHeadline(html: string): string | null {
  for (const headline of jsonLdValues(html, 'headline')) {
    if (headline) return headline
  }
  return null
}

function jsonLdArticleLead(html: string): string | null {
  for (const body of jsonLdValues(html, 'articleBody')) {
    const paragraph = firstParagraphFromText(body)
    if (paragraph.length >= 20) return truncateLead(paragraph)
  }
  return null
}

function firstParagraphFromHtml(html: string): string | null {
  const patterns = [
    /<article[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i,
    /<main[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i,
    /<div[^>]+class=["'][^"']*article[^"']*["'][^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const text = stripHtml(match[1])
      if (text.length >= 20) return truncateLead(text)
    }
  }

  return null
}

function titleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : null
}

export async function extractArticleContent(url: string): Promise<ExtractedArticleContent> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; AlarmindexBot/1.0; +https://alarmindex.com/metodik)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
  })

  if (!response.ok) {
    throw new Error(`Kunde inte hämta sidan (HTTP ${response.status})`)
  }

  const html = await response.text()
  const headline =
    jsonLdHeadline(html) ??
    metaContent(html, 'og:title') ??
    metaContent(html, 'twitter:title') ??
    titleTag(html)

  if (!headline) {
    throw new Error('Kunde inte hitta rubriken på sidan')
  }

  const description =
    metaContent(html, 'og:description') ?? metaContent(html, 'description') ?? undefined

  let leadText =
    jsonLdArticleLead(html) ??
    (description && description.length >= 20 ? truncateLead(description) : undefined) ??
    firstParagraphFromHtml(html) ??
    undefined

  if (leadText && leadText === headline) {
    leadText = firstParagraphFromHtml(html) ?? undefined
    if (leadText === headline) leadText = undefined
  }

  const subheading =
    description && description !== leadText ? description : undefined

  return { headline, subheading, leadText }
}

/** @deprecated Use extractArticleContent */
export async function extractArticleHeadline(
  url: string,
): Promise<{ headline: string; subheading?: string }> {
  const extracted = await extractArticleContent(url)
  return { headline: extracted.headline, subheading: extracted.subheading }
}
