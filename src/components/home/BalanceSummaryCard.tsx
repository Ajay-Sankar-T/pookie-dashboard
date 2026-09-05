'use client';

import React from 'react';
import { usePookie } from '@/context/PookieContext';
import { formatCurrency } from '@/lib/currency';
import { Heart } from 'lucide-react';
import { SparkleField } from '@/components/ui/SparkleField';

export const BalanceSummaryCard: React.FC = () => {
  const { overallStatus, openQuickExpense, balances, openSettlement } = usePookie();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Find friend who owes most or you owe most for a quick nudge
  const friendYouOweMost = [...balances]
    .filter((b) => b.netPaise < 0)
    .sort((a, b) => a.netPaise - b.netPaise)[0];

  const friendWhoOwesMost = [...balances]
    .filter((b) => b.netPaise > 0)
    .sort((a, b) => b.netPaise - a.netPaise)[0];

  return (
    <div className="pookie-holo-border relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-pookie-blush/60 to-[#FFEBF3] border-2 border-pookie-soft p-5 sm:p-7 shadow-pookie transition-all">
      <SparkleField count={8} />

      {/* Cute decorative stickers in background */}
      <div className="absolute -top-3 -right-3 text-5xl opacity-20 select-none pointer-events-none rotate-12">
        🎀
      </div>
      <div className="absolute -bottom-4 -left-2 text-4xl opacity-15 select-none pointer-events-none -rotate-12">
        🍓
      </div>

      {/* Greeting Header */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-pookie-soft text-[11px] font-black text-pookie-dark uppercase tracking-wider shadow-sm mb-1.5">
            <span>🎀</span> {getGreeting()}, Pookie
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-pookie-text tracking-tight font-display">
            Your Pookie Status
          </h2>
        </div>

        <button
          onClick={() => openQuickExpense()}
          className="md:hidden flex items-center gap-1.5 bg-pookie-primary hover:bg-pookie-primaryHover text-white text-xs font-black px-3.5 py-2.5 rounded-2xl shadow-pookie active:scale-95 transition-all"
        >
          <Heart className="w-3.5 h-3.5 fill-white stroke-white" />
          <span>+ Add</span>
        </button>
      </div>

      {/* 3 Status Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5 relative z-10">
        {/* You Get Card */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-3xl bg-white/90 border border-pookie-soft shadow-pookie-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-1 text-emerald-600 mb-1">
            <span className="text-sm sm:text-base leading-none">💕</span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-tight">
              You get
            </span>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-black text-pookie-text font-mono tracking-tight">
              {formatCurrency(overallStatus.youGetPaise)}
            </p>
            <p className="text-[10px] text-pookie-muted font-bold mt-0.5 hidden sm:block">
              From friends
            </p>
          </div>
        </div>

        {/* You Owe Card */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-3xl bg-white/90 border border-pookie-soft shadow-pookie-sm hover:border-rose-300 transition-all">
          <div className="flex items-center gap-1 text-rose-500 mb-1">
            <span className="text-sm sm:text-base leading-none">🥺</span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-tight">
              You owe
            </span>
          </div>
          <div>
            <p className="text-lg sm:text-2xl font-black text-pookie-text font-mono tracking-tight">
              {formatCurrency(overallStatus.youOwePaise)}
            </p>
            <p className="text-[10px] text-pookie-muted font-bold mt-0.5 hidden sm:block">
              To friends
            </p>
          </div>
        </div>

        {/* Net Card */}
        <div
          className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-3xl border shadow-pookie-sm transition-all ${
            overallStatus.netPaise >= 0
              ? 'bg-gradient-to-b from-[#EBFBF7] to-white border-emerald-200'
              : 'bg-gradient-to-b from-[#FFF0F2] to-white border-rose-200'
          }`}
        >
          <div className="flex items-center gap-1 text-pookie-dark mb-1">
            <span className="text-sm sm:text-base leading-none">✨</span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-tight">Net</span>
          </div>
          <div>
            <p
              className={`text-lg sm:text-2xl font-black font-mono tracking-tight ${
                overallStatus.netPaise > 0
                  ? 'text-emerald-700'
                  : overallStatus.netPaise < 0
                  ? 'text-rose-600'
                  : 'text-pookie-text'
              }`}
            >
              {formatCurrency(overallStatus.netPaise, { showSign: true })}
            </p>
            <p className="text-[10px] text-pookie-muted font-bold mt-0.5 hidden sm:block">
              {overallStatus.netPaise >= 0 ? "You're in green" : 'Clear your dues'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick contextual tip / nudge */}
      <div className="mt-4 pt-3.5 border-t border-pookie-soft/70 flex items-center justify-between gap-2 text-xs">
        {friendYouOweMost ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">{friendYouOweMost.friend.avatarEmoji}</span>
            <span className="font-semibold text-pookie-text truncate max-w-[200px] sm:max-w-none">
              You owe {friendYouOweMost.friend.name}{' '}
              <strong className="text-rose-600 font-mono">
                {formatCurrency(Math.abs(friendYouOweMost.netPaise))}
              </strong>
            </span>
          </div>
        ) : friendWhoOwesMost ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">{friendWhoOwesMost.friend.avatarEmoji}</span>
            <span className="font-semibold text-pookie-text truncate max-w-[200px] sm:max-w-none">
              {friendWhoOwesMost.friend.name} owes you{' '}
              <strong className="text-emerald-600 font-mono">
                {formatCurrency(friendWhoOwesMost.netPaise)}
              </strong>
            </span>
          </div>
        ) : (
          <span className="text-pookie-muted font-bold flex items-center gap-1.5">
            <span>✨</span> All pookies are even right now!
          </span>
        )}

        {friendYouOweMost && (
          <button
            onClick={() => openSettlement(friendYouOweMost.friend)}
            className="text-[11px] font-black text-pookie-dark bg-white hover:bg-pookie-blush px-3 py-1.5 rounded-xl border border-pookie-soft shadow-xs active:scale-95 transition-all shrink-0"
          >
            Settle 💕
          </button>
        )}
      </div>
    </div>
  );
};

