import imageUrlBuilder from '@sanity/image-url'
import {dataset, projectId} from './client'
import type {SanityImage} from './types'

const builder = imageUrlBuilder({projectId, dataset})

export function urlForImage(source: SanityImage | null | undefined) {
  if (!source?.asset?._ref) return null
  return builder.image(source).auto('format').quality(85)
}

export function screenshotUrl(source: SanityImage | null | undefined, width: number) {
  const url = urlForImage(source)?.width(width).url()
  return url ?? null
}
