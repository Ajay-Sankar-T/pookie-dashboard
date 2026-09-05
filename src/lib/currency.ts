/**
 * Deterministic Currency Utility
 * RULE: All calculations MUST use integer minor units (Paise) to eliminate floating point issues.
 * 1 INR = 100 Paise.
 */

export function toPaise(rupees: number | string): number {
  if (typeof rupees === 'string') {
    const clean = rupees.replace(/[^0-9.-]/g, '');
    const val = parseFloat(clean);
    if (isNaN(val)) return 0;
    return Math.round(val * 100);
  }
  if (isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

export function toRupees(paise: number): number {
  return (paise || 0) / 100;
}

/**
 * Formats paise into clean Indian Rupee notation.
 * e.g. 18000 paise -> "₹180"
 * e.g. 18050 paise -> "₹180.50"
 */
export function formatCurrency(
  paise: number,
  options?: {
    showSign?: boolean;
    compact?: boolean;
    absolute?: boolean;
  }
): string {
  const absPaise = Math.abs(paise || 0);
  const rupees = absPaise / 100;
  
  // Format with commas if needed, only show decimals if there are paise remainder
  const hasDecimals = absPaise % 100 !== 0;
  const numStr = hasDecimals
    ? rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  if (options?.absolute) {
    return `₹${numStr}`;
  }

  if (options?.showSign) {
    if (paise > 0) return `+₹${numStr}`;
    if (paise < 0) return `-₹${numStr}`;
    return `₹${numStr}`;
  }

  return paise < 0 ? `-₹${numStr}` : `₹${numStr}`;
}

/**
 * Splits an amount in integer paise equally across N participants.
 * Guarantees that the sum of parts exactly equals the total down to 1 paise.
 */
export function calculateEqualSplit(totalPaise: number, participantCount: number): number[] {
  if (participantCount <= 0) return [];
  if (totalPaise <= 0) return new Array(participantCount).fill(0);

  const baseShare = Math.floor(totalPaise / participantCount);
  const remainder = totalPaise - baseShare * participantCount;

  const result: number[] = [];
  for (let i = 0; i < participantCount; i++) {
    // Distribute remainder 1 paise at a time to the first few participants
    result.push(baseShare + (i < remainder ? 1 : 0));
  }
  return result;
}

/**
 * Validates that custom splits equal the total amount.
 */
export function validateSplits(
  totalPaise: number,
  splits: { amountPaise: number }[]
): { isValid: boolean; differencePaise: number } {
  const sum = splits.reduce((acc, curr) => acc + (curr.amountPaise || 0), 0);
  const diff = totalPaise - sum;
  return {
    isValid: diff === 0,
    differencePaise: diff,
  };
}

