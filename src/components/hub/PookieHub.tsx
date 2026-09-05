'use client';

import React from 'react';
import { usePookie } from '@/context/PookieContext';
import { Wallet2, Mail, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { WaifuMascot } from '../ui/WaifuMascot';
import { SparkleField } from '../ui/SparkleField';
import { findMemberById } from '@/lib/members';

interface PookieHubProps {
  onOpenApp: (appId: 'expenses') => void;
}

export const PookieHub: React.FC<PookieHubProps> = ({ onOpenApp }) => {
  const { currentUser, memberProfiles } = usePookie();
  const member = currentUser ? findMemberById(currentUser.id) : undefined;
  const savedUpi = currentUser ? memberProfiles[currentUser.id]?.upiId : undefined;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#FFF3F8] via-[#FBF2FF] to-[#EDF7FF] safe-area-pt safe-area-pb safe-area-px pb-16">
      <SparkleField count={16} />

      {/* Scattered floating chibis */}
      <div className="hidden sm:block absolute top-16 left-6 w-16 h-16 animate-chibi-bob opacity-90">
        <WaifuMascot pose="chibi" sizeClassName="w-16 h-16" floaty={false} />
      </div>
      <div className="hidden md:block absolute top-40 right-10 w-14 h-14 animate-chibi-bob [animation-delay:1s] opacity-90">
        <WaifuMascot pose="chibi" sizeClassName="w-14 h-14" floaty={false} />
      </div>
      <div className="hidden sm:block absolute bottom-24 left-16 w-12 h-12 animate-chibi-bob [animation-delay:2s] opacity-80">
        <WaifuMascot pose="chibi" sizeClassName="w-12 h-12" floaty={false} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Header greeting */}
        <div className="flex flex-col items-center text-center mb-8">
          <WaifuMascot pose="greet" sizeClassName="w-24 h-24 sm:w-28 sm:h-28" />
          <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white/80 border border-pookie-soft text-[11px] font-black text-pookie-dark uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3" /> {getGreeting()}, Pookie
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-pookie-text font-kawaii tracking-tight">
            Pookie Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-bold text-pookie-muted mt-1">
            Your cute little corner of apps 🎀
          </p>
        </div>

        {/* Profile chip */}
        {currentUser && (
          <div className="pookie-holo-border rounded-3xl bg-white/85 backdrop-blur-sm border border-pookie-soft shadow-pookie-sm px-4 sm:px-5 py-3 mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 max-w-lg mx-auto">
            {member && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-pookie-text">
                <Mail className="w-3.5 h-3.5 text-pookie-primary" />
                <span className="truncate max-w-[180px]">{member.email}</span>
              </div>
            )}
            {savedUpi && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-pookie-text">
                <Wallet2 className="w-3.5 h-3.5 text-pookie-primary" />
                <span className="truncate max-w-[180px]">{savedUpi}</span>
              </div>
            )}
          </div>
        )}

        {/* App tiles */}
        <div>
          <p className="text-[11px] font-black uppercase text-pookie-muted tracking-wider px-1 mb-3">
            Your Pookie Apps
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expense Tracker tile */}
            <button
              onClick={() => onOpenApp('expenses')}
              className="pookie-glossy group text-left relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-pookie-blush/60 to-[#FFE5F0] border-2 border-pookie-soft shadow-pookie hover:shadow-pookie-glow p-5 sm:p-6 transition-all active:scale-[0.98]"
            >
              <div className="absolute -top-2 -right-2 text-4xl opacity-20 rotate-12 pointer-events-none select-none">
                🎀
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-pookie-soft shadow-pookie-sm flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                💸
              </div>
              <h3 className="text-base sm:text-lg font-black text-pookie-text font-kawaii">
                Pookie Expenses
              </h3>
              <p className="text-xs font-semibold text-pookie-muted mt-1 leading-relaxed">
                Track food court IOUs & settle up with your circle, no drama.
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-xs font-black text-pookie-dark group-hover:translate-x-0.5 transition-transform">
                Enter app <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            {/* Coming soon tile */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white/50 border-2 border-dashed border-pookie-soft p-5 sm:p-6 flex flex-col items-start justify-center opacity-70">
              <div className="w-12 h-12 rounded-2xl bg-white border border-pookie-soft flex items-center justify-center text-xl mb-3 text-pookie-muted">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-pookie-muted font-kawaii">
                More Pookie apps
              </h3>
              <p className="text-xs font-semibold text-pookie-muted/80 mt-1">Coming soon ✨</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
