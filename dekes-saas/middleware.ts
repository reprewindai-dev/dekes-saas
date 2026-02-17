import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.nextUrl.hostname
  if (host === '127.0.0.1') {
    const url = req.nextUrl.clone()
    url.hostname = 'localhost'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
