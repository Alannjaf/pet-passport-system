import { auth } from '@/lib/auth/auth'
import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(request: NextRequest) {
  // Handle auth protection first
  const session = await auth()
  const { pathname } = request.nextUrl

  // Protected routes
  if (pathname.startsWith('/syndicate')) {
    if (!session || session.user.role !== 'syndicate') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname.startsWith('/clinic')) {
    if (!session || session.user.role !== 'clinic') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}

