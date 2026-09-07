'use client';

import React, { useEffect, useState } from 'react';
import { usePookie } from '@/context/PookieContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { BalanceSummaryCard } from '@/components/home/BalanceSummaryCard';
import { RecentActivityList } from '@/components/home/RecentActivityList';
import { FoodCourtHero } from '@/components/foodcourt/FoodCourtHero';
import { LedgerList } from '@/components/ledger/LedgerList';
import { TransactionFeed } from '@/components/history/TransactionFeed';
import { QuickExpenseModal } from '@/components/foodcourt/QuickExpenseModal';
import { SettlementModal } from '@/components/ledger/SettlementModal';
import { PersonDetailModal } from '@/components/ledger/PersonDetailModal';
import { TransactionDetailModal } from '@/components/history/TransactionDetailModal';
import { Toast } from '@/components/ui/Toast';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import { PookieHub } from '@/components/hub/PookieHub';
import { ProfileTab } from '@/components/profile/ProfileTab';
import { Transaction } from '@/types';
import { Heart } from 'lucide-react';
import { hasSeenUpiStep } from '@/lib/profile';

type Screen = 'onboarding' | 'hub' | 'app';

export default function Home() {
  const {
    activeTab,
    openQuickExpense,
    toastMessage,
    isAuthenticated,
    isAuthChecked,
    currentUser,
    memberProfiles,
  } = usePookie();

  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);
  const [screen, setScreen] = useState<Screen | null>(null);

  useEffect(() => {
    if (!isAuthChecked) return;
    if (!isAuthenticated) {
      setScreen('onboarding');
      return;
    }
    // UPI is optional — just make sure they've been through the onboarding
    // step once (whether they added one or skipped it).
    if (currentUser && !hasSeenUpiStep(currentUser.id) && !memberProfiles[currentUser.id]?.upiId) {
      setScreen('onboarding');
      return;
    }
    setScreen((prev) => (prev === 'app' ? 'app' : 'hub'));
  }, [isAuthChecked, isAuthenticated, currentUser, memberProfiles]);

  if (screen === null) {
    return <div className="min-h-screen bg-pookie-bg" />;
  }

  if (screen === 'onboarding') {
    return <WelcomeOnboarding onComplete={() => setScreen('hub')} />;
  }

  if (screen === 'hub') {
    return <PookieHub onOpenApp={() => setScreen('app')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-pookie-bg pb-28 md:pb-8">
      {/* Top Header */}
      <AppHeader onBackToHub={() => setScreen('hub')} />

      {/* Main Responsive Shell: Centered & Cohesive */}
      <div className="max-w-5xl w-full mx-auto flex-1 flex">
        {/* Desktop / Tablet Sidebar */}
        <DesktopSidebar />

        {/* Dynamic Main Content Area */}
        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-5 sm:px-6 sm:py-6 space-y-6">
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-pop-in">
              {/* Balance Summary Card */}
              <BalanceSummaryCard />

              {/* Quick 1-Tap Action Banner */}
              <div className="flex items-center justify-between p-4 rounded-3xl bg-white border border-pookie-soft shadow-pookie-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pookie-blush flex items-center justify-center text-lg">
                    <span>🍔</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-pookie-text">
                      Someone got food?
                    </h4>
                    <p className="text-[11px] font-bold text-pookie-muted">
                      Log it before everyone forgets 💕
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openQuickExpense()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pookie-primary to-[#FF5E9E] text-white text-xs font-black shadow-pookie active:scale-95 transition-all"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>I Got You</span>
                </button>
              </div>

              {/* Recent Activity List */}
              <RecentActivityList onSelectTransaction={(tx) => setSelectedTxForDetail(tx)} />

              {/* Cute Footer Note */}
              <div className="pt-6 pb-2 text-center text-xs font-bold text-pookie-muted/70 flex items-center justify-center gap-1.5 select-none">
                <span>🎀</span>
                <span>Pookie Expenses · Tiny expenses, no drama 💅</span>
                <span>✨</span>
              </div>
            </div>
          )}

          {/* TAB 2: FOOD COURT (HERO FEATURE) */}
          {activeTab === 'foodcourt' && (
            <div className="animate-pop-in">
              <FoodCourtHero />
            </div>
          )}

          {/* TAB 3: LEDGER */}
          {activeTab === 'ledger' && (
            <div className="animate-pop-in">
              <LedgerList />
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="animate-pop-in">
              <TransactionFeed />
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="animate-pop-in">
              <ProfileTab />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Global Modals & Toasts */}
      <QuickExpenseModal />
      <SettlementModal />
      <PersonDetailModal />
      <TransactionDetailModal
        transaction={selectedTxForDetail}
        onClose={() => setSelectedTxForDetail(null)}
      />
      <Toast message={toastMessage} />
    </div>
  );
}

