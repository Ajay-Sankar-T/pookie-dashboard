import { describe, it, expect } from 'vitest';
import { toPaise, toRupees, formatCurrency, calculateEqualSplit, validateSplits } from './currency';

describe('toPaise', () => {
  it('converts rupees to integer paise', () => {
    expect(toPaise(180)).toBe(18000);
    expect(toPaise('180.50')).toBe(18050);
  });

  it('rounds fractional paise instead of truncating', () => {
    expect(toPaise('10.005')).toBe(1001); // 1000.5 -> rounds to 1001
  });

  it('returns 0 for garbage input', () => {
    expect(toPaise('not a number')).toBe(0);
    expect(toPaise(NaN)).toBe(0);
  });

  it('strips currency symbols from string input', () => {
    expect(toPaise('₹1,234.50'.replace(/,/g, ''))).toBe(123450);
  });
});

describe('toRupees', () => {
  it('converts paise back to rupees', () => {
    expect(toRupees(18000)).toBe(180);
    expect(toRupees(0)).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('omits decimals for whole rupee amounts', () => {
    expect(formatCurrency(18000)).toBe('₹180');
  });

  it('shows decimals only when there is a paise remainder', () => {
    expect(formatCurrency(18050)).toBe('₹180.50');
  });

  it('shows a sign when requested', () => {
    expect(formatCurrency(5000, { showSign: true })).toBe('+₹50');
    expect(formatCurrency(-5000, { showSign: true })).toBe('-₹50');
    expect(formatCurrency(0, { showSign: true })).toBe('₹0');
  });
});

describe('calculateEqualSplit', () => {
  it('splits evenly when it divides cleanly', () => {
    expect(calculateEqualSplit(30000, 3)).toEqual([10000, 10000, 10000]);
  });

  it('distributes remainder paise to the first participants, summing exactly to the total', () => {
    // ₹100 among 3 people = 3333.33... paise each
    const shares = calculateEqualSplit(10000, 3);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(10000);
    expect(shares).toEqual([3334, 3333, 3333]);
  });

  it('handles a single participant', () => {
    expect(calculateEqualSplit(10000, 1)).toEqual([10000]);
  });

  it('returns an empty array for zero or negative participants', () => {
    expect(calculateEqualSplit(10000, 0)).toEqual([]);
    expect(calculateEqualSplit(10000, -1)).toEqual([]);
  });

  it('returns all zeros for a non-positive total', () => {
    expect(calculateEqualSplit(0, 3)).toEqual([0, 0, 0]);
  });

  it('never loses or invents a paisa across many participant counts', () => {
    for (let n = 1; n <= 13; n++) {
      const shares = calculateEqualSplit(9999, n);
      expect(shares.reduce((a, b) => a + b, 0)).toBe(9999);
      expect(shares).toHaveLength(n);
    }
  });
});

describe('validateSplits', () => {
  it('is valid when splits sum exactly to the total', () => {
    const result = validateSplits(10000, [{ amountPaise: 5000 }, { amountPaise: 5000 }]);
    expect(result).toEqual({ isValid: true, differencePaise: 0 });
  });

  it('reports a positive difference when splits fall short', () => {
    const result = validateSplits(10000, [{ amountPaise: 4000 }]);
    expect(result.isValid).toBe(false);
    expect(result.differencePaise).toBe(6000);
  });

  it('reports a negative difference when splits overshoot', () => {
    const result = validateSplits(10000, [{ amountPaise: 6000 }, { amountPaise: 6000 }]);
    expect(result.isValid).toBe(false);
    expect(result.differencePaise).toBe(-2000);
  });
});
