const assert = require('node:assert');

console.log('🎀 Running Pookie Expenses Engine Verification Tests...\n');

// 1. Currency & Integer Paise Math
function toPaise(rupees) {
  if (typeof rupees === 'string') {
    const clean = rupees.replace(/[^0-9.-]/g, '');
    const val = parseFloat(clean);
    if (isNaN(val)) return 0;
    return Math.round(val * 100);
  }
  if (isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

function toRupees(paise) {
  return (paise || 0) / 100;
}

function formatCurrency(paise, options) {
  const absPaise = Math.abs(paise || 0);
  const rupees = absPaise / 100;
  const hasDecimals = absPaise % 100 !== 0;
  const numStr = hasDecimals
    ? rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  if (options?.absolute) return `₹${numStr}`;
  if (options?.showSign) {
    if (paise > 0) return `+₹${numStr}`;
    if (paise < 0) return `-₹${numStr}`;
    return `₹${numStr}`;
  }
  return paise < 0 ? `-₹${numStr}` : `₹${numStr}`;
}

function calculateEqualSplit(totalPaise, participantCount) {
  if (participantCount <= 0) return [];
  if (totalPaise <= 0) return new Array(participantCount).fill(0);
  const baseShare = Math.floor(totalPaise / participantCount);
  const remainder = totalPaise - baseShare * participantCount;
  const result = [];
  for (let i = 0; i < participantCount; i++) {
    result.push(baseShare + (i < remainder ? 1 : 0));
  }
  return result;
}

// 2. Greedy Debt Simplification
function simplifyDebts(friends, transactions) {
  const friendMap = new Map();
  friends.forEach((f) => friendMap.set(f.id, f));

  const netBalances = new Map();
  friends.forEach((f) => netBalances.set(f.id, 0));

  for (const tx of transactions) {
    if (tx.isSettlement && tx.settlementDetails) {
      const payerNet = netBalances.get(tx.payerId) || 0;
      const receiverNet = netBalances.get(tx.settlementDetails.paidToId) || 0;
      netBalances.set(tx.payerId, payerNet + tx.amountPaise);
      netBalances.set(tx.settlementDetails.paidToId, receiverNet - tx.amountPaise);
    } else {
      const currentPayerNet = netBalances.get(tx.payerId) || 0;
      netBalances.set(tx.payerId, currentPayerNet + tx.amountPaise);

      for (const split of tx.splits) {
        const participantNet = netBalances.get(split.friendId) || 0;
        netBalances.set(split.friendId, participantNet - split.amountPaise);
      }
    }
  }

  const creditors = [];
  const debtors = [];

  for (const [friendId, net] of netBalances.entries()) {
    if (net > 0) creditors.push({ friendId, amount: net });
    else if (net < 0) debtors.push({ friendId, amount: -net });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplified = [];
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
        simplified.push({ fromFriend, toFriend, amountPaise: settledAmount });
      }
    }

    creditor.amount -= settledAmount;
    debtor.amount -= settledAmount;

    if (creditor.amount === 0) cIdx++;
    if (debtor.amount === 0) dIdx++;
  }

  return simplified;
}

// RUN TESTS
console.log('Test 1: Currency & Integer Paise Conversion');
assert.strictEqual(toPaise(180), 18000);
assert.strictEqual(toPaise('180.50'), 18050);
assert.strictEqual(toRupees(18000), 180);
assert.strictEqual(formatCurrency(18000), '₹180');
assert.strictEqual(formatCurrency(18050), '₹180.50');
assert.strictEqual(formatCurrency(-12000), '-₹120');
assert.strictEqual(formatCurrency(26000, { showSign: true }), '+₹260');
console.log('✓ Currency conversions & integer math verified.');

console.log('Test 2: Equal Split with Remainder Handling');
const split100 = calculateEqualSplit(10000, 3);
assert.strictEqual(split100.reduce((a, b) => a + b, 0), 10000);
assert.deepStrictEqual(split100, [3334, 3333, 3333]);

const split180 = calculateEqualSplit(18000, 2);
assert.deepStrictEqual(split180, [9000, 9000]);
console.log('✓ Odd paise distributed without 1 single paise lost.');

console.log('Test 3: Cyclic Debt Simplification (3 friends)');
const friends = [
  { id: 'u-me', name: 'Ajay' },
  { id: 'f-rahul', name: 'Rahul' },
  { id: 'f-priya', name: 'Priya' },
];

// Rahul pays ₹500 for Ajay -> Ajay owes Rahul ₹500
// Priya pays ₹500 for Rahul -> Rahul owes Priya ₹500
// Simplified: Ajay pays Priya ₹500
const txs = [
  {
    id: 'tx-1',
    amountPaise: 50000,
    payerId: 'f-rahul',
    splits: [{ friendId: 'u-me', amountPaise: 50000 }],
  },
  {
    id: 'tx-2',
    amountPaise: 50000,
    payerId: 'f-priya',
    splits: [{ friendId: 'f-rahul', amountPaise: 50000 }],
  },
];

const res = simplifyDebts(friends, txs);
assert.strictEqual(res.length, 1);
assert.strictEqual(res[0].fromFriend.name, 'Ajay');
assert.strictEqual(res[0].toFriend.name, 'Priya');
assert.strictEqual(res[0].amountPaise, 50000);
console.log('✓ Cyclic debt simplified from 2 transfers to 1!');

console.log('Test 4: Partial Settlement Accuracy');
// Ajay owes Rahul ₹180. Ajay settles ₹60.
const settleTx = {
  id: 'tx-settle',
  amountPaise: 6000,
  payerId: 'u-me',
  isSettlement: true,
  settlementDetails: { paidToId: 'f-rahul' },
};
const resAfterSettle = simplifyDebts(friends, [txs[0], settleTx]);
assert.strictEqual(resAfterSettle.length, 1);
assert.strictEqual(resAfterSettle[0].fromFriend.name, 'Ajay');
assert.strictEqual(resAfterSettle[0].toFriend.name, 'Rahul');
assert.strictEqual(resAfterSettle[0].amountPaise, 44000); // ₹500 - ₹60 = ₹440
console.log('✓ Partial settlement accurately adjusts remaining balance.');

console.log('\n🎉 ALL POOKIE EXPENSES ENGINE VERIFICATIONS PASSED! 🎀✨');

