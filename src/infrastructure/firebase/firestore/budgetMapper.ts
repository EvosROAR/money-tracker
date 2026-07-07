import { Timestamp } from 'firebase/firestore';

export interface BudgetDoc {
  id: string;
  month: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  warningThreshold: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const mapBudgetDoc = (doc: BudgetDoc) => ({
  id: doc.id,
  month: doc.month,
  categoryId: doc.categoryId,
  categoryName: doc.categoryName,
  limitAmount: doc.limitAmount,
  warningThreshold: doc.warningThreshold,
  createdAt: doc.createdAt?.toDate?.() ?? new Date(),
  updatedAt: doc.updatedAt?.toDate?.() ?? new Date(),
});
