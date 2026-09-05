import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MENU } from '@/lib/menu';
import { ensureMenuSeeded } from '@/lib/seed.server';
import { findMemberById } from '@/lib/members';
import { verifySessionToken } from '@/lib/session-token.server';

export async function GET() {
  try {
    await ensureMenuSeeded();
    const items = await prisma.menuItem.findMany({ orderBy: { createdAt: 'asc' } });

    const formatted = items.map((i) => ({
      id: i.id,
      name: i.name,
      priceRupees: i.priceRupees,
      category: i.category,
      section: i.section,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch menu from DB:', error);
    return NextResponse.json(MENU);
  }
}

export async function POST(request: Request) {
  try {
    const { memberId, token, name, priceRupees, category, section } = await request.json();

    if (typeof memberId !== 'string' || !findMemberById(memberId) || !verifySessionToken(memberId, token)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const price = Number(priceRupees);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }
    if (typeof section !== 'string' || !section.trim()) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    await ensureMenuSeeded();
    const id = `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const created = await prisma.menuItem.create({
      data: {
        id,
        name: name.trim(),
        priceRupees: Math.round(price),
        category: typeof category === 'string' && category ? category : 'other',
        section: section.trim(),
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('Failed to add menu item:', error);
    return NextResponse.json({ error: 'Failed to add menu item' }, { status: 500 });
  }
}
