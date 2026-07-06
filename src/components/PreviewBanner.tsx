import Link from 'next/link'
import {isPreviewMode} from '@/lib/sanity/fetch'

export async function PreviewBanner() {
  const preview = await isPreviewMode()
  if (!preview) return null

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <span>Förhandsvisning — visar utkast och opublicerat innehåll.</span>
        <Link href="/api/disable-draft" className="font-medium underline hover:no-underline">
          Avsluta förhandsvisning
        </Link>
      </div>
    </div>
  )
}
