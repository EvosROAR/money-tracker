import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { Budget } from '@/domain/entities/Budget';
import { AppError } from '@/domain/errors/AppError';
import {
  CreateBudgetDTO,
  IBudgetRepository,
  UpdateBudgetDTO,
} from '@/domain/repositories/IBudgetRepository';
import { BUDGET_WARNING_THRESHOLD } from '@/lib/constants';
import { getFirebaseAuth, getFirestoreDb } from '@/infrastructure/firebase/config';
import { categoryRepository } from './FirestoreCategoryRepository';
import { BudgetDoc, mapBudgetDoc } from './budgetMapper';

const getUserId = (): string => {
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Not authenticated');
  }
  return uid;
};

const budgetsRef = (userId: string) => collection(getFirestoreDb(), 'users', userId, 'budgets');

const toBudget = (doc: BudgetDoc, spentAmount = 0): Budget => ({
  ...mapBudgetDoc(doc),
  spentAmount,
});

export class FirestoreBudgetRepository implements IBudgetRepository {
  async getByMonth(month: string): Promise<Budget[]> {
    const userId = getUserId();
    const snapshot = await getDocs(budgetsRef(userId));
    return snapshot.docs
      .map((d) => toBudget(d.data() as BudgetDoc))
      .filter((b) => b.month === month)
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }

  async getById(id: string): Promise<Budget | null> {
    const userId = getUserId();
    const snap = await getDoc(doc(getFirestoreDb(), 'users', userId, 'budgets', id));
    if (!snap.exists()) return null;
    return toBudget(snap.data() as BudgetDoc);
  }

  async create(data: CreateBudgetDTO): Promise<Budget> {
    const userId = getUserId();
    const category = await categoryRepository.getById(data.categoryId);
    if (!category) {
      throw new AppError('NOT_FOUND', 'Category not found');
    }
    if (category.type !== 'expense') {
      throw new AppError('VALIDATION_ERROR', 'Budget category must be expense');
    }

    const existing = await this.getByMonth(data.month);
    if (existing.some((b) => b.categoryId === data.categoryId)) {
      throw new AppError('VALIDATION_ERROR', 'Budget already exists for this category');
    }

    const ref = doc(budgetsRef(userId));
    const now = serverTimestamp();
    const budgetData = {
      id: ref.id,
      month: data.month,
      categoryId: category.id,
      categoryName: category.name,
      limitAmount: data.limitAmount,
      warningThreshold: data.warningThreshold ?? BUDGET_WARNING_THRESHOLD,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(ref, budgetData);

    return {
      id: ref.id,
      month: data.month,
      categoryId: category.id,
      categoryName: category.name,
      limitAmount: data.limitAmount,
      warningThreshold: data.warningThreshold ?? BUDGET_WARNING_THRESHOLD,
      spentAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(data: UpdateBudgetDTO): Promise<Budget> {
    const userId = getUserId();
    const ref = doc(getFirestoreDb(), 'users', userId, 'budgets', data.id);
    const existing = await this.getById(data.id);
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Budget not found');
    }

    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (data.limitAmount !== undefined) updates.limitAmount = data.limitAmount;
    if (data.month !== undefined) updates.month = data.month;

    if (data.categoryId !== undefined) {
      const category = await categoryRepository.getById(data.categoryId);
      if (!category) {
        throw new AppError('NOT_FOUND', 'Category not found');
      }
      updates.categoryId = category.id;
      updates.categoryName = category.name;
    }

    await updateDoc(ref, updates);

    return {
      ...existing,
      month: data.month ?? existing.month,
      categoryId: (updates.categoryId as string | undefined) ?? existing.categoryId,
      categoryName: (updates.categoryName as string | undefined) ?? existing.categoryName,
      limitAmount: data.limitAmount ?? existing.limitAmount,
      updatedAt: new Date(),
    };
  }

  async delete(id: string): Promise<void> {
    const userId = getUserId();
    await deleteDoc(doc(getFirestoreDb(), 'users', userId, 'budgets', id));
  }
}

export const budgetRepository = new FirestoreBudgetRepository();
