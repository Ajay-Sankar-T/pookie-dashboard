'use client';

import React from 'react';
import { usePookie } from '@/context/PookieContext';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { PookieAvatar } from '../ui/PookieAvatar';
import { formatCurrency } from '@/lib/currency';
import { CATEGORIES } from '@/lib/sample-data';
import { Sparkles, Heart, Clock, ArrowRight, Trash2 } from 'lucide-react';

export const PersonDetailModal: React.FC = () => {
  const {
    selectedFriendForDetail,
    closePersonDetail,
    transactions,
    balances,
    openSettlement,
    deleteTransaction,
    currentUser,
  } = usePookie();
  const me = currentUser!;

  if (!selectedFriendForDetail) return null;

  const friend = selectedFriendForDetail;
  const friendId = friend.id;
  const balance = balances.find((b) => b.friendId === friendId);
  const netPaise = balance ? balance.netPaise : 0;
  const absNet = Math.abs(netPaise);

  // Filter transactions involving both the logged-in user and this friend
  const sharedTransactions = transactions.filter((tx) => {
    if (tx.isSettlement && tx.settlementDetails) {
      return (
        (tx.payerId === me.id && tx.settlementDetails.paidToId === friendId) ||
        (tx.payerId === friendId && tx.settlementDetails.paidToId === me.id)
      );
    }
    const involvesMe =
      tx.payerId === me.id || tx.splits.some((s) => s.friendId === me.id);
    const involvesFriend =
      tx.payerId === friendId || tx.splits.some((s) => s.friendId === friendId);
    return involvesMe && involvesFriend;
  });

  const getCategory = (id: string) => {
    return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
  };

  return (
    <BottomSheet
      isOpen={!!selectedFriendForDetail}
      onClose={closePersonDetail}
      title={friend.name}
      subtitle={friend.nickname || 'Food court friend'}
      emoji={friend.avatarEmoji}
      maxHeight="max-h-[92vh]"
    >
      <div className="space-y-5">
        {/* Person Balance Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-white via-pookie-blush to-[#FFF0F6] border-2 border-pookie-soft shadow-pookie text-center relative overflow-hidden">
          <div className="inline-flex mb-2">
            <PookieAvatar emoji={friend.avatarEmoji} name={friend.name} imageSrc={friend.avatarImage ? `/waifu/${encodeURIComponent(friend.avatarImage)}` : undefined} size="lg" />
          </div>
          <h3 className="text-xl font-black text-pookie-text font-display">{friend.name}</h3>

          <div className="mt-3">
            {netPaise > 0 ? (
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-600 mb-0.5">
                  {friend.name} owes you
                </p>
                <p className="text-3xl font-black text-emerald-600 font-mono">
                  {formatCurrency(absNet)}
                </p>
              </div>
            ) : netPaise < 0 ? (
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-rose-500 mb-0.5">
                  You owe {friend.name}
                </p>
                <p className="text-3xl font-black text-rose-600 font-mono">
                  {formatCurrency(absNet)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-pookie-muted mb-0.5">
                  You’re all even ✨
                </p>
                <p className="text-2xl font-black text-pookie-text font-mono">₹0</p>
              </div>
            )}
          </div>

          {/* Settle Action Button */}
          {netPaise !== 0 && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4 fill-white stroke-white" />}
                onClick={() => {
                  closePersonDetail();
                  openSettlement(friend);
                }}
              >
                Mark as settled 💕
              </Button>
            </div>
          )}
        </div>

        {/* Complete Shared History */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-xs font-black uppercase text-pookie-muted tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Shared History with {friend.name}</span>
            </h4>
            <span className="text-xs font-bold text-pookie-muted">
              {sharedTransactions.length} records
            </span>
          </div>

          {sharedTransactions.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-pookie-blush/40 border border-pookie-soft">
              <p className="text-xs font-bold text-pookie-muted">
                No shared expenses recorded yet! 🎀
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sharedTransactions.map((tx) => {
                const cat = getCategory(tx.category);
                const isMePayer = tx.payerId === me.id;

                let actionText = '';
                let shareAmountPaise = 0;

                if (tx.isSettlement) {
                  actionText = isMePayer ? `You paid ${friend.name}` : `${friend.name} paid you`;
                  shareAmountPaise = tx.amountPaise;
                } else {
                  if (isMePayer) {
                    const friendSplit = tx.splits.find((s) => s.friendId === friendId);
                    shareAmountPaise = friendSplit ? friendSplit.amountPaise : 0;
                    actionText = `You paid (${friend.name} share)`;
                  } else {
                    const mySplit = tx.splits.find((s) => s.friendId === me.id);
                    shareAmountPaise = mySplit ? mySplit.amountPaise : 0;
                    actionText = `${friend.name} paid (Your share)`;
                  }
                }

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-pookie-soft shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl p-2 rounded-xl bg-pookie-blush shrink-0">
                        {cat.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-pookie-text truncate">{tx.title}</p>
                        <p className="text-[10px] font-bold text-pookie-muted mt-0.5">
                          {actionText} · {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 ml-2">
                      <span className="text-xs font-black font-mono text-pookie-text">
                        {formatCurrency(shareAmountPaise)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 text-pookie-muted hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete expense"
                        aria-label="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

