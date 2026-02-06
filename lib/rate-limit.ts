// Simple in-memory rate limiter for serverless environments.
// Note: This is per-instance only. For multi-instance deployments (Vercel),
// consider Upstash Redis or similar for distributed rate limiting.

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Periodic cleanup to prevent memory leaks (every 60s)
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

/**
 * Check if a request should be rate-limited.
 * @param key - Unique identifier (e.g., IP + endpoint)
 * @param limit - Max requests per window
 * @param windowMs - Time window in milliseconds
 * @returns { limited: boolean, remaining: number }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { limited: boolean; remaining: number } {
  cleanup()

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, remaining: limit - 1 }
  }

  entry.count++
  if (entry.count > limit) {
    return { limited: true, remaining: 0 }
  }

  return { limited: false, remaining: limit - entry.count }
}

/**
 * Extract a client identifier from a request for rate limiting.
 * Uses X-Forwarded-For (common behind proxies/Vercel) or falls back to a generic key.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
