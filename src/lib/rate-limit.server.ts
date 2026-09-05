// Server-only, in-memory rate limiter. Resets on cold start and isn't shared
// across serverless instances, but still meaningfully slows down casual
// brute-forcing of the fixed 11-password login within a single warm instance.
const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}
