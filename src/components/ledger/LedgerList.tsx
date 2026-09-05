'use client';

import React from 'react';
import { usePookie } from '@/context/PookieContext';
import { PookieAvatar } from '../ui/PookieAvatar';
import { formatCurrency } from '@/lib/currency';
import { EmptyState } from '../ui/EmptyState';
import { SimplifiedDebtsCard } from './SimplifiedDebtsCard';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';

export const LedgerList: React.FC = () => {
  const { balances, openPersonDetail, openSettlement } = usePookie();

  if (balances.length === 0) {
    return (
      <EmptyState
        emoji="🎀"
        title="No pookies loaded yet"
        description="Balances with the rest of the squad will show up here."
      />
    );
  }

  const allEven = balances.every((b) => b.netPaise === 0);

  return (
    <div className="space-y-5">
      {/* Smart Circle Debt Simplification banner */}
      <SimplifiedDebtsCard />

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-pookie-text tracking-tight font-display flex items-center gap-2">
            <span>🎩 Your Pookie Blinders</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pookie-blush text-pookie-dark border border-pookie-soft">
              {balances.length} friends
            </span>
          </h3>
          <p className="text-xs font-semibold text-pookie-muted mt-0.5">
            Tap a pookie to see shared food history
          </p>
        </div>
      </div>

      {allEven && (
        <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-center">
          <p className="text-xl mb-1">✨</p>
          <h4 className="text-sm font-black text-emerald-800">All pookies are even ✨</h4>
          <p className="text-xs font-bold text-emerald-700 mt-0.5">Suspiciously responsible.</p>
        </div>
      )}

      {/* Balances List */}
      <div className="space-y-3">
        {balances.map((b) => {
          const friend = b.friend;
          const net = b.netPaise;
          const absNet = Math.abs(net);

          // Card color and microcopy based on balance status
          let statusLabel = '';
          let visualDirection = '';
          let amountColorClass = 'text-pookie-text';
          let borderHighlight = 'border-pookie-border/80';
          let bgGradient = 'bg-white';

          if (net > 0) {
            // Friend owes you
            statusLabel = `${friend.name} owes you`;
            visualDirection = `${friend.name} → You`;
            amountColorClass = 'text-emerald-700';
            borderHighlight = 'border-emerald-200 hover:border-emerald-300';
            bgGradient = 'bg-gradient-to-r from-white via-[#F4FBF8] to-white';
          } else if (net < 0) {
            // You owe friend
            statusLabel = `You owe ${friend.name}`;
            visualDirection = `You → ${friend.name}`;
            amountColorClass = 'text-rose-600';
            borderHighlight = 'border-rose-200 hover:border-rose-300';
            bgGradient = 'bg-gradient-to-r from-white via-[#FFF5F6] to-white';
          } else {
            // Even
            statusLabel = "You're even ✨";
            visualDirection = 'Even balance';
            amountColorClass = 'text-pookie-muted';
            borderHighlight = 'border-pookie-soft/70';
          }

          return (
            <div
              key={friend.id}
              className={`flex items-center justify-between p-4 rounded-3xl border shadow-pookie-sm hover:shadow-pookie transition-all ${bgGradient} ${borderHighlight}`}
            >
              {/* Left: Avatar + Details (clickable to open person history) */}
              <div
                onClick={() => openPersonDetail(friend)}
                className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
              >
                <PookieAvatar emoji={friend.avatarEmoji} name={friend.name} imageSrc={friend.avatarImage ? `/waifu/${encodeURIComponent(friend.avatarImage)}` : undefined} size="md" />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm sm:text-base font-black text-pookie-text truncate">
                      {friend.name}
                    </h4>
                    {friend.nickname && (
                      <span className="text-[10px] font-bold text-pookie-muted hidden sm:inline">
                        ({friend.nickname})
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-pookie-muted mt-0.5 flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-pookie-dark">
                      {visualDirection}
                    </span>
                    <span>·</span>
                    <span>{statusLabel}</span>
                  </p>
                </div>
              </div>

              {/* Right: Amount + Settle Button */}
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <div
                  onClick={() => openPersonDetail(friend)}
                  className="text-right cursor-pointer"
                >
                  <p className={`text-base sm:text-lg font-black font-mono tracking-tight ${amountColorClass}`}>
                    {net === 0 ? '₹0' : formatCurrency(absNet)}
                  </p>
                  <span className="text-[10px] font-bold text-pookie-primary flex items-center justify-end gap-0.5">
                    <span>History</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                {net !== 0 && (
                  <button
                    onClick={() => openSettlement(friend)}
                    className="text-xs font-black px-3 py-2 rounded-2xl bg-pookie-blush text-pookie-dark hover:bg-pookie-primary hover:text-white border border-pookie-soft shadow-xs active:scale-95 transition-all"
                    title={`Settle debt with ${friend.name}`}
                  >
                    Settle 💕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

