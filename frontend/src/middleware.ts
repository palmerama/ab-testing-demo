import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

export const GB_UUID_COOKIE = 'gb-user-id'

export async function middleware(request: NextRequest) {
  let uuid = request.cookies.get(GB_UUID_COOKIE)?.value
  let needsUpdate = false

  if (!uuid) {
    uuid = crypto.randomUUID()
    needsUpdate = true
    request.cookies.set(GB_UUID_COOKIE, uuid)
  }

  const response = NextResponse.next({
    request: {headers: new Headers(request.headers)},
  })

  if (needsUpdate) {
    response.cookies.set(GB_UUID_COOKIE, uuid)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|studio).*)'],
}
