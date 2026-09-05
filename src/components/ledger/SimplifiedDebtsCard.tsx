'use client';

import React, { useState } from 'react';
import { usePookie } from '@/context/PookieContext';
import { formatCurrency } from '@/lib/currency';
import { PookieAvatar } from '../ui/PookieAvatar';
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export const SimplifiedDebtsCard: React.FC = () => {
  const { simplifiedDebts, activeCircleId, circles } = usePookie();
  const [isOpen, setIsOpen] = useState(false);

  const activeCircle = circles.find((c) => c.id === activeCircleId);

  if (simplifiedDebts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#FFF4FB] via-white to-[#FFF0F6] border-2 border-pookie-soft p-4 sm:p-5 shadow-pookie-sm">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-pookie-soft flex items-center justify-center text-sm shadow-xs">
            <span>✨</span>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-pookie-text tracking-tight flex items-center gap-1.5">
              <span>Smart Settle {activeCircle ? `(${activeCircle.name})` : 'Circle'}</span>
              <span className="text-[10px] bg-pookie-blush text-pookie-dark px-2 py-0.5 rounded-full font-black border border-pookie-soft">
                {simplifiedDebts.length} {simplifiedDebts.length === 1 ? 'step' : 'steps'}
              </span>
            </h4>
            <p className="text-[11px] font-bold text-pookie-muted mt-0.5">
              “We found an easier way to settle everything ✨”
            </p>
          </div>
        </div>

        <button className="p-1.5 text-pookie-muted hover:text-pookie-text rounded-xl hover:bg-pookie-blush">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-3.5 border-t border-pookie-soft/60 space-y-2.5 animate-pop-in">
          {simplifiedDebts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-white border border-pookie-soft/80 shadow-xs"
            >
              {/* From -> To */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5">
                  <PookieAvatar
                    emoji={item.fromFriend.avatarEmoji}
                    name={item.fromFriend.name}
                    imageSrc={item.fromFriend.avatarImage ? `/waifu/${encodeURIComponent(item.fromFriend.avatarImage)}` : undefined}
                    size="xs"
                  />
                  <span className="text-xs font-black text-pookie-text truncate max-w-[70px] sm:max-w-[100px]">
                    {item.fromFriend.name}
                  </span>
                </div>

                <div className="flex items-center text-pookie-muted px-1">
                  <ArrowRight className="w-3.5 h-3.5 text-pookie-primary" />
                </div>

                <div className="flex items-center gap-1.5">
                  <PookieAvatar
                    emoji={item.toFriend.avatarEmoji}
                    name={item.toFriend.name}
                    imageSrc={item.toFriend.avatarImage ? `/waifu/${encodeURIComponent(item.toFriend.avatarImage)}` : undefined}
                    size="xs"
                  />
                  <span className="text-xs font-black text-pookie-text truncate max-w-[70px] sm:max-w-[100px]">
                    {item.toFriend.name}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <span className="text-xs sm:text-sm font-black text-pookie-dark font-mono ml-2">
                {formatCurrency(item.amountPaise)}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-center font-bold text-pookie-muted pt-1">
            Settling these {simplifiedDebts.length} payments balances the entire circle! 💅
          </p>
        </div>
      )}
    </div>
  );
};

