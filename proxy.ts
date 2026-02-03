import { auth } from '@/lib/auth/auth'
import { NextRequest, NextResponse } from 'next/server'

export default async function proxy(request: NextRequest) {
  // Handle auth protection first
  const session = await auth()
  const { pathname } = request.nextUrl

  // Protected routes - Syndicate admin only
  if (pathname.startsWith('/syndicate')) {
    if (!session || session.user.role !== 'syndicate') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protected routes - Branch head only
  if (pathname.startsWith('/branch')) {
    if (!session || session.user.role !== 'branch_head') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protected routes - Clinic only
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

