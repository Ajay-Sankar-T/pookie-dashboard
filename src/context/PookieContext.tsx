'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  PookieFriend,
  Transaction,
  PookieCircle,
  DirectBalance,
  OverallStatus,
  TabType,
} from '@/types';
import {
  INITIAL_FRIENDS,
  INITIAL_TRANSACTIONS,
  INITIAL_CIRCLES,
  FOOD_COURT_CIRCLE_ID,
} from '@/lib/sample-data';
import {
  loadStoredFriends,
  loadStoredTransactions,
  saveStoredTransactions,
  loadStoredCircles,
  resetAllToSampleData,
} from '@/lib/storage';
import { loadSession, saveSession, clearSession } from '@/lib/session';
import { saveProfile as cacheProfileLocally } from '@/lib/profile';
import { WAIFU_AVATARS } from '@/lib/waifu-avatars';
import { loadActivityLastSeen, saveActivityLastSeen } from '@/lib/notifications';
import { MENU, MenuItem } from '@/lib/menu';

interface MemberProfileRecord {
  upiId?: string;
  avatarImage?: string;
}

interface QuickExpensePreset {
  payerId?: string;
  targetFriendIds?: string[];
  category?: string;
  amountRupees?: string;
  title?: string;
  circleId?: string;
}

interface PookieContextType {
  friends: PookieFriend[];
  transactions: Transaction[];
  circles: PookieCircle[];
  activeCircleId: string | null;
  activeTab: TabType;
  selectedFriendForDetail: PookieFriend | null;
  friendToSettle: PookieFriend | null;
  isQuickExpenseOpen: boolean;
  quickExpensePreset: QuickExpensePreset | null;
  toastMessage: string | null;

  // Identity (fixed 11-member login)
  currentUserId: string | null;
  currentUser: PookieFriend | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;

  // Cross-device member profile data (UPI id + chosen avatar), best-effort synced
  memberProfiles: Record<string, MemberProfileRecord>;
  setMyUpiId: (upiId: string) => Promise<void>;
  setMyAvatarImage: (filename: string) => Promise<void>;

  // Food Court Pookies: opt-in subscription + shared activity feed + notifications
  isFoodCourtPookie: boolean;
  foodCourtTransactions: Transaction[];
  notificationTransactions: Transaction[];
  foodCourtUnreadCount: number;
  subscribeFoodCourt: () => Promise<void>;
  unsubscribeFoodCourt: () => Promise<void>;
  markFoodCourtSeen: () => void;

  // Food court menu — shared, editable by any of the 11
  menu: MenuItem[];
  addMenuItem: (item: { name: string; priceRupees: number; category: string; section: string }) => Promise<void>;
  updateMenuItem: (
    id: string,
    patch: Partial<{ name: string; priceRupees: number; category: string; section: string }>
  ) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  // Computed balances & summaries
  balances: DirectBalance[];
  overallStatus: OverallStatus;
  recentTransactions: Transaction[];
  todayTransactions: Transaction[];

  // Actions
  setActiveTab: (tab: TabType) => void;
  setActiveCircleId: (id: string | null) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  recordSettlement: (params: {
    friendId: string;
    amountPaise: number;
    payerId: string; // currentUserId or friendId
    note?: string;
  }) => void;
  openQuickExpense: (preset?: QuickExpensePreset) => void;
  closeQuickExpense: () => void;
  openPersonDetail: (friend: PookieFriend) => void;
  closePersonDetail: () => void;
  openSettlement: (friend: PookieFriend) => void;
  closeSettlement: () => void;
  showToast: (msg: string) => void;
  resetData: () => void;
}

const PookieContext = createContext<PookieContextType | undefined>(undefined);

export const PookieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<PookieFriend[]>(INITIAL_FRIENDS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [circles, setCircles] = useState<PookieCircle[]>(INITIAL_CIRCLES);
  const [menu, setMenu] = useState<MenuItem[]>(MENU);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedFriendForDetail, setSelectedFriendForDetail] = useState<PookieFriend | null>(null);
  const [friendToSettle, setFriendToSettle] = useState<PookieFriend | null>(null);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [quickExpensePreset, setQuickExpensePreset] = useState<QuickExpensePreset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Restore session (which of the 11 members is logged in on this device)
  useEffect(() => {
    const session = loadSession();
    if (session) setCurrentUserId(session.memberId);
    setIsAuthChecked(true);
  }, []);

  // Member UPI/avatar profiles and the shared menu are fetched (and kept
  // fresh) together with friends/transactions/circles in loadData() below.
  const [memberProfiles, setMemberProfiles] = useState<Record<string, MemberProfileRecord>>({});

  // Friends list with each person's chosen avatar (if any) layered on top of
  // their fixed default, so every existing consumer of `friends` just works.
  const friendsWithAvatars = useMemo(
    () =>
      friends.map((f) => ({
        ...f,
        avatarImage: memberProfiles[f.id]?.avatarImage || f.avatarImage,
      })),
    [friends, memberProfiles]
  );

  const currentUser = useMemo(
    () => friendsWithAvatars.find((f) => f.id === currentUserId) || null,
    [friendsWithAvatars, currentUserId]
  );

  const setMyUpiId = useCallback(
    async (upiId: string) => {
      if (!currentUserId) return;
      const trimmed = upiId.trim();
      cacheProfileLocally(currentUserId, trimmed);
      setMemberProfiles((prev) => ({ ...prev, [currentUserId]: { ...prev[currentUserId], upiId: trimmed } }));
      try {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: currentUserId, token: loadSession()?.token, upiId: trimmed }),
        });
      } catch (err) {
        console.warn('Could not sync UPI id to server, kept locally:', err);
      }
    },
    [currentUserId]
  );

  const setMyAvatarImage = useCallback(
    async (filename: string) => {
      if (!currentUserId || !WAIFU_AVATARS.includes(filename)) return;
      setMemberProfiles((prev) => ({ ...prev, [currentUserId]: { ...prev[currentUserId], avatarImage: filename } }));
      try {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: currentUserId, token: loadSession()?.token, avatarImage: filename }),
        });
        showToast('Profile picture updated ✨');
      } catch (err) {
        console.warn('Could not sync avatar to server, kept locally:', err);
      }
    },
    [currentUserId]
  );

  // Food Court Pookies: opt-in circle whose transactions everyone in it can see
  const isFoodCourtPookie = useMemo(
    () =>
      !!currentUserId &&
      !!circles.find((c) => c.id === FOOD_COURT_CIRCLE_ID)?.memberIds.includes(currentUserId),
    [circles, currentUserId]
  );

  const foodCourtTransactions = useMemo(
    () =>
      [...transactions]
        .filter((t) => t.circleId === FOOD_COURT_CIRCLE_ID)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  // Unified notification feed: food court orders (only if subscribed) +
  // personal events that involve you (someone settled with you, or added
  // you to a split) — excluding your own actions.
  const notificationTransactions = useMemo(() => {
    if (!currentUserId) return [];
    return [...transactions]
      .filter((t) => {
        if (t.payerId === currentUserId) return false;
        if (isFoodCourtPookie && t.circleId === FOOD_COURT_CIRCLE_ID) return true;
        if (t.isSettlement) return t.settlementDetails?.paidToId === currentUserId;
        return t.splits.some((s) => s.friendId === currentUserId);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentUserId, isFoodCourtPookie]);

  const [foodCourtLastSeen, setFoodCourtLastSeenState] = useState<string | null>(null);
  useEffect(() => {
    if (currentUserId) setFoodCourtLastSeenState(loadActivityLastSeen(currentUserId));
  }, [currentUserId]);

  const markFoodCourtSeen = useCallback(() => {
    if (!currentUserId) return;
    const now = new Date().toISOString();
    saveActivityLastSeen(currentUserId, now);
    setFoodCourtLastSeenState(now);
  }, [currentUserId]);

  const foodCourtUnreadCount = useMemo(() => {
    if (!foodCourtLastSeen) return 0;
    return notificationTransactions.filter((t) => new Date(t.date) > new Date(foodCourtLastSeen)).length;
  }, [foodCourtLastSeen, notificationTransactions]);

  const subscribeFoodCourt = useCallback(async () => {
    if (!currentUserId) return;
    setCircles((prev) =>
      prev.map((c) =>
        c.id === FOOD_COURT_CIRCLE_ID && !c.memberIds.includes(currentUserId)
          ? { ...c, memberIds: [...c.memberIds, currentUserId] }
          : c
      )
    );
    markFoodCourtSeen();
    try {
      await fetch('/api/food-court', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: currentUserId, token: loadSession()?.token }),
      });
      showToast("Joined Food Court Pookies! You'll see every order now 🍔");
    } catch (err) {
      console.warn('Could not sync Food Court subscription:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, markFoodCourtSeen]);

  const unsubscribeFoodCourt = useCallback(async () => {
    if (!currentUserId) return;
    setCircles((prev) =>
      prev.map((c) =>
        c.id === FOOD_COURT_CIRCLE_ID
          ? { ...c, memberIds: c.memberIds.filter((id) => id !== currentUserId) }
          : c
      )
    );
    try {
      await fetch('/api/food-court', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: currentUserId, token: loadSession()?.token }),
      });
      showToast('Left Food Court Pookies 👋');
    } catch (err) {
      console.warn('Could not sync Food Court unsubscription:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Food court menu mutations — any of the 11 can add/edit/remove items
  const addMenuItem = useCallback(
    async (item: { name: string; priceRupees: number; category: string; section: string }) => {
      if (!currentUserId) return;
      const tempId = `menu-temp-${Date.now()}`;
      const optimistic: MenuItem = { id: tempId, ...item, category: item.category as MenuItem['category'] };
      setMenu((prev) => [...prev, optimistic]);
      try {
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: currentUserId, token: loadSession()?.token, ...item }),
        });
        if (res.ok) {
          const saved = await res.json();
          setMenu((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
          showToast(`Added ${item.name} to the menu! 🍽️`);
        } else {
          setMenu((prev) => prev.filter((m) => m.id !== tempId));
          showToast('Could not add that item 🥺');
        }
      } catch (err) {
        console.warn('Failed to add menu item:', err);
        setMenu((prev) => prev.filter((m) => m.id !== tempId));
        showToast('Could not add that item 🥺');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [currentUserId]
  );

  const updateMenuItem = useCallback(
    async (
      id: string,
      patch: Partial<{ name: string; priceRupees: number; category: string; section: string }>
    ) => {
      if (!currentUserId) return;
      setMenu((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } as MenuItem : m)));
      try {
        const res = await fetch(`/api/menu/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: currentUserId, token: loadSession()?.token, ...patch }),
        });
        if (res.ok) {
          showToast('Menu item updated ✨');
        } else {
          showToast('Could not update that item 🥺');
        }
      } catch (err) {
        console.warn('Failed to update menu item:', err);
        showToast('Could not update that item 🥺');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [currentUserId]
  );

  const deleteMenuItem = useCallback(
    async (id: string) => {
      if (!currentUserId) return;
      const prevMenu = menu;
      setMenu((prev) => prev.filter((m) => m.id !== id));
      try {
        const res = await fetch(`/api/menu/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: currentUserId, token: loadSession()?.token }),
        });
        if (res.ok) {
          showToast('Menu item removed 🗑️');
        } else {
          setMenu(prevMenu);
          showToast('Could not remove that item 🥺');
        }
      } catch (err) {
        console.warn('Failed to delete menu item:', err);
        setMenu(prevMenu);
        showToast('Could not remove that item 🥺');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [currentUserId, menu]
  );

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        saveSession(data.memberId, data.token);
        setCurrentUserId(data.memberId);
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Login failed' };
    } catch (err) {
      console.error('Login request failed:', err);
      return { ok: false, error: 'Could not reach the server. Try again?' };
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUserId(null);
  }, []);

  // Load data from Backend API (with fallback to localStorage/sample data on
  // the very first load only — a failed background poll just keeps whatever
  // we last had rather than reverting to a stale local snapshot).
  const loadData = useCallback(async (isInitialLoad: boolean) => {
    try {
      const [friendsRes, txsRes, circlesRes, profilesRes, menuRes] = await Promise.all([
        fetch('/api/friends'),
        fetch('/api/transactions'),
        fetch('/api/circles'),
        fetch('/api/profile'),
        fetch('/api/menu'),
      ]);

      if (friendsRes.ok && txsRes.ok) {
        const friendsData = await friendsRes.json();
        const txsData = await txsRes.json();
        if (Array.isArray(friendsData) && friendsData.length > 0) {
          setFriends(friendsData);
        }
        if (Array.isArray(txsData) && (txsData.length > 0 || !isInitialLoad)) {
          setTransactions(txsData);
        }
        if (circlesRes.ok) {
          const circlesData = await circlesRes.json();
          if (Array.isArray(circlesData) && circlesData.length > 0) {
            setCircles(circlesData);
          }
        }
        if (profilesRes.ok) {
          const profilesData = await profilesRes.json();
          if (profilesData && typeof profilesData === 'object') setMemberProfiles(profilesData);
        }
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          if (Array.isArray(menuData) && menuData.length > 0) setMenu(menuData);
        }
        return;
      }
    } catch (err) {
      console.warn('API fetch failed:', err);
    }

    if (isInitialLoad) {
      // Local storage fallback, first load only
      setFriends(loadStoredFriends());
      setTransactions(loadStoredTransactions());
      setCircles(loadStoredCircles());
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Poll for changes made by other Pookies every 25s so the shared feeds
  // (food court activity, balances, menu) feel live without websockets.
  // Also refetch immediately when the tab regains focus.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadData(false);
    }, 25000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') loadData(false);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadData]);

  // Auto-dismiss toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Compute pairwise direct balances between Current User ("You") and each friend
  const balances: DirectBalance[] = useMemo(() => {
    const myId = currentUserId;
    if (!myId) return [];
    const otherFriends = friends.filter((f) => f.id !== myId);

    return otherFriends.map((friend) => {
      let theyOweYouPaise = 0;
      let youOweThemPaise = 0;
      let lastActivity: string | undefined;

      const relevantTxs = activeCircleId
        ? transactions.filter((t) => t.circleId === activeCircleId)
        : transactions;

      for (const tx of relevantTxs) {
        if (!lastActivity || new Date(tx.date) > new Date(lastActivity)) {
          lastActivity = tx.date;
        }

        if (tx.isSettlement && tx.settlementDetails) {
          if (tx.payerId === myId && tx.settlementDetails.paidToId === friend.id) {
            youOweThemPaise -= tx.amountPaise;
          } else if (tx.payerId === friend.id && tx.settlementDetails.paidToId === myId) {
            theyOweYouPaise -= tx.amountPaise;
          }
        } else {
          if (tx.payerId === myId) {
            const split = tx.splits.find((s) => s.friendId === friend.id);
            if (split) {
              theyOweYouPaise += split.amountPaise;
            }
          } else if (tx.payerId === friend.id) {
            const split = tx.splits.find((s) => s.friendId === myId);
            if (split) {
              youOweThemPaise += split.amountPaise;
            }
          }
        }
      }

      const netPaise = theyOweYouPaise - youOweThemPaise;

      return {
        friendId: friend.id,
        friend,
        netPaise,
        theyOweYouPaise: Math.max(0, netPaise),
        youOweThemPaise: Math.max(0, -netPaise),
        lastActivityDate: lastActivity,
      };
    });
  }, [friends, transactions, activeCircleId, currentUserId]);

  // Overall status summary
  const overallStatus: OverallStatus = useMemo(() => {
    let youGetPaise = 0;
    let youOwePaise = 0;

    for (const b of balances) {
      if (b.netPaise > 0) {
        youGetPaise += b.netPaise;
      } else if (b.netPaise < 0) {
        youOwePaise += Math.abs(b.netPaise);
      }
    }

    return {
      youGetPaise,
      youOwePaise,
      netPaise: youGetPaise - youOwePaise,
    };
  }, [balances]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    const list = activeCircleId
      ? transactions.filter((t) => t.circleId === activeCircleId)
      : transactions;
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeCircleId]);

  // Today's transactions
  const todayTransactions = useMemo(() => {
    const today = new Date();
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    return recentTransactions.filter((t) => isSameDay(new Date(t.date), today));
  }, [recentTransactions]);

  // Transaction mutations wired to Backend API
  const addTransaction = useCallback(
    async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
      const tempId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const payload: Transaction = {
        ...txData,
        id: tempId,
        createdAt: Date.now(),
      };

      // Optimistic update in UI
      setTransactions((prev) => [payload, ...prev]);

      try {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const savedTx = await res.json();
          setTransactions((prev) =>
            prev.map((t) => (t.id === tempId ? savedTx : t))
          );
          showToast('Pookie debt saved to database! 💕');
          return;
        }
      } catch (err) {
        console.warn('API POST failed, saved locally:', err);
      }

      saveStoredTransactions([payload, ...transactions]);
      showToast('Pookie debt added! 💕');
    },
    [transactions, showToast]
  );

  const updateTransaction = useCallback(
    (updatedTx: Transaction) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
      );
      showToast('Pookie updated! ✨');
    },
    [showToast]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      // Optimistic update
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      try {
        await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('API DELETE failed:', err);
      }

      showToast('Expense removed 🎀');
    },
    [showToast]
  );

  // Settlement mutation
  const recordSettlement = useCallback(
    (params: {
      friendId: string;
      amountPaise: number;
      payerId: string;
      note?: string;
    }) => {
      const friend = friends.find((f) => f.id === params.friendId);
      const isMePayer = params.payerId === currentUserId;
      const receiverId = isMePayer ? params.friendId : currentUserId || '';
      const friendName = friend ? friend.name : 'Pookie';

      const tx: Omit<Transaction, 'id' | 'createdAt'> = {
        title: isMePayer ? `Paid ${friendName} ✨` : `${friendName} paid You ✨`,
        category: 'other',
        amountPaise: params.amountPaise,
        payerId: params.payerId,
        splits: [],
        date: new Date().toISOString(),
        isSettlement: true,
        settlementDetails: {
          paidToId: receiverId,
          settledAmountPaise: params.amountPaise,
          isFullSettlement: false,
        },
        note: params.note || 'Settlement 💕',
        circleId: activeCircleId || undefined,
      };

      addTransaction(tx);
    },
    [friends, activeCircleId, addTransaction, currentUserId]
  );

  // Modal openers
  const openQuickExpense = useCallback((preset?: QuickExpensePreset) => {
    setQuickExpensePreset(preset || null);
    setIsQuickExpenseOpen(true);
  }, []);

  const closeQuickExpense = useCallback(() => {
    setIsQuickExpenseOpen(false);
    setQuickExpensePreset(null);
  }, []);

  const openPersonDetail = useCallback((friend: PookieFriend) => {
    setSelectedFriendForDetail(friend);
  }, []);

  const closePersonDetail = useCallback(() => {
    setSelectedFriendForDetail(null);
  }, []);

  const openSettlement = useCallback((friend: PookieFriend) => {
    setFriendToSettle(friend);
  }, []);

  const closeSettlement = useCallback(() => {
    setFriendToSettle(null);
  }, []);

  const resetData = useCallback(() => {
    const res = resetAllToSampleData();
    setFriends(res.friends);
    setTransactions(res.transactions);
    setCircles(res.circles);
    setActiveCircleId(null);
    setSelectedFriendForDetail(null);
    setFriendToSettle(null);
    showToast('Ledger reset to defaults! 🍓');
  }, [showToast]);

  const value = {
    friends: friendsWithAvatars,
    transactions,
    circles,
    activeCircleId,
    activeTab,
    selectedFriendForDetail,
    friendToSettle,
    isQuickExpenseOpen,
    quickExpensePreset,
    toastMessage,
    currentUserId,
    currentUser,
    isAuthenticated: !!currentUserId,
    isAuthChecked,
    login,
    logout,
    memberProfiles,
    setMyUpiId,
    setMyAvatarImage,
    isFoodCourtPookie,
    foodCourtTransactions,
    notificationTransactions,
    foodCourtUnreadCount,
    subscribeFoodCourt,
    unsubscribeFoodCourt,
    markFoodCourtSeen,
    menu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    balances,
    overallStatus,
    recentTransactions,
    todayTransactions,
    setActiveTab,
    setActiveCircleId,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    recordSettlement,
    openQuickExpense,
    closeQuickExpense,
    openPersonDetail,
    closePersonDetail,
    openSettlement,
    closeSettlement,
    showToast,
    resetData,
  };

  return <PookieContext.Provider value={value}>{children}</PookieContext.Provider>;
};

export const usePookie = () => {
  const ctx = useContext(PookieContext);
  if (!ctx) throw new Error('usePookie must be used within a PookieProvider');
  return ctx;
};
