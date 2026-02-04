import { auth } from '@/lib/auth/auth'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/utils/rate-limit'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limit login attempts
  if (pathname.startsWith('/api/auth') && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }
  }

  // Handle auth protection first
  const session = await auth()

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
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}

