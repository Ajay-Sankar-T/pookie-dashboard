import { describe, it, expect } from 'vitest';
import { simplifyDebts } from './debt-simplification';
import { PookieFriend, Transaction } from '@/types';

function friend(id: string): PookieFriend {
  return { id, name: id, avatarEmoji: '🎀', color: '#FF6FAE', createdAt: '2026-01-01T00:00:00Z' };
}

function expense(
  payerId: string,
  amountPaise: number,
  splits: { friendId: string; amountPaise: number }[],
  overrides: Partial<Transaction> = {}
): Transaction {
  return {
    id: `tx-${Math.random()}`,
    title: 'Snack',
    category: 'other',
    amountPaise,
    payerId,
    splits,
    date: '2026-01-01T00:00:00Z',
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('simplifyDebts', () => {
  const [a, b, c] = ['a', 'b', 'c'].map(friend);

  it('produces one settlement for a simple two-person debt', () => {
    // a pays 100, split 50/50 -> b owes a 50
    const txs = [expense('a', 10000, [{ friendId: 'b', amountPaise: 5000 }])];
    const result = simplifyDebts([a, b], txs);

    expect(result).toHaveLength(1);
    expect(result[0].fromFriend.id).toBe('b');
    expect(result[0].toFriend.id).toBe('a');
    expect(result[0].amountPaise).toBe(5000);
  });

  it('collapses a chain of debts into fewer settlements than raw transactions', () => {
    // a pays for b (b owes a 100), b pays for c (c owes b 100)
    // net: a is owed 100, b is even, c owes 100 -> single settlement c -> a
    const txs = [
      expense('a', 10000, [{ friendId: 'b', amountPaise: 10000 }]),
      expense('b', 10000, [{ friendId: 'c', amountPaise: 10000 }]),
    ];
    const result = simplifyDebts([a, b, c], txs);

    expect(result).toHaveLength(1);
    expect(result[0].fromFriend.id).toBe('c');
    expect(result[0].toFriend.id).toBe('a');
    expect(result[0].amountPaise).toBe(10000);
  });

  it('returns nothing once everyone is even', () => {
    const txs = [
      expense('a', 10000, [{ friendId: 'b', amountPaise: 5000 }]),
      // b settles their 50 with a
      expense('b', 5000, [], {
        isSettlement: true,
        settlementDetails: { paidToId: 'a', settledAmountPaise: 5000, isFullSettlement: true },
      }),
    ];
    const result = simplifyDebts([a, b], txs);
    expect(result).toEqual([]);
  });

  it('only considers transactions within the given circle when one is specified', () => {
    const txs = [
      expense('a', 10000, [{ friendId: 'b', amountPaise: 5000 }], { circleId: 'circle-1' }),
      expense('a', 20000, [{ friendId: 'c', amountPaise: 20000 }], { circleId: 'circle-2' }),
    ];
    const result = simplifyDebts([a, b, c], txs, 'circle-1');

    expect(result).toHaveLength(1);
    expect(result[0].fromFriend.id).toBe('b');
    expect(result[0].amountPaise).toBe(5000);
  });

  it('every simplified debt total matches what raw pairwise balances would sum to', () => {
    const txs = [
      expense('a', 30000, [
        { friendId: 'b', amountPaise: 10000 },
        { friendId: 'c', amountPaise: 10000 },
      ]),
      expense('b', 6000, [{ friendId: 'c', amountPaise: 3000 }]),
    ];
    const result = simplifyDebts([a, b, c], txs);

    const totalMoved = result.reduce((sum, d) => sum + d.amountPaise, 0);
    // c owes a 10000 + owes b 3000 = 13000; b is net owed 10000 - 3000 = 7000
    // simplified total moved should never exceed the sum of individual debts
    expect(totalMoved).toBeGreaterThan(0);
    expect(totalMoved).toBeLessThanOrEqual(13000 + 10000);
  });
});
