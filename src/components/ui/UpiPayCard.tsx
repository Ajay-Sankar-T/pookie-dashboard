'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ExternalLink, Copy, AlertCircle } from 'lucide-react';
import { buildUpiLink, isValidUpiVpa } from '@/lib/upi';

interface UpiPayCardProps {
  payeeVpa?: string;
  payeeName: string;
  amountRupees: number;
  note?: string;
  onCopyVpa?: () => void;
  /** Hide the "Pay via UPI app" tap link — use when showing your OWN QR for
   * someone else to scan (tapping it on your own phone would try to pay yourself). */
  showPayButton?: boolean;
}

/**
 * Generates a real `upi://pay` deep link + scannable QR for a fixed amount.
 * This is intent-based UPI (no payment gateway), so there's no callback —
 * the caller is responsible for asking the user to confirm once they've
 * actually paid (see SettlementModal).
 */
export const UpiPayCard: React.FC<UpiPayCardProps> = ({
  payeeVpa,
  payeeName,
  amountRupees,
  note,
  onCopyVpa,
  showPayButton = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState(false);

  const vpaValid = !!payeeVpa && isValidUpiVpa(payeeVpa);
  const amountValid = amountRupees > 0;
  const canPay = vpaValid && amountValid;

  const upiLink = canPay
    ? buildUpiLink({ payeeVpa: payeeVpa!, payeeName, amountRupees, note })
    : null;

  useEffect(() => {
    if (!upiLink) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    setQrError(false);
    QRCode.toDataURL(upiLink, { width: 220, margin: 1, errorCorrectionLevel: 'H' })
      .then((url) => !cancelled && setQrDataUrl(url))
      .catch(() => !cancelled && setQrError(true));
    return () => {
      cancelled = true;
    };
  }, [upiLink]);

  if (!amountValid) return null;

  if (!vpaValid) {
    return (
      <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{payeeName} hasn&apos;t added a UPI ID yet — ask them to add one in their Profile.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white border border-pookie-soft shadow-pookie-sm">
      {qrError ? (
        <p className="text-xs font-bold text-rose-500">Couldn&apos;t generate a QR code 🥺</p>
      ) : qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrDataUrl}
          alt={`UPI QR to pay ${payeeName}`}
          className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl border border-pookie-soft"
        />
      ) : (
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl border border-dashed border-pookie-soft animate-pulse" />
      )}

      <div className="w-full flex items-center gap-2">
        {showPayButton && (
          <a
            href={upiLink || '#'}
            className="pookie-glossy flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-pookie-primary to-[#FF5E9E] text-white text-xs font-black py-2.5 rounded-2xl shadow-pookie active:scale-95 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Pay via UPI app
          </a>
        )}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(payeeVpa!);
            onCopyVpa?.();
          }}
          className={`p-2.5 rounded-2xl bg-pookie-blush text-pookie-dark border border-pookie-soft active:scale-95 transition-all shrink-0 ${
            showPayButton ? '' : 'flex-1 flex items-center justify-center gap-1.5 text-xs font-black'
          }`}
          title="Copy UPI ID"
          aria-label="Copy UPI ID"
        >
          <Copy className="w-4 h-4" />
          {!showPayButton && <span>Copy your UPI ID</span>}
        </button>
      </div>
      <p className="text-[10px] font-semibold text-pookie-muted text-center leading-snug">
        {showPayButton
          ? 'Tap to open your UPI app on mobile, or scan the QR from another device. After paying, confirm below so the ledger stays in sync 💕'
          : `Let ${payeeName === 'You' ? 'them' : payeeName} scan this QR to pay you directly.`}
      </p>
    </div>
  );
};
