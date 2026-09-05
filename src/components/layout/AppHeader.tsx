'use client';

import React, { useState } from 'react';
import { usePookie } from '@/context/PookieContext';
import { PookieAvatar } from '../ui/PookieAvatar';
import { Users, LayoutGrid, Bell } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface AppHeaderProps {
  onBackToHub?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onBackToHub }) => {
  const {
    circles,
    activeCircleId,
    setActiveCircleId,
    currentUser,
    currentUserId,
    setActiveTab,
    friends,
    notificationTransactions,
    foodCourtUnreadCount,
    markFoodCourtSeen,
  } = usePookie();

  const getFriendName = (id: string) =>
    id === currentUserId ? 'You' : friends.find((f) => f.id === id)?.name || 'Someone';

  const describeNotification = (tx: (typeof notificationTransactions)[number]) => {
    if (tx.isSettlement) {
      return `${getFriendName(tx.payerId)} settled up with you ✨`;
    }
    return `${getFriendName(tx.payerId)} got ${tx.title}`;
  };

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full pookie-glass border-b border-pookie-soft/60 safe-area-pt px-3 sm:px-4 py-2 sm:py-3 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="flex-shrink-0 p-2 rounded-2xl text-pookie-muted hover:text-pookie-dark hover:bg-pookie-blush transition-all active:scale-90"
              title="Back to Pookie Dashboard"
              aria-label="Back to Pookie Dashboard"
            >
              <LayoutGrid className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          )}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pookie-primary to-[#FF87BE] flex items-center justify-center text-white shadow-pookie-sm border border-white/60 flex-shrink-0">
            <span className="text-lg sm:text-xl leading-none">🎀</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm sm:text-lg font-black text-pookie-text tracking-tight font-display truncate">
                Pookie
              </span>
              <span className="hidden sm:inline text-xs text-pookie-primary font-handwriting font-bold whitespace-nowrap">
                Expenses 💕
              </span>
            </div>
            <p className="hidden sm:block text-[10px] font-bold text-pookie-muted tracking-wide uppercase truncate">
              Food court diary ✨
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Circle Selector Pill */}
          <div className="relative shrink-0">
            <select
              value={activeCircleId || ''}
              onChange={(e) => setActiveCircleId(e.target.value ? e.target.value : null)}
              className="appearance-none bg-white text-pookie-text text-[11px] sm:text-xs font-black pl-2.5 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2 rounded-2xl border border-pookie-soft shadow-sm focus:outline-none focus:ring-2 focus:ring-pookie-primary cursor-pointer max-w-[92px] sm:max-w-[190px] truncate"
              aria-label="Filter by Pookie Circle"
            >
              <option value="">🎩 Pookie Blinders</option>
              {circles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 sm:pr-2.5 text-pookie-muted">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          {/* Notification bell: food court orders (if subscribed) + your own ledger events */}
          {currentUser && (
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setIsNotifOpen((v) => !v);
                  markFoodCourtSeen();
                }}
                className="relative p-2 rounded-2xl text-pookie-muted hover:text-pookie-dark hover:bg-pookie-blush transition-all active:scale-90"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {foodCourtUnreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-pookie-primary text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                    {foodCourtUnreadCount > 9 ? '9+' : foodCourtUnreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto rounded-3xl bg-white border border-pookie-soft shadow-pookie-lg z-50 animate-pop-in">
                    <div className="px-4 py-3 border-b border-pookie-soft/70 bg-pookie-blush/50 rounded-t-3xl">
                      <p className="text-xs font-black text-pookie-dark">🔔 Activity</p>
                    </div>
                    {notificationTransactions.length === 0 ? (
                      <p className="text-xs font-bold text-pookie-muted text-center py-6 px-4">
                        Nothing new — you're all caught up!
                      </p>
                    ) : (
                      <div className="p-2 space-y-1">
                        {notificationTransactions.slice(0, 10).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between px-2.5 py-2 rounded-2xl hover:bg-pookie-blush/40">
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-pookie-text truncate">
                                {describeNotification(tx)}
                              </p>
                              <p className="text-[10px] font-semibold text-pookie-muted">
                                {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className="text-[11px] font-black text-pookie-dark font-mono shrink-0 ml-2">
                              {formatCurrency(tx.amountPaise)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Profile chip -> Profile tab */}
          {currentUser && (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center shrink-0 rounded-2xl hover:ring-2 hover:ring-pookie-soft transition-all active:scale-90"
              title="Your profile"
              aria-label="Open your profile"
            >
              <PookieAvatar emoji={currentUser.avatarEmoji} name={currentUser.name} imageSrc={currentUser.avatarImage ? `/waifu/${encodeURIComponent(currentUser.avatarImage)}` : undefined} size="md" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
