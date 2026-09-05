import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findMemberById } from '@/lib/members';
import { verifySessionToken } from '@/lib/session-token.server';
import { ensureCirclesSeeded } from '@/lib/seed.server';
import { FOOD_COURT_CIRCLE_ID } from '@/lib/sample-data';

function checkAuth(memberId: unknown, token: unknown) {
  return typeof memberId === 'string' && findMemberById(memberId) && verifySessionToken(memberId, token as string);
}

// Subscribe (join Food Court Pookies)
export async function POST(request: Request) {
  try {
    const { memberId, token } = await request.json();
    if (!checkAuth(memberId, token)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    await ensureCirclesSeeded();
    await prisma.circleMember.upsert({
      where: { circleId_userId: { circleId: FOOD_COURT_CIRCLE_ID, userId: memberId } },
      update: {},
      create: { circleId: FOOD_COURT_CIRCLE_ID, userId: memberId },
    });

    return NextResponse.json({ ok: true, subscribed: true });
  } catch (error) {
    console.error('Failed to subscribe to Food Court Pookies:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

// Unsubscribe (leave Food Court Pookies)
export async function DELETE(request: Request) {
  try {
    const { memberId, token } = await request.json();
    if (!checkAuth(memberId, token)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    await prisma.circleMember.deleteMany({
      where: { circleId: FOOD_COURT_CIRCLE_ID, userId: memberId },
    });

    return NextResponse.json({ ok: true, subscribed: false });
  } catch (error) {
    console.error('Failed to unsubscribe from Food Court Pookies:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
