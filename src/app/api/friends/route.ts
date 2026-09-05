import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { INITIAL_FRIENDS } from '@/lib/sample-data';
import { ensureUsersSeeded } from '@/lib/seed.server';

export async function GET() {
  try {
    await ensureUsersSeeded();
    const friends = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const formatted = friends.map((f) => ({
      id: f.id,
      name: f.name,
      nickname: f.nickname || undefined,
      avatarEmoji: f.avatarEmoji,
      avatarImage: f.avatarImage || undefined,
      color: f.color,
      createdAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch friends from DB:', error);
    return NextResponse.json(INITIAL_FRIENDS);
  }
}
