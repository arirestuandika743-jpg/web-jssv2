import { NextResponse } from 'next/server';
import { auditLogger } from '@/services/auditLogger';

// Allowed mapping service domains to prevent Server-Side Request Forgery (SSRF)
const ALLOWED_MAP_DOMAINS = [
  'google.com',
  'www.google.com',
  'maps.google.com',
  'goo.gl',
  'maps.app.goo.gl',
  'openstreetmap.org',
  'www.openstreetmap.org',
  'waze.com',
  'www.waze.com',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Parameter URL wajib diisi' }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(rawUrl);

    // 1. Enforce HTTPS / HTTP protocol only
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      auditLogger.log('SSRF_ATTEMPT_BLOCKED', 'Protokol URL tidak diizinkan', { url: rawUrl });
      return NextResponse.json({ error: 'Protokol URL tidak diizinkan' }, { status: 400 });
    }

    // 2. Validate hostname against domain whitelist
    const hostname = parsedUrl.hostname.toLowerCase();
    const isDomainAllowed = ALLOWED_MAP_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    );

    if (!isDomainAllowed) {
      auditLogger.log('SSRF_ATTEMPT_BLOCKED', 'Domain URL tidak diizinkan (SSRF Protection)', { hostname });
      return NextResponse.json(
        { error: 'Domain tidak diizinkan. Hanya menerima tautan Peta resmi.' },
        { status: 403 }
      );
    }

    let currentUrl = parsedUrl.toString();
    let redirectCount = 0;
    const maxRedirects = 5;

    // Follow manual redirects securely
    while (redirectCount < maxRedirects) {
      const response = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        headers: {
          'User-Agent': 'JSS-Delivery-App/1.0',
        },
      });

      const location = response.headers.get('location');
      if (!location) {
        break;
      }

      const nextUrl = new URL(location, currentUrl);
      const nextHostname = nextUrl.hostname.toLowerCase();

      // Check redirected domain against whitelist as well
      const isNextDomainAllowed = ALLOWED_MAP_DOMAINS.some(
        (domain) => nextHostname === domain || nextHostname.endsWith('.' + domain)
      );

      if (!isNextDomainAllowed) {
        auditLogger.log('SSRF_ATTEMPT_BLOCKED', 'Redirect domain tidak diizinkan', { nextHostname });
        break;
      }

      currentUrl = nextUrl.toString();
      redirectCount++;

      // Stop early if coordinate signature is found
      if (currentUrl.includes('@') || currentUrl.includes('query=') || currentUrl.includes('/place/')) {
        break;
      }
    }

    return NextResponse.json({ resolvedUrl: currentUrl });
  } catch (error: any) {
    const { safeError } = auditLogger.error(error, 'Gagal memproses redirect peta');
    return NextResponse.json({ error: safeError }, { status: 400 });
  }
}
