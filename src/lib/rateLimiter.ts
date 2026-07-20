/**
 * JSS Security Suite - Token Bucket Sliding Window Rate Limiter
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private cache = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60 * 1000, maxRequests = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of expired records every 5 minutes
    if (typeof window === 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  public check(identifier: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const record = this.cache.get(identifier);

    if (!record || now > record.resetTime) {
      // New or expired window
      const resetTime = now + this.windowMs;
      this.cache.set(identifier, { count: 1, resetTime });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: resetTime,
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    record.count += 1;
    this.cache.set(identifier, record);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      reset: record.resetTime,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (now > record.resetTime) {
        this.cache.delete(key);
      }
    }
  }
}

// Export default rate limiters for general API routes & sensitive auth routes
export const globalApiRateLimiter = new RateLimiter(60 * 1000, 60); // 60 requests per minute
export const authRateLimiter = new RateLimiter(60 * 1000, 10);     // 10 auth requests per minute
