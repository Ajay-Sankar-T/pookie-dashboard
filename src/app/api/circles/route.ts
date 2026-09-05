import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { INITIAL_CIRCLES } from '@/lib/sample-data';
import { ensureCirclesSeeded } from '@/lib/seed.server';

export async function GET() {
  try {
    await ensureCirclesSeeded();
    const circles = await prisma.circle.findMany({
      orderBy: { createdAt: 'asc' },
      include: { members: true },
    });

    const formatted = circles.map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      description: c.description || undefined,
      memberIds: c.members.map((m) => m.userId),
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch circles from DB:', error);
    return NextResponse.json(INITIAL_CIRCLES);
  }
}
