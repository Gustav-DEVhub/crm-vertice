import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ─── In-memory rate limiter (fallback for dev without Redis) ───
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const loginRateLimitMap = new Map<string, { count: number; resetTime: number }>()

function rateLimit(
  map: Map<string, { count: number; resetTime: number }>,
  ip: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const entry = map.get(ip)

  if (!entry || now > entry.resetTime) {
    map.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) rateLimitMap.delete(key)
  }
  for (const [key, value] of loginRateLimitMap) {
    if (now > value.resetTime) loginRateLimitMap.delete(key)
  }
}, 5 * 60 * 1000)

// ─── Public paths ───
const publicPaths = ['/login', '/privacidad', '/api/auth']

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  // ─── CORS: reject non-same-origin requests for API routes ───
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json(
        { error: 'Origen no permitido' },
        { status: 403 }
      )
    }
  }

  // ─── Rate limiting: login endpoint (5 req / 15min) ───
  if (pathname === '/api/auth/callback/credentials' && request.method === 'POST') {
    const allowed = rateLimit(loginRateLimitMap, ip, 5, 15 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.' },
        { status: 429 }
      )
    }
  }

  // ─── Rate limiting: general (100 req/min) ───
  if (pathname.startsWith('/api/')) {
    const allowed = rateLimit(rateLimitMap, ip, 100, 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta más tarde.' },
        { status: 429 }
      )
    }
  }

  // ─── Auth: redirect to login if not authenticated ───
  if (!isPublicPath(pathname) && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon')) {
    const token = await getToken({ req: request })
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ─── If on login page and already authenticated, redirect to dashboard ───
  if (pathname === '/login') {
    const token = await getToken({ req: request })
    if (token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
