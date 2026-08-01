/**
 * JSS Admin Panel Maximum Security Suite
 * Handles 3-Layer Authentication, Anti-Brute-Force Lockout, Server Session Tokens,
 * Audit Logging, and HTTPS Enforcement.
 */

// Audit log entry interface
export interface AdminAuditLog {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  success: boolean;
}

// Global in-memory storage for anti-brute-force and audit logs
const failedAttemptsMap = new Map<string, { failedCount: number; lockUntil: number; lastAttempt: number }>();
const auditLogsStore: AdminAuditLog[] = [];

// Session cookie constants
export const ADMIN_COOKIE_NAME = 'admin_session';
export const SESSION_INACTIVE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Parses User-Agent header into Browser and OS names
 */
export function parseUserAgent(ua: string): { browser: string; os: string } {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (!ua) return { browser, os };

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  // Detect Browser
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera';

  return { browser, os };
}

/**
 * Logs every login attempt for auditing
 */
export function logAdminLoginAttempt(ip: string, userAgent: string, success: boolean): AdminAuditLog {
  const { browser, os } = parseUserAgent(userAgent);
  const logEntry: AdminAuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ip: ip || '127.0.0.1',
    userAgent: userAgent || 'Unknown',
    browser,
    os,
    success,
  };

  auditLogsStore.unshift(logEntry);
  if (auditLogsStore.length > 500) {
    auditLogsStore.pop();
  }

  console.log(`[ADMIN AUDIT LOG] ${logEntry.timestamp} | IP: ${logEntry.ip} | OS: ${logEntry.os} | Browser: ${logEntry.browser} | Result: ${success ? 'SUCCESS' : 'FAILED'}`);
  return logEntry;
}

/**
 * Returns recent audit log entries
 */
export function getAdminAuditLogs(): AdminAuditLog[] {
  return [...auditLogsStore];
}

/**
 * Anti Brute-Force Rate Limiter:
 * Locks IP for 15 minutes after 5 failed attempts.
 */
export function checkIpLockout(ip: string): { isLocked: boolean; remainingMinutes: number } {
  const record = failedAttemptsMap.get(ip);
  if (!record) {
    return { isLocked: false, remainingMinutes: 0 };
  }

  const now = Date.now();
  if (record.lockUntil > now) {
    const remainingMs = record.lockUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return { isLocked: true, remainingMinutes };
  }

  // Lock expired, reset lock window if expired
  if (record.lockUntil > 0 && record.lockUntil <= now) {
    failedAttemptsMap.delete(ip);
  }

  return { isLocked: false, remainingMinutes: 0 };
}

export function recordFailedLoginAttempt(ip: string): { isLockedNow: boolean; failedCount: number } {
  const now = Date.now();
  const record = failedAttemptsMap.get(ip) || { failedCount: 0, lockUntil: 0, lastAttempt: now };

  record.failedCount += 1;
  record.lastAttempt = now;

  if (record.failedCount >= 5) {
    record.lockUntil = now + 15 * 60 * 1000; // 15 minutes lockout
    failedAttemptsMap.set(ip, record);
    return { isLockedNow: true, failedCount: record.failedCount };
  }

  failedAttemptsMap.set(ip, record);
  return { isLockedNow: false, failedCount: record.failedCount };
}

export function resetFailedLoginAttempts(ip: string): void {
  failedAttemptsMap.delete(ip);
}

/**
 * Checks if request is over HTTPS in production environment
 */
export function isHttpsRequest(headers: Headers, url: string): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true; // Allow HTTP in development
  }
  const proto = headers.get('x-forwarded-proto');
  if (proto && proto.toLowerCase() === 'https') {
    return true;
  }
  return url.startsWith('https://');
}

/**
 * Crypto Helper: Generates HMAC secret key for signing session tokens
 */
async function getCryptoSecretKey(): Promise<CryptoKey> {
  const secret = (process.env.ADMIN_PASSWORD || '') + (process.env.ADMIN_ACCESS_CODE || '') + 'JSS_ADMIN_HMAC_SALT_2026';
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

export interface AdminSessionPayload {
  sid: string;
  email: string;
  createdAt: number;
  lastActiveAt: number;
}

/**
 * Creates a signed server session token
 */
export async function createSessionToken(email: string): Promise<string> {
  const payload: AdminSessionPayload = {
    sid: crypto.randomUUID(),
    email,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };

  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(encoder.encode(payloadStr));

  const key = await getCryptoSecretKey();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload));
  const encodedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies signed session token & checks inactive session timeout (30 mins)
 */
export async function verifySessionToken(token: string): Promise<{ valid: boolean; payload?: AdminSessionPayload; reason?: string }> {
  if (!token || !token.includes('.')) {
    return { valid: false, reason: 'INVALID_FORMAT' };
  }

  const [encodedPayload, encodedSignature] = token.split('.');
  if (!encodedPayload || !encodedSignature) {
    return { valid: false, reason: 'MALFORMED_TOKEN' };
  }

  try {
    const key = await getCryptoSecretKey();
    const encoder = new TextEncoder();

    // Decode signature
    const sigBinaryStr = base64UrlDecode(encodedSignature);
    const sigBytes = new Uint8Array(sigBinaryStr.length);
    for (let i = 0; i < sigBinaryStr.length; i++) {
      sigBytes[i] = sigBinaryStr.charCodeAt(i);
    }

    const isValidSig = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(encodedPayload));
    if (!isValidSig) {
      return { valid: false, reason: 'INVALID_SIGNATURE' };
    }

    // Parse payload
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: AdminSessionPayload = JSON.parse(payloadJson);

    // Check inactive session expiration (30 minutes)
    const now = Date.now();
    if (now - payload.lastActiveAt > SESSION_INACTIVE_TIMEOUT_MS) {
      return { valid: false, reason: 'SESSION_EXPIRED' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, reason: 'VERIFICATION_FAILED' };
  }
}

/**
 * Validates provided credentials against server environment variables
 */
export function validateAdminCredentials(email: string, password: string, accessCode: string): boolean {
  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;
  const envAccessCode = process.env.ADMIN_ACCESS_CODE;

  if (!envEmail || !envPassword || !envAccessCode) {
    console.error('[ADMIN AUTH ERROR] Server environment variables for Admin Authentication are missing!');
    return false;
  }

  return (
    email.trim() === envEmail.trim() &&
    password === envPassword &&
    accessCode.trim() === envAccessCode.trim()
  );
}
