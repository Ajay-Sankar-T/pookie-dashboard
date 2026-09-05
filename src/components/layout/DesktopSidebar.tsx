'use client';

import React from 'react';
import { usePookie } from '@/context/PookieContext';
import { TabType } from '@/types';
import { Home, Utensils, Scale, ReceiptText, Heart, User } from 'lucide-react';
import { Button } from '../ui/Button';

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, openQuickExpense, overallStatus } = usePookie();

  const navItems: { id: TabType; label: string; icon: React.ReactNode; emoji: string }[] = [
    {
      id: 'home',
      label: 'Home Feed',
      icon: <Home className="w-5 h-5" />,
      emoji: '🏠',
    },
    {
      id: 'foodcourt',
      label: 'Food Court',
      icon: <Utensils className="w-5 h-5" />,
      emoji: '🍔',
    },
    {
      id: 'ledger',
      label: 'Ledger & Balances',
      icon: <Scale className="w-5 h-5" />,
      emoji: '💸',
    },
    {
      id: 'history',
      label: 'All Expenses',
      icon: <ReceiptText className="w-5 h-5" />,
      emoji: '🧾',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      emoji: '🎀',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 p-5 bg-white/70 border-r border-pookie-soft/80 min-h-[calc(100vh-65px)]">
      {/* Primary Action */}
      <div className="mb-6">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<Heart className="w-5 h-5 fill-white stroke-white" />}
          onClick={() => openQuickExpense()}
        >
          I GOT YOU 💕
        </Button>
      </div>

      {/* Navigation Links */}
      <div className="space-y-2">
        <p className="text-[11px] font-black uppercase text-pookie-muted tracking-wider px-3 mb-2">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-150 active:scale-98 ${
                isActive
                  ? 'bg-pookie-blush text-pookie-dark border border-pookie-soft shadow-pookie-sm'
                  : 'text-pookie-text/80 hover:bg-pookie-bg hover:text-pookie-text'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <span>{item.label}</span>
              </div>
              {isActive && <span className="w-2 h-2 rounded-full bg-pookie-primary" />}
            </button>
          );
        })}
      </div>

      {/* Mini status badge */}
      <div className="mt-auto pt-6 border-t border-pookie-soft/60">
        <div className="bg-gradient-to-br from-pookie-blush via-white to-pink-50 p-4 rounded-3xl border border-pookie-soft shadow-pookie-sm">
          <p className="text-xs font-bold text-pookie-muted flex items-center gap-1.5 mb-1">
            <span>✨</span> Your Net Pookie
          </p>
          <p className="text-xl font-black text-pookie-text font-mono">
            {overallStatus.netPaise >= 0 ? '+' : ''}₹{(overallStatus.netPaise / 100).toFixed(0)}
          </p>
          <p className="text-[11px] text-pookie-muted font-medium mt-1">
            {overallStatus.netPaise >= 0
              ? 'Pookies owe you overall 💕'
              : 'You owe friends overall 🥺'}
          </p>
        </div>
      </div>
    </aside>
  );
};

