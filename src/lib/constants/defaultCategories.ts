import { TransactionType } from '@/domain/entities/Transaction';

export interface DefaultCategorySeed {
  name: string;
  nameId: string;
  type: TransactionType;
  icon: string;
  color: string;
  sortOrder: number;
}

export const DEFAULT_CATEGORIES: DefaultCategorySeed[] = [
  { name: 'Food', nameId: 'Makanan', type: 'expense', icon: 'restaurant', color: '#FF6B6B', sortOrder: 1 },
  { name: 'Transport', nameId: 'Transportasi', type: 'expense', icon: 'car', color: '#4ECDC4', sortOrder: 2 },
  { name: 'Shopping', nameId: 'Belanja', type: 'expense', icon: 'cart', color: '#45B7D1', sortOrder: 3 },
  { name: 'Bills', nameId: 'Tagihan', type: 'expense', icon: 'receipt', color: '#96CEB4', sortOrder: 4 },
  { name: 'Entertainment', nameId: 'Hiburan', type: 'expense', icon: 'game-controller', color: '#FFEAA7', sortOrder: 5 },
  { name: 'Health', nameId: 'Kesehatan', type: 'expense', icon: 'medical', color: '#DDA0DD', sortOrder: 6 },
  { name: 'Education', nameId: 'Pendidikan', type: 'expense', icon: 'school', color: '#74B9FF', sortOrder: 7 },
  { name: 'Pet', nameId: 'Hewan Peliharaan', type: 'expense', icon: 'paw', color: '#E17055', sortOrder: 8 },
  { name: 'Other', nameId: 'Lainnya', type: 'expense', icon: 'ellipsis-horizontal', color: '#A0A0A0', sortOrder: 9 },
  { name: 'Salary', nameId: 'Gaji', type: 'income', icon: 'wallet', color: '#2ECC71', sortOrder: 10 },
  { name: 'Freelance', nameId: 'Freelance', type: 'income', icon: 'laptop', color: '#27AE60', sortOrder: 11 },
  { name: 'Investment', nameId: 'Investasi', type: 'income', icon: 'trending-up', color: '#1ABC9C', sortOrder: 12 },
  { name: 'Gift', nameId: 'Hadiah', type: 'income', icon: 'gift', color: '#F39C12', sortOrder: 13 },
  { name: 'Other', nameId: 'Lainnya', type: 'income', icon: 'ellipsis-horizontal', color: '#95A5A6', sortOrder: 14 },
];
