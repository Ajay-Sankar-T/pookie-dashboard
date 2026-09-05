'use client';

import React, { useState } from 'react';
import { usePookie } from '@/context/PookieContext';
import { Button } from '../ui/Button';
import { PookieAvatar } from '../ui/PookieAvatar';
import { formatCurrency } from '@/lib/currency';
import { Heart, Bell, BellOff, Users, Sparkles, Pencil, Plus, Check } from 'lucide-react';
import { SparkleField } from '../ui/SparkleField';
import { WaifuMascot } from '../ui/WaifuMascot';
import { MenuItem } from '@/lib/menu';
import { FOOD_COURT_CIRCLE_ID } from '@/lib/sample-data';
import { MenuItemModal } from './MenuItemModal';

export const FoodCourtHero: React.FC = () => {
  const {
    openQuickExpense,
    friends,
    transactions,
    currentUserId,
    isFoodCourtPookie,
    foodCourtTransactions,
    subscribeFoodCourt,
    unsubscribeFoodCourt,
    markFoodCourtSeen,
    circles,
    menu,
  } = usePookie();

  const menuSections = Array.from(new Set(menu.map((m) => m.section)));
  const [activeSection, setActiveSection] = useState<string>(menuSections[0] || '');
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const foodCourtCircle = circles.find((c) => c.id === FOOD_COURT_CIRCLE_ID);
  const subscriberCount = foodCourtCircle?.memberIds.length || 0;

  // Calculate Food Court total spent
  const foodCourtTotalPaise = transactions
    .filter((t) => !t.isSettlement)
    .reduce((acc, t) => acc + t.amountPaise, 0);

  const handleOrder = (item: MenuItem) => {
    const firstOther = friends.find((f) => f.id !== currentUserId);
    openQuickExpense({
      payerId: currentUserId || undefined,
      targetFriendIds: firstOther ? [firstOther.id] : [],
      category: item.category,
      amountRupees: String(item.priceRupees),
      title: item.name,
      circleId: FOOD_COURT_CIRCLE_ID,
    });
  };

  const getFriend = (id: string) => friends.find((f) => f.id === id);

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="pookie-holo-border relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#FFF0F6] via-white to-[#FFE5F0] border-2 border-pookie-soft p-6 sm:p-8 shadow-pookie">
        <SparkleField count={10} />

        {/* Floating food stickers */}
        <div className="absolute top-2 right-4 text-4xl opacity-20 pointer-events-none rotate-12">
          🍔
        </div>
        <div className="absolute bottom-2 left-6 text-3xl opacity-15 pointer-events-none -rotate-12">
          🍟
        </div>
        <div className="absolute bottom-3 right-16 text-3xl opacity-20 pointer-events-none rotate-45">
          🧋
        </div>
        <div className="hidden sm:block absolute -bottom-2 right-6 w-24 h-24 opacity-90">
          <WaifuMascot pose="chibi" sizeClassName="w-24 h-24" />
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-pookie-soft text-[11px] font-black text-pookie-dark uppercase tracking-wider shadow-sm mb-2">
            <span>✨</span> Campus Canteen & Treats
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-pookie-text tracking-tight font-display mb-1.5">
            🍔 Food Court
          </h1>
          <p className="text-xs sm:text-sm font-bold text-pookie-muted leading-relaxed mb-5">
            “Because someone always says <span className="text-pookie-dark font-black">‘I’ll pay’ 💕</span>”
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Heart className="w-5 h-5 fill-white stroke-white animate-heartbeat" />}
              onClick={() => openQuickExpense({ circleId: FOOD_COURT_CIRCLE_ID })}
              className="sm:w-auto"
            >
              💕 I GOT YOU
            </Button>

            <div className="flex items-center justify-between sm:justify-start gap-3 px-4 py-2 rounded-2xl bg-white/80 border border-pookie-soft shadow-xs text-xs font-bold text-pookie-muted">
              <span>Total Treats Tracked:</span>
              <span className="text-sm font-black text-pookie-dark font-mono">
                {formatCurrency(foodCourtTotalPaise)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Food Court Pookies subscribe banner */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-pookie-soft shadow-pookie-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-pookie-blush flex items-center justify-center text-lg shrink-0">
            <Users className="w-5 h-5 text-pookie-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-pookie-text flex items-center gap-1.5">
              <span>Food Court Pookies</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pookie-blush text-pookie-dark border border-pookie-soft shrink-0">
                {subscriberCount}
              </span>
            </h4>
            <p className="text-[11px] font-bold text-pookie-muted truncate">
              {isFoodCourtPookie
                ? "You'll see & get notified about everyone's orders 🔔"
                : 'Opt in to see (and be notified of) every order, from everyone'}
            </p>
          </div>
        </div>

        <button
          onClick={() => (isFoodCourtPookie ? unsubscribeFoodCourt() : subscribeFoodCourt())}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black shrink-0 active:scale-95 transition-all ${
            isFoodCourtPookie
              ? 'bg-pookie-blush text-pookie-dark border border-pookie-soft hover:bg-rose-50 hover:text-rose-600'
              : 'bg-gradient-to-r from-pookie-primary to-[#FF5E9E] text-white shadow-pookie'
          }`}
        >
          {isFoodCourtPookie ? (
            <>
              <BellOff className="w-3.5 h-3.5" /> Leave
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5" /> Subscribe
            </>
          )}
        </button>
      </div>

      {/* Menu */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black uppercase text-pookie-muted tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pookie-primary fill-pookie-primary" />
            <span>Canteen Menu</span>
          </h3>
          <button
            onClick={() => setIsEditingMenu((v) => !v)}
            className={`flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-xl transition-all active:scale-95 ${
              isEditingMenu
                ? 'bg-pookie-primary text-white shadow-xs'
                : 'bg-white text-pookie-muted border border-pookie-soft hover:text-pookie-text'
            }`}
          >
            {isEditingMenu ? (
              <>
                <Check className="w-3.5 h-3.5" /> Done
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" /> Edit menu
              </>
            )}
          </button>
        </div>

        {/* Section tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {menuSections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 transition-all active:scale-95 whitespace-nowrap ${
                activeSection === section
                  ? 'bg-pookie-primary text-white shadow-pookie-sm'
                  : 'bg-white text-pookie-muted border border-pookie-soft hover:bg-pookie-blush hover:text-pookie-text'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {menu
            .filter((m) => m.section === activeSection)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => (isEditingMenu ? setEditingItem(item) : handleOrder(item))}
                className={`relative flex flex-col items-start p-3.5 rounded-3xl bg-white border shadow-pookie-sm hover:shadow-pookie active:scale-95 transition-all text-left group ${
                  isEditingMenu ? 'border-dashed border-pookie-primary/60' : 'border-pookie-soft hover:border-pookie-primary'
                }`}
              >
                {isEditingMenu && (
                  <Pencil className="absolute top-2.5 right-2.5 w-3 h-3 text-pookie-primary" />
                )}
                <p className="text-xs font-black text-pookie-text leading-snug pr-4">{item.name}</p>
                <div className="flex items-center justify-between w-full mt-2 pt-1.5 border-t border-pookie-soft/60">
                  <span className="text-xs font-black text-pookie-dark font-mono">
                    ₹{item.priceRupees}
                  </span>
                  {!isEditingMenu && (
                    <span className="text-[10px] font-bold text-pookie-primary group-hover:translate-x-0.5 transition-transform">
                      Add →
                    </span>
                  )}
                </div>
              </button>
            ))}

          {isEditingMenu && (
            <button
              onClick={() => setIsAddingItem(true)}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-3xl bg-pookie-blush/40 border-2 border-dashed border-pookie-soft hover:border-pookie-primary active:scale-95 transition-all min-h-[76px]"
            >
              <Plus className="w-5 h-5 text-pookie-primary" />
              <span className="text-[11px] font-black text-pookie-dark">Add item</span>
            </button>
          )}
        </div>
      </div>

      <MenuItemModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />
      <MenuItemModal
        item={null}
        defaultSection={activeSection}
        isOpen={isAddingItem}
        onClose={() => setIsAddingItem(false)}
      />

      {/* Food Court Activity Feed — visible to subscribers only */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase text-pookie-muted tracking-wider px-1 flex items-center gap-1.5">
          <span>🍔</span>
          <span>Food Court Activity</span>
        </h3>

        {!isFoodCourtPookie ? (
          <div className="p-6 rounded-3xl bg-gradient-to-b from-white via-pookie-blush/40 to-white border-2 border-dashed border-pookie-soft text-center">
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-xs font-bold text-pookie-muted max-w-xs mx-auto">
              Subscribe to Food Court Pookies to see every order everyone's placed — not just yours.
            </p>
          </div>
        ) : foodCourtTransactions.length === 0 ? (
          <div className="p-6 rounded-3xl bg-gradient-to-b from-white via-pookie-blush/40 to-white border-2 border-dashed border-pookie-soft text-center">
            <p className="text-2xl mb-2">🍽️</p>
            <p className="text-xs font-bold text-pookie-muted">No orders yet — be the first!</p>
          </div>
        ) : (
          <div className="space-y-2.5" onMouseEnter={markFoodCourtSeen} onTouchStart={markFoodCourtSeen}>
            {foodCourtTransactions.map((tx) => {
              const payer = getFriend(tx.payerId);
              const isMe = tx.payerId === currentUserId;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-3xl bg-white border border-pookie-border/80 shadow-pookie-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PookieAvatar
                      emoji={payer?.avatarEmoji}
                      imageSrc={payer?.avatarImage ? `/waifu/${encodeURIComponent(payer.avatarImage)}` : undefined}
                      name={payer?.name || 'Pookie'}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-pookie-text truncate">
                        {isMe ? 'You' : payer?.name || 'Someone'} got {tx.title}
                      </p>
                      <p className="text-[11px] font-semibold text-pookie-muted truncate mt-0.5">
                        {tx.splits.length > 0
                          ? `Split with ${tx.splits
                              .map((s) => (s.friendId === currentUserId ? 'you' : getFriend(s.friendId)?.name || 'Pookie'))
                              .join(', ')}`
                          : 'Solo treat'}
                        {' · '}
                        {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-pookie-dark font-mono shrink-0 ml-2">
                    {formatCurrency(tx.amountPaise)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
