import { createHmac, timingSafeEqual } from 'crypto';

// Server-only. Signs "this device is really logged in as memberId" so that
// /api/profile can't be used to overwrite someone else's UPI ID / avatar by
// just guessing their memberId (which is otherwise public information).
//
// Set SESSION_SECRET in your environment for production (Vercel dashboard →
// Project → Settings → Environment Variables). Falls back to an insecure
// dev-only default so local `next dev` keeps working without setup.
const SECRET = process.env.SESSION_SECRET || 'pookie-dev-insecure-secret-change-me';

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  console.warn(
    '[pookie] SESSION_SECRET is not set — falling back to an insecure default. ' +
      'Set a real SESSION_SECRET env var before relying on this in production.'
  );
}

export function signSessionToken(memberId: string): string {
  return createHmac('sha256', SECRET).update(memberId).digest('hex');
}

export function verifySessionToken(memberId: string, token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = signSessionToken(memberId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
