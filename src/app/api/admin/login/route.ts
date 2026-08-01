import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  validateAdminCredentials,
  checkIpLockout,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  logAdminLoginAttempt,
  createSessionToken,
  ADMIN_COOKIE_NAME,
  isHttpsRequest,
} from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || '';

  // HTTPS Enforcement check
  if (!isHttpsRequest(request.headers, request.url)) {
    return NextResponse.json(
      { error: 'Insecure connection. Authentication requires HTTPS.' },
      { status: 403 }
    );
  }

  // 1. Anti Brute-Force Check
  const lockoutStatus = checkIpLockout(ip);
  if (lockoutStatus.isLocked) {
    logAdminLoginAttempt(ip, userAgent, false);
    return NextResponse.json(
      { error: 'Too many failed login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, accessCode } = body || {};

    if (!email || !password || !accessCode) {
      recordFailedLoginAttempt(ip);
      logAdminLoginAttempt(ip, userAgent, false);
      return NextResponse.json(
        { error: 'Authentication Failed.' },
        { status: 401 }
      );
    }

    // 2. Three-Layer Backend Validation
    const isValid = validateAdminCredentials(String(email), String(password), String(accessCode));

    if (!isValid) {
      const { isLockedNow } = recordFailedLoginAttempt(ip);
      logAdminLoginAttempt(ip, userAgent, false);

      if (isLockedNow) {
        return NextResponse.json(
          { error: 'Too many failed login attempts. Please try again later.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Authentication Failed.' },
        { status: 401 }
      );
    }

    // 3. Success - Reset failed attempts & Log
    resetFailedLoginAttempts(ip);
    logAdminLoginAttempt(ip, userAgent, true);

    // 4. Regenerate & Sign Session Token
    const sessionToken = await createSessionToken(String(email));

    // 5. Create Response with HttpOnly, Secure, SameSite=Strict Cookie
    const response = NextResponse.json(
      { success: true, redirectUrl: '/admin' },
      { status: 200 }
    );

    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 1800, // 30 minutes
      path: '/',
    });

    return response;
  } catch (err) {
    recordFailedLoginAttempt(ip);
    logAdminLoginAttempt(ip, userAgent, false);
    return NextResponse.json(
      { error: 'Authentication Failed.' },
      { status: 401 }
    );
  }
}
