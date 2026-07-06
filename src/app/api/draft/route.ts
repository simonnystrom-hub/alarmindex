import {draftMode} from 'next/headers'
import {redirect} from 'next/navigation'
import {type NextRequest} from 'next/server'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const slug = request.nextUrl.searchParams.get('slug') || '/'

  if (!process.env.SANITY_PREVIEW_SECRET || secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Ogiltig preview-nyckel', {status: 401})
  }

  const draft = await draftMode()
  draft.enable()
  redirect(slug)
}
