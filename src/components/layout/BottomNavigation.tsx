'use client';

import React from 'react';
import { usePookie } from '@/context/PookieContext';
import { TabType } from '@/types';
import { Home, Utensils, Scale, ReceiptText, Heart } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, openQuickExpense } = usePookie();

  const navItems: { id: TabType; label: string; icon: React.ReactNode; emoji: string }[] = [
    {
      id: 'home',
      label: 'Home',
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
      label: 'Ledger',
      icon: <Scale className="w-5 h-5" />,
      emoji: '💸',
    },
    {
      id: 'history',
      label: 'History',
      icon: <ReceiptText className="w-5 h-5" />,
      emoji: '🧾',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pookie-soft/80 px-2 py-1.5 md:hidden safe-area-pb shadow-lg"
      aria-label="Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* First two tabs: Home & Food Court */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all active:scale-90 ${
                isActive ? 'text-pookie-dark font-black' : 'text-pookie-muted font-semibold'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-pookie-blush text-pookie-primary scale-110' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}

        {/* Primary Hero Center Action: "I GOT YOU 💕" */}
        <div className="flex flex-col items-center justify-center px-1 -mt-5">
          <button
            onClick={() => openQuickExpense()}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-pookie-primary via-[#FF5E9E] to-[#FFA0CA] text-white shadow-pookie border-4 border-white active:scale-95 transition-all"
            aria-label="I Got You - Quick Add Expense"
            title="I Got You 💕"
          >
            <Heart className="w-6 h-6 fill-white stroke-white animate-pulse" />
          </button>
          <span className="text-[10px] font-black text-pookie-dark tracking-tight mt-0.5">
            I Got You 💕
          </span>
        </div>

        {/* Last two tabs: Ledger & History */}
        {navItems.slice(2).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 transition-all active:scale-90 ${
                isActive ? 'text-pookie-dark font-black' : 'text-pookie-muted font-semibold'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-pookie-blush text-pookie-primary scale-110' : ''
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

