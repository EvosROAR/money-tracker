import { Timestamp } from 'firebase/firestore';

import { RecurringTransaction } from '@/domain/entities/RecurringTransaction';

export interface RecurringTransactionDoc {
  id: string;
  type: RecurringTransaction['type'];
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  note?: string;
  frequency: RecurringTransaction['frequency'];
  startDate: Timestamp;
  nextDueDate: Timestamp;
  endDate?: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const mapRecurringTransactionDoc = (doc: RecurringTransactionDoc): RecurringTransaction => ({
  id: doc.id,
  type: doc.type,
  amount: doc.amount,
  categoryId: doc.categoryId,
  categoryName: doc.categoryName,
  categoryIcon: doc.categoryIcon,
  categoryColor: doc.categoryColor,
  note: doc.note,
  frequency: doc.frequency,
  startDate: doc.startDate.toDate(),
  nextDueDate: doc.nextDueDate.toDate(),
  endDate: doc.endDate?.toDate(),
  isActive: doc.isActive,
  createdAt: doc.createdAt.toDate(),
  updatedAt: doc.updatedAt.toDate(),
});
