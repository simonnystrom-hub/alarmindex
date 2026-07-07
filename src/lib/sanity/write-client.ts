import { createClient, type SanityClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from './client'

let cachedWriteClient: SanityClient | null = null

export function getSanityWriteClient(): SanityClient | null {
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim()
  if (!token || !projectId || projectId === 'your-project-id') {
    return null
  }

  if (!cachedWriteClient) {
    cachedWriteClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })
  }

  return cachedWriteClient
}
