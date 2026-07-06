import {createClient} from '@sanity/client'
import {draftMode} from 'next/headers'
import {apiVersion, dataset, getSanityClient as getPublishedSanityClient, projectId} from './client'

export function isSanityConfigured(): boolean {
  return Boolean(projectId && projectId !== 'your-project-id')
}

export async function isPreviewMode(): Promise<boolean> {
  try {
    const {isEnabled} = await draftMode()
    return isEnabled
  } catch {
    return false
  }
}

async function resolveSanityClient() {
  const preview = await isPreviewMode()

  if (preview && process.env.SANITY_API_READ_TOKEN) {
    return createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_API_READ_TOKEN,
      perspective: 'previewDrafts',
    })
  }

  return getPublishedSanityClient()
}

export async function safeFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  if (!isSanityConfigured()) {
    return [] as T
  }

  const preview = await isPreviewMode()
  const client = await resolveSanityClient()

  try {
    return await client.fetch<T>(query, {...params, preview})
  } catch {
    return [] as T
  }
}

export async function safeFetchOne<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  if (!isSanityConfigured()) {
    return null
  }

  const client = await resolveSanityClient()

  try {
    return await client.fetch<T | null>(query, {...params, preview: await isPreviewMode()})
  } catch {
    return null
  }
}
