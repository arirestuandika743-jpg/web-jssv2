/**
 * JSS Security Suite - Input Sanitization & Anti-XSS / SQLi Protections
 */

/**
 * Escapes HTML characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips dangerous HTML tags, inline event handlers, and javascript: protocols.
 */
export function sanitizeString(input: string, allowLineBreaks = true): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input
    // Remove control characters (except newline if allowed)
    .replace(allowLineBreaks ? /[^\S\r\n]+/g : /[^\S]+/g, ' ')
    // Remove script tags and contents
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
    // Remove inline event handlers (e.g. onload=, onerror=)
    .replace(/on\w+\s*=\s*(['"]?)(.*?)\1/gi, '')
    // Remove javascript: URLs
    .replace(/javascript\s*:\s*/gi, '')
    // Trim whitespace
    .trim();

  return escapeHtml(sanitized);
}

/**
 * Sanitizes phone numbers to standard format (digits and optional leading +).
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  // Keep only digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Format 08xxx into +628xxx for standardization if needed or return cleaned
  return cleaned;
}

/**
 * Validates coordinate numbers to ensure they lie within valid geographic ranges.
 */
export function sanitizeCoordinates(lat?: number | null, lng?: number | null): { lat: number; lng: number } | null {
  if (lat === undefined || lat === null || lng === undefined || lng === null) return null;
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (isNaN(numLat) || isNaN(numLng)) return null;
  if (numLat < -90 || numLat > 90) return null;
  if (numLng < -180 || numLng > 180) return null;

  return { lat: numLat, lng: numLng };
}

/**
 * Detects potential SQL Injection attack signatures.
 */
export function containsSqlInjection(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const sqlPatterns = [
    /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|DECLARE)\b/i,
    /--/,
    /\/\*/,
    /;\s*(DROP|SELECT|INSERT|UPDATE|DELETE)/i,
    /'\s*OR\s*'\d+'\s*=\s*'\d+/i,
    /1\s*=\s*1/i,
  ];
  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Deeply sanitizes an object by recursively processing string fields.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const result: Record<string, any> = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
