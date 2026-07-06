export function normalizeNewspaperSlug(
  slug: string | null | undefined,
  newspaperId?: string,
): string {
  if (slug) return slug
  if (newspaperId?.startsWith('newspaper-')) {
    return newspaperId.slice('newspaper-'.length)
  }
  return newspaperId ?? ''
}
