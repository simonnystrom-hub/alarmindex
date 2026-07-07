const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
])

export function normalizeAssessmentUrl(raw: string): string {
  const parsed = new URL(raw.trim())
  parsed.hash = ''
  parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')

  const params = new URLSearchParams(parsed.search)
  for (const key of [...params.keys()]) {
    if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
      params.delete(key)
    }
  }
  parsed.search = params.toString() ? `?${params.toString()}` : ''

  const path = parsed.pathname.replace(/\/+$/, '') || '/'
  parsed.pathname = path

  return parsed.toString()
}

export function hostMatchesNewspaper(url: URL, sourceUrl: string): boolean {
  const source = new URL(sourceUrl)
  const normalizeHost = (host: string) => host.toLowerCase().replace(/^www\./, '')
  const urlHost = normalizeHost(url.hostname)
  const sourceHost = normalizeHost(source.hostname)

  if (urlHost === sourceHost) return true
  if (urlHost.endsWith(`.${sourceHost}`)) return true
  if (sourceHost.endsWith(`.${urlHost}`)) return true

  return false
}

export function classifyUrlType(normalizedUrl: string, newspaperSourceUrl: string): 'article' | 'frontpage' {
  const url = new URL(normalizedUrl)
  const source = new URL(newspaperSourceUrl)

  const urlPath = url.pathname.replace(/\/+$/, '') || '/'
  const sourcePath = source.pathname.replace(/\/+$/, '') || '/'

  if (urlPath === sourcePath || urlPath === '/') {
    return 'frontpage'
  }

  return 'article'
}
