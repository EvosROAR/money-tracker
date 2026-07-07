import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

import { RecurringTransaction } from '@/domain/entities/RecurringTransaction';
import { AppError } from '@/domain/errors/AppError';
import {
  CreateRecurringTransactionDTO,
  IRecurringTransactionRepository,
  UpdateRecurringTransactionDTO,
} from '@/domain/repositories/IRecurringTransactionRepository';
import { getFirebaseAuth, getFirestoreDb } from '@/infrastructure/firebase/config';
import { startOfDayDate } from '@/lib/utils/recurringDate';
import { categoryRepository } from './FirestoreCategoryRepository';
import {
  mapRecurringTransactionDoc,
  RecurringTransactionDoc,
} from './recurringTransactionMapper';

const getUserId = (): string => {
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Not authenticated');
  }
  return uid;
};

const recurringRef = (userId: string) =>
  collection(getFirestoreDb(), 'users', userId, 'recurring_transactions');

const resolveCategoryFields = async (categoryId: string) => {
  const category = await categoryRepository.getById(categoryId);
  if (!category) {
    throw new AppError('NOT_FOUND', 'Category not found');
  }
  return {
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon,
    categoryColor: category.color,
  };
};

export class FirestoreRecurringTransactionRepository implements IRecurringTransactionRepository {
  async getAll(): Promise<RecurringTransaction[]> {
    const userId = getUserId();
    const snapshot = await getDocs(query(recurringRef(userId), orderBy('createdAt', 'desc')));
    return snapshot.docs.map((d) => mapRecurringTransactionDoc(d.data() as RecurringTransactionDoc));
  }

  async getActive(): Promise<RecurringTransaction[]> {
    const all = await this.getAll();
    return all.filter((item) => item.isActive);
  }

  async getById(id: string): Promise<RecurringTransaction | null> {
    const userId = getUserId();
    const snap = await getDoc(doc(getFirestoreDb(), 'users', userId, 'recurring_transactions', id));
    if (!snap.exists()) return null;
    return mapRecurringTransactionDoc(snap.data() as RecurringTransactionDoc);
  }

  async create(data: CreateRecurringTransactionDTO): Promise<RecurringTransaction> {
    const userId = getUserId();
    const ref = doc(recurringRef(userId));
    const now = serverTimestamp();
    const categoryFields = await resolveCategoryFields(data.categoryId);
    const startDate = startOfDayDate(data.startDate);
    const endDate = data.endDate ? startOfDayDate(data.endDate) : undefined;

    const recurringData: Record<string, unknown> = {
      id: ref.id,
      type: data.type,
      amount: data.amount,
      ...categoryFields,
      frequency: data.frequency,
      startDate: Timestamp.fromDate(startDate),
      nextDueDate: Timestamp.fromDate(startDate),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    if (data.note?.trim()) {
      recurringData.note = data.note.trim();
    }

    if (endDate) {
      recurringData.endDate = Timestamp.fromDate(endDate);
    }

    await setDoc(ref, recurringData);

    return {
      id: ref.id,
      type: data.type,
      amount: data.amount,
      ...categoryFields,
      note: data.note?.trim() || undefined,
      frequency: data.frequency,
      startDate,
      nextDueDate: startDate,
      endDate,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(data: UpdateRecurringTransactionDTO): Promise<RecurringTransaction> {
    const userId = getUserId();
    const ref = doc(getFirestoreDb(), 'users', userId, 'recurring_transactions', data.id);
    const existing = await this.getById(data.id);
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Recurring transaction not found');
    }

    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (data.type !== undefined) updates.type = data.type;
    if (data.amount !== undefined) updates.amount = data.amount;
    if (data.frequency !== undefined) updates.frequency = data.frequency;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    if (data.note !== undefined) {
      updates.note = data.note.trim() ? data.note.trim() : deleteField();
    }

    if (data.startDate !== undefined) {
      updates.startDate = Timestamp.fromDate(startOfDayDate(data.startDate));
    }

    if (data.nextDueDate !== undefined) {
      updates.nextDueDate = Timestamp.fromDate(startOfDayDate(data.nextDueDate));
    }

    if (data.endDate !== undefined) {
      updates.endDate =
        data.endDate === null ? deleteField() : Timestamp.fromDate(startOfDayDate(data.endDate));
    }

    if (data.categoryId !== undefined) {
      const categoryFields = await resolveCategoryFields(data.categoryId);
      Object.assign(updates, categoryFields);
    }

    await updateDoc(ref, updates);

    return {
      ...existing,
      type: data.type ?? existing.type,
      amount: data.amount ?? existing.amount,
      categoryId: (updates.categoryId as string | undefined) ?? existing.categoryId,
      categoryName: (updates.categoryName as string | undefined) ?? existing.categoryName,
      categoryIcon: (updates.categoryIcon as string | undefined) ?? existing.categoryIcon,
      categoryColor: (updates.categoryColor as string | undefined) ?? existing.categoryColor,
      note: data.note !== undefined ? data.note.trim() || undefined : existing.note,
      frequency: data.frequency ?? existing.frequency,
      startDate: data.startDate ? startOfDayDate(data.startDate) : existing.startDate,
      nextDueDate: data.nextDueDate ? startOfDayDate(data.nextDueDate) : existing.nextDueDate,
      endDate:
        data.endDate === null ? undefined : data.endDate ? startOfDayDate(data.endDate) : existing.endDate,
      isActive: data.isActive ?? existing.isActive,
      updatedAt: new Date(),
    };
  }

  async delete(id: string): Promise<void> {
    const userId = getUserId();
    await deleteDoc(doc(getFirestoreDb(), 'users', userId, 'recurring_transactions', id));
  }
}

export const recurringTransactionRepository = new FirestoreRecurringTransactionRepository();
