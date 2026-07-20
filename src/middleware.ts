import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { globalApiRateLimiter, authRateLimiter } from '@/lib/rateLimiter';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // 1. Rate Limiting for API routes
  if (pathname.startsWith('/api')) {
    const isAuthRoute = pathname.includes('/auth') || pathname.includes('/login');
    const limiter = isAuthRoute ? authRateLimiter : globalApiRateLimiter;
    const rateCheck = limiter.check(`${ip}:${pathname}`);

    if (!rateCheck.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Terlalu banyak permintaan (Rate limit exceeded). Silakan tunggu sebentar.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': String(rateCheck.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateCheck.reset),
          },
        }
      );
    }
  }

  // 2. CORS Handling
  const origin = request.headers.get('origin');
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || '*';

  // Create base response
  const response = NextResponse.next();

  if (origin) {
    const isDevLocalhost = process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost');
    if (allowedOrigin === '*' || origin === allowedOrigin || isDevLocalhost) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // 3. Security HTTP Headers (Helmet equivalent)
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  return response;
}

// Config matcher
export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
