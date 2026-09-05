import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { findMemberById } from '@/lib/members';
import { verifySessionToken } from '@/lib/session-token.server';

function checkAuth(memberId: unknown, token: unknown) {
  return typeof memberId === 'string' && !!findMemberById(memberId) && verifySessionToken(memberId, token as string);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, token, name, priceRupees, category, section } = body;

    if (!checkAuth(memberId, token)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const data: { name?: string; priceRupees?: number; category?: string; section?: string } = {};
    if (typeof name === 'string' && name.trim()) data.name = name.trim();
    if (priceRupees !== undefined) {
      const price = Number(priceRupees);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
      }
      data.priceRupees = Math.round(price);
    }
    if (typeof category === 'string' && category) data.category = category;
    if (typeof section === 'string' && section.trim()) data.section = section.trim();

    const updated = await prisma.menuItem.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { memberId, token } = await request.json();

    if (!checkAuth(memberId, token)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
