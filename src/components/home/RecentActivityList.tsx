'use client';

import React from 'react';
import { usePookie } from '@/context/PookieContext';
import { Transaction } from '@/types';
import { CATEGORIES } from '@/lib/sample-data';
import { formatCurrency } from '@/lib/currency';
import { EmptyState } from '../ui/EmptyState';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

interface RecentActivityListProps {
  onSelectTransaction?: (tx: Transaction) => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  onSelectTransaction,
}) => {
  const { todayTransactions, recentTransactions, friends, setActiveTab, openQuickExpense, currentUser } =
    usePookie();
  const me = currentUser!;

  const getCategoryMeta = (catId: string) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const getFriend = (id: string) => {
    if (id === me.id) return me;
    return friends.find((f) => f.id === id);
  };

  const displayList = todayTransactions.length > 0 ? todayTransactions : recentTransactions.slice(0, 5);
  const isShowingToday = todayTransactions.length > 0;

  if (displayList.length === 0) {
    return (
      <EmptyState
        emoji="🎀"
        title="No Pookie drama yet"
        description="Go get some snacks with your friends! Your food court debts will appear here."
        actionLabel="I Got You 💕"
        onAction={() => openQuickExpense()}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base sm:text-lg font-black text-pookie-text tracking-tight flex items-center gap-2">
          <span>{isShowingToday ? "Today's Pookie Activity" : 'Recent Snack Adventures'}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-pookie-blush text-pookie-dark border border-pookie-soft">
            {displayList.length}
          </span>
        </h3>
        <button
          onClick={() => setActiveTab('history')}
          className="text-xs font-bold text-pookie-dark hover:text-pookie-primary flex items-center gap-0.5 transition-colors"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {displayList.map((tx) => {
          const cat = getCategoryMeta(tx.category);
          const payer = getFriend(tx.payerId);
          const isPayerMe = tx.payerId === me.id;

          // Determine beneficiary text
          let relationshipText = '';
          let amountColorClass = 'text-pookie-text';
          let signPrefix = '';

          if (tx.isSettlement && tx.settlementDetails) {
            const receiver = getFriend(tx.settlementDetails.paidToId);
            if (isPayerMe) {
              relationshipText = `You settled with ${receiver?.name || 'Pookie'}`;
              amountColorClass = 'text-pookie-dark';
            } else {
              relationshipText = `${payer?.name || 'Pookie'} settled with You`;
              amountColorClass = 'text-emerald-600';
            }
          } else {
            // Regular expense
            if (isPayerMe) {
              // I paid
              const recipients = tx.splits
                .filter((s) => s.friendId !== me.id)
                .map((s) => getFriend(s.friendId)?.name || 'Pookie');

              if (recipients.length === 1) {
                relationshipText = `You got ${recipients[0]}`;
              } else if (recipients.length > 1) {
                relationshipText = `You got ${recipients.slice(0, 2).join(', ')}${
                  recipients.length > 2 ? ` +${recipients.length - 2}` : ''
                }`;
              } else {
                relationshipText = 'You treated yourself 💅';
              }
              amountColorClass = 'text-emerald-600';
              signPrefix = '+';
            } else {
              // Someone else paid
              const mySplit = tx.splits.find((s) => s.friendId === me.id);
              if (mySplit) {
                relationshipText = `${payer?.name || 'Pookie'} got you`;
                amountColorClass = 'text-rose-500';
                signPrefix = '-';
              } else {
                relationshipText = `${payer?.name || 'Pookie'} paid for group`;
              }
            }
          }

          return (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction && onSelectTransaction(tx)}
              className="flex items-center justify-between p-3.5 sm:p-4 rounded-3xl bg-white border border-pookie-border/80 shadow-pookie-sm hover:border-pookie-accent hover:shadow-pookie active:scale-[0.99] transition-all cursor-pointer group"
            >
              {/* Category Emoji Badge + Title */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-pookie-soft/80 shadow-sm group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: cat.color }}
                >
                  <span>{cat.emoji}</span>
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black text-pookie-text truncate flex items-center gap-1.5">
                    <span>{relationshipText}</span>
                    {tx.isSettlement && <Sparkles className="w-3 h-3 text-pookie-primary" />}
                  </p>
                  <p className="text-[11px] font-semibold text-pookie-muted truncate mt-0.5">
                    {tx.title}
                    {tx.note ? ` · ${tx.note}` : ''}
                  </p>
                </div>
              </div>

              {/* Amount & Time */}
              <div className="text-right shrink-0 ml-3">
                <p className={`text-sm sm:text-base font-black font-mono tracking-tight ${amountColorClass}`}>
                  {signPrefix}
                  {formatCurrency(tx.amountPaise)}
                </p>
                <p className="text-[10px] font-bold text-pookie-muted mt-0.5">
                  {new Date(tx.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

