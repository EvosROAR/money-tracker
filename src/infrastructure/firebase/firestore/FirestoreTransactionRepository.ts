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

import { Transaction } from '@/domain/entities/Transaction';
import { AppError } from '@/domain/errors/AppError';
import {
  CreateTransactionDTO,
  ITransactionRepository,
  TransactionFilters,
  UpdateTransactionDTO,
} from '@/domain/repositories/ITransactionRepository';
import { getFirebaseAuth, getFirestoreDb } from '@/infrastructure/firebase/config';
import { categoryRepository } from './FirestoreCategoryRepository';
import { mapTransactionDoc, TransactionDoc } from './transactionMapper';

const getUserId = (): string => {
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Not authenticated');
  }
  return uid;
};

const transactionsRef = (userId: string) =>
  collection(getFirestoreDb(), 'users', userId, 'transactions');

const applyFilters = (transactions: Transaction[], filters?: TransactionFilters): Transaction[] => {
  if (!filters) return transactions;

  let result = transactions;

  if (filters.type) {
    result = result.filter((t) => t.type === filters.type);
  }

  if (filters.categoryId) {
    result = result.filter((t) => t.categoryId === filters.categoryId);
  }

  if (filters.startDate) {
    const start = filters.startDate.getTime();
    result = result.filter((t) => t.date.getTime() >= start);
  }

  if (filters.endDate) {
    const end = filters.endDate.getTime();
    result = result.filter((t) => t.date.getTime() <= end);
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.categoryName.toLowerCase().includes(term) ||
        t.note?.toLowerCase().includes(term),
    );
  }

  return result;
};

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

export class FirestoreTransactionRepository implements ITransactionRepository {
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    const userId = getUserId();
    const snapshot = await getDocs(
      query(transactionsRef(userId), orderBy('date', 'desc')),
    );
    const transactions = snapshot.docs.map((d) =>
      mapTransactionDoc(d.data() as TransactionDoc),
    );
    return applyFilters(transactions, filters);
  }

  async getById(id: string): Promise<Transaction | null> {
    const userId = getUserId();
    const snap = await getDoc(doc(getFirestoreDb(), 'users', userId, 'transactions', id));
    if (!snap.exists()) return null;
    return mapTransactionDoc(snap.data() as TransactionDoc);
  }

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const userId = getUserId();
    const ref = doc(transactionsRef(userId));
    const now = serverTimestamp();
    const categoryFields = await resolveCategoryFields(data.categoryId);

    const transactionData: Record<string, unknown> = {
      id: ref.id,
      type: data.type,
      amount: data.amount,
      ...categoryFields,
      date: Timestamp.fromDate(data.date),
      createdAt: now,
      updatedAt: now,
    };

    if (data.note?.trim()) {
      transactionData.note = data.note.trim();
    }

    await setDoc(ref, transactionData);

    return {
      id: ref.id,
      type: data.type,
      amount: data.amount,
      ...categoryFields,
      note: data.note?.trim() || undefined,
      date: data.date,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(data: UpdateTransactionDTO): Promise<Transaction> {
    const userId = getUserId();
    const ref = doc(getFirestoreDb(), 'users', userId, 'transactions', data.id);
    const existing = await this.getById(data.id);
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Transaction not found');
    }

    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (data.type !== undefined) updates.type = data.type;
    if (data.amount !== undefined) updates.amount = data.amount;
    if (data.note !== undefined) {
      updates.note = data.note.trim() ? data.note.trim() : deleteField();
    }
    if (data.date !== undefined) updates.date = Timestamp.fromDate(data.date);

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
      date: data.date ?? existing.date,
      updatedAt: new Date(),
    };
  }

  async delete(id: string): Promise<void> {
    const userId = getUserId();
    await deleteDoc(doc(getFirestoreDb(), 'users', userId, 'transactions', id));
  }

  async getRecent(limit: number): Promise<Transaction[]> {
    const all = await this.getAll();
    return all.slice(0, limit);
  }
}

export const transactionRepository = new FirestoreTransactionRepository();
