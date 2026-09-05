import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { INITIAL_TRANSACTIONS } from '@/lib/sample-data';
import { ensureCirclesSeeded } from '@/lib/seed.server';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { splits: true },
      orderBy: { date: 'desc' },
    });

    if (transactions.length === 0) {
      return NextResponse.json(INITIAL_TRANSACTIONS);
    }

    const formatted = transactions.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      amountPaise: t.amountPaise,
      payerId: t.payerId,
      splits: t.splits.map((s) => ({
        friendId: s.userId,
        amountPaise: s.amountPaise,
      })),
      date: t.date.toISOString(),
      note: t.note || undefined,
      circleId: t.circleId || undefined,
      isSettlement: t.isSettlement,
      settlementDetails: t.settledPaidToId
        ? {
            paidToId: t.settledPaidToId,
            settledAmountPaise: t.amountPaise,
            isFullSettlement: false,
          }
        : undefined,
      createdAt: t.createdAt.getTime(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch transactions from DB:', error);
    return NextResponse.json(INITIAL_TRANSACTIONS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await ensureCirclesSeeded();

    const newTx = await prisma.transaction.create({
      data: {
        id: body.id,
        title: body.title,
        category: body.category,
        amountPaise: body.amountPaise,
        payerId: body.payerId,
        circleId: body.circleId || null,
        note: body.note || null,
        isSettlement: body.isSettlement || false,
        settledPaidToId: body.settlementDetails?.paidToId || null,
        date: body.date ? new Date(body.date) : new Date(),
        splits: {
          create: (body.splits || []).map((s: { friendId: string; amountPaise: number }) => ({
            userId: s.friendId,
            amountPaise: s.amountPaise,
          })),
        },
      },
      include: { splits: true },
    });

    const formatted = {
      id: newTx.id,
      title: newTx.title,
      category: newTx.category as any,
      amountPaise: newTx.amountPaise,
      payerId: newTx.payerId,
      splits: newTx.splits.map((s) => ({
        friendId: s.userId,
        amountPaise: s.amountPaise,
      })),
      date: newTx.date.toISOString(),
      note: newTx.note || undefined,
      circleId: newTx.circleId || undefined,
      isSettlement: newTx.isSettlement,
      settlementDetails: newTx.settledPaidToId
        ? {
            paidToId: newTx.settledPaidToId,
            settledAmountPaise: newTx.amountPaise,
            isFullSettlement: false,
          }
        : undefined,
      createdAt: newTx.createdAt.getTime(),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to create transaction in DB:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
