export type CategoryType =
  | 'burger'
  | 'pizza'
  | 'fries'
  | 'drink'
  | 'coffee'
  | 'dessert'
  | 'meal'
  | 'snack'
  | 'boba'
  | 'other';

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  emoji: string;
  color: string;
}

export interface PookieFriend {
  id: string;
  name: string;
  nickname?: string;
  avatarEmoji: string;
  avatarImage?: string; // filename within /public/waifu/, e.g. "Alya.png"
  color: string;
  isSelf?: boolean;
  createdAt: string;
}

export interface SplitItem {
  friendId: string;
  amountPaise: number; // Integer minor units (100 paise = 1 INR)
}

export interface Transaction {
  id: string;
  title: string;
  category: CategoryType;
  amountPaise: number; // Total amount in integer paise
  payerId: string; // ID of friend who paid
  splits: SplitItem[]; // Who owes what
  date: string; // ISO string e.g. "2026-09-04T13:42:00Z"
  note?: string;
  circleId?: string; // Optional group/circle ID
  isSettlement?: boolean;
  settlementDetails?: {
    paidToId: string;
    settledAmountPaise: number;
    isFullSettlement: boolean;
  };
  createdAt: number;
}

export interface PookieCircle {
  id: string;
  name: string;
  emoji: string;
  memberIds: string[];
  description?: string;
  createdAt: string;
}

export interface DirectBalance {
  friendId: string;
  friend: PookieFriend;
  netPaise: number; // Positive (> 0): Friend owes You. Negative (< 0): You owe Friend. 0: Even.
  theyOweYouPaise: number;
  youOweThemPaise: number;
  lastActivityDate?: string;
}

export interface OverallStatus {
  youGetPaise: number;
  youOwePaise: number;
  netPaise: number;
}

export interface SimplifiedDebt {
  fromFriend: PookieFriend;
  toFriend: PookieFriend;
  amountPaise: number;
}

export type TabType = 'home' | 'foodcourt' | 'ledger' | 'history' | 'profile';

