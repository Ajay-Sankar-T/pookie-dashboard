import { PookieFriend, Transaction, SimplifiedDebt } from '../types';

/**
 * Calculates the minimal practical set of settlement transactions
 * to balance all debts within a group or circle.
 * 
 * Uses greedy minimum cash flow algorithm:
 * 1. Compute net balance for each person (in integer paise)
 * 2. Separate into debtors (net < 0) and creditors (net > 0)
 * 3. Match largest debtor with largest creditor iteratively
 */
export function simplifyDebts(
  friends: PookieFriend[],
  transactions: Transaction[],
  circleId?: string
): SimplifiedDebt[] {
  const friendMap = new Map<string, PookieFriend>();
  friends.forEach((f) => friendMap.set(f.id, f));

  // 1. Calculate net balances for each friend
  const netBalances = new Map<string, number>();
  friends.forEach((f) => netBalances.set(f.id, 0));

  const filteredTransactions = circleId
    ? transactions.filter((t) => t.circleId === circleId)
    : transactions;

  for (const tx of filteredTransactions) {
    if (tx.isSettlement && tx.settlementDetails) {
      // Settlement: payer paid settledAmount to paidToId
      const payerNet = netBalances.get(tx.payerId) || 0;
      const receiverNet = netBalances.get(tx.settlementDetails.paidToId) || 0;
      netBalances.set(tx.payerId, payerNet + tx.amountPaise);
      netBalances.set(tx.settlementDetails.paidToId, receiverNet - tx.amountPaise);
    } else {
      // Normal expense:
      // Payer spent tx.amountPaise
      const currentPayerNet = netBalances.get(tx.payerId) || 0;
      netBalances.set(tx.payerId, currentPayerNet + tx.amountPaise);

      // Each participant owes their split share
      for (const split of tx.splits) {
        const participantNet = netBalances.get(split.friendId) || 0;
        netBalances.set(split.friendId, participantNet - split.amountPaise);
      }
    }
  }

  // 2. Separate into creditors and debtors
  interface PersonBalance {
    friendId: string;
    amount: number; // positive
  }

  const creditors: PersonBalance[] = [];
  const debtors: PersonBalance[] = [];

  for (const [friendId, net] of netBalances.entries()) {
    // Ignore small rounding dust (< 1 paise)
    if (net > 0) {
      creditors.push({ friendId, amount: net });
    } else if (net < 0) {
      debtors.push({ friendId, amount: -net });
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplified: SimplifiedDebt[] = [];

  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const settledAmount = Math.min(creditor.amount, debtor.amount);

    if (settledAmount > 0) {
      const fromFriend = friendMap.get(debtor.friendId);
      const toFriend = friendMap.get(creditor.friendId);

      if (fromFriend && toFriend) {
        simplified.push({
          fromFriend,
          toFriend,
          amountPaise: settledAmount,
        });
      }
    }

    creditor.amount -= settledAmount;
    debtor.amount -= settledAmount;

    if (creditor.amount === 0) {
      cIdx++;
    }
    if (debtor.amount === 0) {
      dIdx++;
    }
  }

  return simplified;
}

