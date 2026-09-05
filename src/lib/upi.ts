const UPI_VPA_RE = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/;

export function isValidUpiVpa(vpa: string): boolean {
  return UPI_VPA_RE.test(vpa.trim());
}

/**
 * Builds a `upi://pay` deep link. Amount must be positive rupees with up to
 * 2 decimal places — UPI apps reject malformed `am` params.
 */
export function buildUpiLink(params: {
  payeeVpa: string;
  payeeName: string;
  amountRupees: number;
  note?: string;
}): string {
  const { payeeVpa, payeeName, amountRupees, note } = params;
  const amount = Math.max(0, amountRupees).toFixed(2);
  const query = new URLSearchParams({
    pa: payeeVpa.trim(),
    pn: payeeName,
    am: amount,
    cu: 'INR',
  });
  if (note) query.set('tn', note);
  return `upi://pay?${query.toString()}`;
}
