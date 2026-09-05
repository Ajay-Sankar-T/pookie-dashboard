import { PookieFriend, Transaction, PookieCircle, CategoryMeta } from '../types';
import { MEMBERS, memberToFriend } from './members';

// The 11 real members are the only "friends" in this closed app. No sample
// people, no fake balances.
export const INITIAL_FRIENDS: PookieFriend[] = MEMBERS.map(memberToFriend);

export const FOOD_COURT_CIRCLE_ID = 'circle-food-court-pookies';

export const INITIAL_CIRCLES: PookieCircle[] = [
  {
    id: 'circle-all-pookies',
    name: 'Pookie Blinders',
    emoji: '🎩',
    memberIds: INITIAL_FRIENDS.map((f) => f.id),
    description: 'The whole squad',
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: FOOD_COURT_CIRCLE_ID,
    name: 'Food Court Pookies',
    emoji: '🍔',
    memberIds: [],
    description: 'Opt-in — see every food court order, from everyone',
    createdAt: '2026-09-01T00:00:00Z',
  },
];

export const CATEGORIES: CategoryMeta[] = [
  { id: 'burger', label: 'Burger', emoji: '🍔', color: '#FFEDD5' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕', color: '#FFE4E6' },
  { id: 'fries', label: 'Fries', emoji: '🍟', color: '#FEF3C7' },
  { id: 'drink', label: 'Drink', emoji: '🥤', color: '#E0F2FE' },
  { id: 'coffee', label: 'Coffee', emoji: '☕', color: '#F3E8FF' },
  { id: 'dessert', label: 'Dessert', emoji: '🍰', color: '#FCE7F3' },
  { id: 'meal', label: 'Meal', emoji: '🍛', color: '#FEF08A' },
  { id: 'snack', label: 'Snack', emoji: '🍿', color: '#FFEDD5' },
  { id: 'boba', label: 'Boba', emoji: '🧋', color: '#EDE9FE' },
  { id: 'other', label: 'Other', emoji: '✨', color: '#F3F4F6' },
];

// Fresh ledger — no fabricated expenses among real people.
export const INITIAL_TRANSACTIONS: Transaction[] = [];
