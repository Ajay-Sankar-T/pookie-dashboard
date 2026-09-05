'use client';

import React, { useState, useEffect } from 'react';
import { usePookie } from '@/context/PookieContext';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { AmountInput } from '../ui/AmountInput';
import { PookieAvatar } from '../ui/PookieAvatar';
import { UpiPayCard } from '../ui/UpiPayCard';
import { formatCurrency, toPaise, toRupees } from '@/lib/currency';
import { Sparkles, Wallet2, ArrowRight } from 'lucide-react';

export const SettlementModal: React.FC = () => {
  const {
    friendToSettle,
    closeSettlement,
    balances,
    recordSettlement,
    currentUser,
    memberProfiles,
    setActiveTab,
  } = usePookie();
  const me = currentUser!;

  const [settlementMode, setSettlementMode] = useState<'full' | 'partial'>('full');
  const [partialAmountStr, setPartialAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const myUpiId = memberProfiles[me.id]?.upiId;
  const friendUpiId = friendToSettle ? memberProfiles[friendToSettle.id]?.upiId : undefined;

  // Find balance with this friend
  const currentBalance = balances.find((b) => b.friendId === friendToSettle?.id);
  const netPaise = currentBalance ? currentBalance.netPaise : 0;
  const absNetPaise = Math.abs(netPaise);

  useEffect(() => {
    if (friendToSettle) {
      setSettlementMode('full');
      setPartialAmountStr(toRupees(absNetPaise).toString());
      setNote('UPI settlement ✨');
    }
  }, [friendToSettle, absNetPaise]);

  if (!friendToSettle) return null;

  const friendName = friendToSettle.name;
  const isFriendOwingMe = netPaise > 0;
  const isMeOwingFriend = netPaise < 0;
  const isAlreadyEven = netPaise === 0;

  const partialAmountPaise = toPaise(partialAmountStr);
  const remainingPaise = Math.max(0, absNetPaise - partialAmountPaise);
  const settlePaise = settlementMode === 'full' ? absNetPaise : partialAmountPaise;

  // Exceptions: no amount entered, or entered more than what's actually owed
  const amountError =
    settlementMode === 'partial' && partialAmountStr.trim() !== ''
      ? partialAmountPaise <= 0
        ? 'Enter an amount greater than ₹0'
        : partialAmountPaise > absNetPaise
        ? `Can't exceed the ${formatCurrency(absNetPaise)} owed`
        : null
      : null;

  const canSubmit = settlePaise > 0 && settlePaise <= absNetPaise;

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // If friend owes me, friend is payer. If I owe friend, I'm the payer.
    const payerId = isFriendOwingMe ? friendToSettle.id : me.id;

    recordSettlement({
      friendId: friendToSettle.id,
      amountPaise: settlePaise,
      payerId,
      note: note.trim() || undefined,
    });

    closeSettlement();
  };

  const goToProfileForUpi = () => {
    closeSettlement();
    setActiveTab('profile');
  };

  return (
    <BottomSheet
      isOpen={!!friendToSettle}
      onClose={closeSettlement}
      title="Settle Up 💕"
      subtitle={`With ${friendName}`}
      emoji="✨"
    >
      <form onSubmit={handleSettle} className="space-y-6">
        {/* Friend Balance Header */}
        <div className="flex items-center justify-between p-4 rounded-3xl bg-gradient-to-r from-pookie-blush/60 via-white to-pookie-blush/40 border border-pookie-soft">
          <div className="flex items-center gap-3">
            <PookieAvatar
              emoji={friendToSettle.avatarEmoji}
              name={friendName}
              imageSrc={friendToSettle.avatarImage ? `/waifu/${encodeURIComponent(friendToSettle.avatarImage)}` : undefined}
              size="md"
            />
            <div>
              <h4 className="text-sm font-black text-pookie-text">{friendName}</h4>
              <p className="text-xs font-bold text-pookie-muted mt-0.5">
                {isFriendOwingMe
                  ? `${friendName} owes you`
                  : isMeOwingFriend
                  ? `You owe ${friendName}`
                  : "You're already even! ✨"}
              </p>
            </div>
          </div>
          <span
            className={`text-lg sm:text-xl font-black font-mono ${
              isFriendOwingMe ? 'text-emerald-600' : isMeOwingFriend ? 'text-rose-500' : 'text-pookie-text'
            }`}
          >
            {formatCurrency(absNetPaise)}
          </span>
        </div>

        {isAlreadyEven ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">✨</p>
            <h4 className="text-base font-black text-pookie-text">All squared away!</h4>
            <p className="text-xs font-semibold text-pookie-muted mt-1">
              There is no outstanding balance between you and {friendName}.
            </p>
          </div>
        ) : (
          <>
            {/* UPI: pay them, or show them how to pay you */}
            {isMeOwingFriend &&
              (friendUpiId ? (
                <UpiPayCard
                  payeeVpa={friendUpiId}
                  payeeName={friendName}
                  amountRupees={toRupees(settlementMode === 'full' ? absNetPaise : partialAmountPaise)}
                  note={note}
                />
              ) : (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <Wallet2 className="w-4 h-4 shrink-0" />
                  <span>{friendName} hasn&apos;t added a UPI ID yet — settle in person or via note below.</span>
                </div>
              ))}

            {isFriendOwingMe &&
              (myUpiId ? (
                <UpiPayCard
                  payeeVpa={myUpiId}
                  payeeName="You"
                  amountRupees={toRupees(settlementMode === 'full' ? absNetPaise : partialAmountPaise)}
                  note={note}
                  showPayButton={false}
                />
              ) : (
                <button
                  type="button"
                  onClick={goToProfileForUpi}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-pookie-lavenderBg border border-pookie-lavender/40 text-left active:scale-[0.98] transition-all"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-pookie-text">
                    <Wallet2 className="w-4 h-4 text-pookie-primary" />
                    Add your UPI ID so {friendName} can pay you
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-pookie-muted" />
                </button>
              ))}

            {/* Mode selection: Full vs Partial */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-pookie-blush/60 rounded-2xl border border-pookie-soft">
              <button
                type="button"
                onClick={() => setSettlementMode('full')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  settlementMode === 'full'
                    ? 'bg-white text-pookie-dark shadow-xs border border-pookie-soft'
                    : 'text-pookie-muted hover:text-pookie-text'
                }`}
              >
                Full Settle ({formatCurrency(absNetPaise)})
              </button>
              <button
                type="button"
                onClick={() => setSettlementMode('partial')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  settlementMode === 'partial'
                    ? 'bg-white text-pookie-dark shadow-xs border border-pookie-soft'
                    : 'text-pookie-muted hover:text-pookie-text'
                }`}
              >
                Partial Settle
              </button>
            </div>

            {/* Partial Amount Input if selected */}
            {settlementMode === 'partial' && (
              <div>
                <label className="block text-xs font-black uppercase text-pookie-muted tracking-wider mb-2">
                  Amount {isFriendOwingMe ? 'Received' : 'Paid'} in ₹
                </label>
                <AmountInput
                  value={partialAmountStr}
                  onChange={setPartialAmountStr}
                  quickAmounts={[50, 100, 200, Math.floor(toRupees(absNetPaise))]}
                />

                {amountError ? (
                  <p className="mt-3 text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-center">
                    {amountError}
                  </p>
                ) : (
                  <div className="mt-3 p-3 rounded-2xl bg-white border border-pookie-soft flex items-center justify-between text-xs">
                    <span className="font-bold text-pookie-muted">Remaining Balance:</span>
                    <span className="font-black font-mono text-pookie-dark">
                      {formatCurrency(remainingPaise)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Note input */}
            <div>
              <label className="block text-xs font-black uppercase text-pookie-muted tracking-wider mb-1.5">
                Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. GPay / Cash / UPI"
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-pookie-soft text-base sm:text-sm font-semibold text-pookie-text placeholder-pookie-muted/50 focus:outline-none focus:ring-2 focus:ring-pookie-primary"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canSubmit}
                leftIcon={<Sparkles className="w-5 h-5 fill-white stroke-white" />}
              >
                {settlementMode === 'full'
                  ? "Yes, we're even! ✨"
                  : `Record ${formatCurrency(partialAmountPaise)} Settlement 💕`}
              </Button>
              <Button type="button" variant="ghost" size="md" fullWidth onClick={closeSettlement}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </form>
    </BottomSheet>
  );
};
