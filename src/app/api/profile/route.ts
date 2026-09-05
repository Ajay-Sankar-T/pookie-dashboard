import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findMemberById } from '@/lib/members';
import { WAIFU_AVATARS } from '@/lib/waifu-avatars';
import { verifySessionToken } from '@/lib/session-token.server';
import { ensureUsersSeeded } from '@/lib/seed.server';

export async function GET(request: Request) {
  try {
    await ensureUsersSeeded();
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (memberId) {
      const user = await prisma.user.findUnique({ where: { id: memberId } });
      return NextResponse.json(
        user ? { upiId: user.upiId || undefined, avatarImage: user.avatarImage || undefined } : {}
      );
    }

    const users = await prisma.user.findMany();
    const all: Record<string, { upiId?: string; avatarImage?: string }> = {};
    for (const u of users) {
      all[u.id] = { upiId: u.upiId || undefined, avatarImage: u.avatarImage || undefined };
    }
    return NextResponse.json(all);
  } catch (error) {
    console.error('Failed to read profiles from DB:', error);
    return NextResponse.json({});
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, token, upiId, avatarImage } = body;

    if (typeof memberId !== 'string' || !findMemberById(memberId)) {
      return NextResponse.json({ error: 'Unknown memberId' }, { status: 400 });
    }
    if (!verifySessionToken(memberId, token)) {
      return NextResponse.json({ error: 'Not authorized to edit this profile' }, { status: 401 });
    }
    if (avatarImage !== undefined && !WAIFU_AVATARS.includes(avatarImage)) {
      return NextResponse.json({ error: 'Avatar must be one of the provided waifu images' }, { status: 400 });
    }

    const data: { upiId?: string; avatarImage?: string } = {};
    if (typeof upiId === 'string') data.upiId = upiId.trim();
    if (typeof avatarImage === 'string') data.avatarImage = avatarImage;

    await ensureUsersSeeded();
    const updated = await prisma.user.update({ where: { id: memberId }, data });

    return NextResponse.json({
      upiId: updated.upiId || undefined,
      avatarImage: updated.avatarImage || undefined,
    });
  } catch (error) {
    console.error('Failed to update profile in DB:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
