import { Timestamp } from 'firebase/firestore';

export type SplitType = 'equal' | 'percentage' | 'custom';

export interface SplitDetail {
  userId: string;
  displayName: string;
  share: number;
  percentage?: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  members: string[];
  memberNames: Record<string, string>;
  createdBy: string;
  inviteCode: string;
  totalExpenses: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  paidByName: string;
  splitType: SplitType;
  splitDetails: SplitDetail[];
  receiptPhotoURL: string | null;
  receiptPhotoThumbnailURL: string | null;
  createdAt: Timestamp;
  createdBy: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  currency: string;
  paidVia: 'card' | 'cash' | 'other';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripePaymentIntentId: string | null;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}

export interface Balance {
  userId: string;
  displayName: string;
  groupId: string;
  groupName: string;
  netBalance: number;
  currency: string;
}
