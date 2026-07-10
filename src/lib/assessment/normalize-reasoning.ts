/** AI returnerar ibland reasoning som objekt (en rad per dimension) i stället för sträng. */
export function normalizeReasoning(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (value == null) return ''
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeReasoning(item))
      .filter(Boolean)
      .join(' ')
  }
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map((item) => normalizeReasoning(item))
      .filter(Boolean)
      .join(' ')
  }
  return String(value).trim()
}
