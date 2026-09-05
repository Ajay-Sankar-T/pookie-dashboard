'use client';

import React, { useState, useMemo } from 'react';
import { usePookie } from '@/context/PookieContext';
import { Transaction } from '@/types';
import { CATEGORIES } from '@/lib/sample-data';
import { formatCurrency } from '@/lib/currency';
import { EmptyState } from '../ui/EmptyState';
import { TransactionDetailModal } from './TransactionDetailModal';
import { Search, Filter, Download, Sparkles, ChevronRight } from 'lucide-react';

export const TransactionFeed: React.FC = () => {
  const {
    transactions,
    friends,
    circles,
    openQuickExpense,
    showToast,
    currentUser,
  } = usePookie();
  const me = currentUser!;

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const getCategoryMeta = (catId: string) => {
    return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const getFriend = (id: string) => {
    if (id === me.id) return me;
    return friends.find((f) => f.id === id);
  };

  // Filter transactions
  const filteredList = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Category filter
        if (selectedCategoryFilter === 'all') return true;
        if (selectedCategoryFilter === 'settlements') return tx.isSettlement;
        if (selectedCategoryFilter === 'food') {
          return ['burger', 'pizza', 'fries', 'meal'].includes(tx.category);
        }
        if (selectedCategoryFilter === 'cafe') {
          return ['coffee', 'drink', 'boba'].includes(tx.category);
        }
        if (selectedCategoryFilter === 'snacks') {
          return ['snack', 'dessert'].includes(tx.category);
        }
        return tx.category === selectedCategoryFilter;
      })
      .filter((tx) => {
        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const payer = getFriend(tx.payerId);
        const inTitle = tx.title.toLowerCase().includes(q);
        const inNote = tx.note ? tx.note.toLowerCase().includes(q) : false;
        const inPayer = payer?.name.toLowerCase().includes(q) || false;
        return inTitle || inNote || inPayer;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedCategoryFilter, searchQuery, friends]);

  // Group by date: Today, Yesterday, Earlier
  const groupedTransactions = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDate = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const groups: { [key: string]: Transaction[] } = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    filteredList.forEach((tx) => {
      const d = new Date(tx.date);
      if (isSameDate(d, today)) {
        groups.Today.push(tx);
      } else if (isSameDate(d, yesterday)) {
        groups.Yesterday.push(tx);
      } else {
        groups.Earlier.push(tx);
      }
    });

    return groups;
  }, [filteredList]);

  const handleExportBackup = () => {
    // Exports what's actually on screen right now (live from the shared
    // database), not a stale local cache — this is a one-way snapshot for
    // your own records, not something you can re-import.
    const snapshot = {
      version: 2,
      exportedAt: new Date().toISOString(),
      friends,
      transactions,
      circles,
    };
    const jsonStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pookie-expenses-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded a copy! 🎀');
  };

  return (
    <div className="space-y-4">
      {/* Header & Backup tools */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-pookie-text tracking-tight font-display">
            🧾 Pookie History
          </h3>
          <p className="text-xs font-semibold text-pookie-muted mt-0.5">
            {transactions.length} total snack adventures
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="p-2 text-xs font-bold text-pookie-muted hover:text-pookie-dark bg-white hover:bg-pookie-blush rounded-xl border border-pookie-soft shadow-xs transition-all shrink-0"
          title="Download a copy as JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search burger, boba, Rahul, cafe..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-pookie-soft text-base sm:text-sm font-semibold text-pookie-text placeholder-pookie-muted/50 focus:outline-none focus:ring-2 focus:ring-pookie-primary shadow-xs"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pookie-muted">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All 🌸' },
          { id: 'food', label: 'Food 🍔' },
          { id: 'cafe', label: 'Café & Boba 🧋' },
          { id: 'snacks', label: 'Snacks 🍿' },
          { id: 'settlements', label: 'Settlements ✨' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedCategoryFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all select-none active:scale-95 ${
              selectedCategoryFilter === f.id
                ? 'bg-pookie-primary text-white shadow-pookie-sm'
                : 'bg-white text-pookie-muted border border-pookie-soft hover:bg-pookie-blush hover:text-pookie-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List / Grouped view */}
      {filteredList.length === 0 ? (
        <EmptyState
          emoji="🎀"
          title="Nothing here yet 🎀"
          description="Your snack adventures and debt settlements will appear here."
          actionLabel="Add Snack 💕"
          onAction={() => openQuickExpense()}
        />
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedTransactions).map(([groupTitle, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={groupTitle} className="space-y-2">
                <h4 className="text-xs font-black uppercase text-pookie-muted tracking-wider px-1">
                  {groupTitle}
                </h4>

                <div className="space-y-2">
                  {items.map((tx) => {
                    const cat = getCategoryMeta(tx.category);
                    const payer = getFriend(tx.payerId);
                    const isPayerMe = tx.payerId === me.id;

                    let summaryDesc = '';
                    let amountColor = 'text-pookie-text';

                    if (tx.isSettlement && tx.settlementDetails) {
                      const receiver = getFriend(tx.settlementDetails.paidToId);
                      summaryDesc = isPayerMe
                        ? `You settled with ${receiver?.name || 'Pookie'}`
                        : `${payer?.name || 'Pookie'} settled with You`;
                      amountColor = 'text-pookie-dark';
                    } else {
                      if (isPayerMe) {
                        summaryDesc = 'You paid';
                        amountColor = 'text-emerald-600';
                      } else {
                        summaryDesc = `${payer?.name || 'Pookie'} paid`;
                        amountColor = 'text-rose-500';
                      }
                    }

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="flex items-center justify-between p-3.5 rounded-3xl bg-white border border-pookie-border/80 shadow-pookie-sm hover:border-pookie-accent hover:shadow-pookie active:scale-[0.99] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 border border-pookie-soft shadow-xs group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: cat.color }}
                          >
                            <span>{cat.emoji}</span>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-black text-pookie-text truncate flex items-center gap-1.5">
                              <span>{tx.title}</span>
                              {tx.isSettlement && <Sparkles className="w-3 h-3 text-pookie-primary" />}
                            </p>
                            <p className="text-[11px] font-semibold text-pookie-muted truncate mt-0.5">
                              {summaryDesc}
                              {tx.note ? ` · ${tx.note}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <p className={`text-xs sm:text-sm font-black font-mono ${amountColor}`}>
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
          })}
        </div>
      )}

      {/* Transaction Detail Sheet */}
      <TransactionDetailModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};

