import { Timestamp } from 'firebase/firestore';

import { Category } from '@/domain/entities/Category';
import { TransactionType } from '@/domain/entities/Transaction';

export interface CategoryDoc {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const mapCategoryDoc = (doc: CategoryDoc): Category => ({
  id: doc.id,
  name: doc.name,
  type: doc.type,
  icon: doc.icon,
  color: doc.color,
  isDefault: doc.isDefault,
  sortOrder: doc.sortOrder,
  createdAt: doc.createdAt?.toDate?.() ?? new Date(),
  updatedAt: doc.updatedAt?.toDate?.() ?? new Date(),
});
