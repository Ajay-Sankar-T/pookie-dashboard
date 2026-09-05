import { NextResponse } from 'next/server';
import { findMemberByEmail } from '@/lib/members';
import { signSessionToken } from '@/lib/session-token.server';
import { isRateLimited } from '@/lib/rate-limit.server';

// Server-only: credentials never ship to the client bundle. Kept inline here
// rather than in a shared lib so no client component can accidentally import it.
const CREDENTIALS: Record<string, string> = {
  'me25b012@smail.iitm.ac.in': 'pookie@012',
  'me25b002@smail.iitm.ac.in': 'pookie@002',
  'me25b011@smail.iitm.ac.in': 'pookie@011',
  'me25b016@smail.iitm.ac.in': 'pookie@016',
  'me25b017@smail.iitm.ac.in': 'pookie@017',
  'me25b020@smail.iitm.ac.in': 'pookie@020',
  'me25b022@smail.iitm.ac.in': 'pookie@022',
  'me25b023@smail.iitm.ac.in': 'pookie@023',
  'me25b034@smail.iitm.ac.in': 'pookie@034',
  'me25b039@smail.iitm.ac.in': 'pookie@039',
  'me25b093@smail.iitm.ac.in': 'pookie@093',
};

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(`login:${ip}`, 10, 5 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: 'Too many attempts — wait a bit and try again 🥺' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing email or password' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const expectedPassword = CREDENTIALS[normalizedEmail];
    const member = findMemberByEmail(normalizedEmail);

    if (!member || !expectedPassword || expectedPassword !== password) {
      return NextResponse.json(
        { ok: false, error: "That email/password combo isn't one of the 11 pookies 🥺" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      memberId: member.id,
      token: signSessionToken(member.id),
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong' }, { status: 500 });
  }
}
