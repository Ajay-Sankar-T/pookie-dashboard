import { PookieFriend, Transaction, PookieCircle } from '../types';
import { INITIAL_FRIENDS, INITIAL_TRANSACTIONS, INITIAL_CIRCLES } from './sample-data';

const STORAGE_KEYS = {
  FRIENDS: 'pookie_friends_v1',
  TRANSACTIONS: 'pookie_transactions_v1',
  CIRCLES: 'pookie_circles_v1',
  INITIALIZED: 'pookie_initialized_v1',
};

export function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function loadStoredFriends(): PookieFriend[] {
  if (!isClient()) return INITIAL_FRIENDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (!raw) {
      saveStoredFriends(INITIAL_FRIENDS);
      return INITIAL_FRIENDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load friends from localStorage:', err);
    return INITIAL_FRIENDS;
  }
}

export function saveStoredFriends(friends: PookieFriend[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  } catch (err) {
    console.error('Failed to save friends to localStorage:', err);
  }
}

export function loadStoredTransactions(): Transaction[] {
  if (!isClient()) return INITIAL_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveStoredTransactions(INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load transactions from localStorage:', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(txs: Transaction[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch (err) {
    console.error('Failed to save transactions to localStorage:', err);
  }
}

export function loadStoredCircles(): PookieCircle[] {
  if (!isClient()) return INITIAL_CIRCLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CIRCLES);
    if (!raw) {
      saveStoredCircles(INITIAL_CIRCLES);
      return INITIAL_CIRCLES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load circles from localStorage:', err);
    return INITIAL_CIRCLES;
  }
}

export function saveStoredCircles(circles: PookieCircle[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(circles));
  } catch (err) {
    console.error('Failed to save circles to localStorage:', err);
  }
}

export function resetAllToSampleData(): {
  friends: PookieFriend[];
  transactions: Transaction[];
  circles: PookieCircle[];
} {
  if (isClient()) {
    try {
      localStorage.removeItem(STORAGE_KEYS.FRIENDS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.CIRCLES);
    } catch (e) {
      console.error(e);
    }
  }
  saveStoredFriends(INITIAL_FRIENDS);
  saveStoredTransactions(INITIAL_TRANSACTIONS);
  saveStoredCircles(INITIAL_CIRCLES);
  return {
    friends: INITIAL_FRIENDS,
    transactions: INITIAL_TRANSACTIONS,
    circles: INITIAL_CIRCLES,
  };
}

