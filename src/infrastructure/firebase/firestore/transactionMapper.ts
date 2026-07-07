import { Timestamp } from 'firebase/firestore';

import { Transaction, TransactionType } from '@/domain/entities/Transaction';

export interface TransactionDoc {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  note?: string;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const mapTransactionDoc = (doc: TransactionDoc): Transaction => ({
  id: doc.id,
  type: doc.type,
  amount: doc.amount,
  categoryId: doc.categoryId,
  categoryName: doc.categoryName,
  categoryIcon: doc.categoryIcon,
  categoryColor: doc.categoryColor,
  note: doc.note,
  date: doc.date?.toDate?.() ?? new Date(),
  createdAt: doc.createdAt?.toDate?.() ?? new Date(),
  updatedAt: doc.updatedAt?.toDate?.() ?? new Date(),
});
