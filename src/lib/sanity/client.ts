import {createClient} from '@sanity/client'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your-project-id'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01'

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
})
