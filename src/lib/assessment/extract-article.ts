type ExtractedHeadline = {
  headline: string
  subheading?: string
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

function jsonLdHeadline(html: string): string | null {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]

  for (const script of scripts) {
    try {
      const json = JSON.parse(script[1]!) as unknown
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        if (!item || typeof item !== 'object') continue
        const record = item as Record<string, unknown>
        if (typeof record.headline === 'string' && record.headline.trim()) {
          return record.headline.trim()
        }
        if (record['@graph'] && Array.isArray(record['@graph'])) {
          for (const node of record['@graph']) {
            if (node && typeof node === 'object' && typeof (node as {headline?: string}).headline === 'string') {
              return (node as {headline: string}).headline.trim()
            }
          }
        }
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
  }

  return null
}

function titleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : null
}

export async function extractArticleHeadline(url: string): Promise<ExtractedHeadline> {
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

  const subheading =
    metaContent(html, 'og:description') ??
    metaContent(html, 'description') ??
    undefined

  return { headline, subheading }
}
