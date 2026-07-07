import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { Category } from '@/domain/entities/Category';
import { TransactionType } from '@/domain/entities/Transaction';
import { AppError } from '@/domain/errors/AppError';
import {
  CreateCategoryDTO,
  ICategoryRepository,
  UpdateCategoryDTO,
} from '@/domain/repositories/ICategoryRepository';
import { getFirebaseAuth, getFirestoreDb } from '@/infrastructure/firebase/config';
import { CategoryDoc, mapCategoryDoc } from './categoryMapper';

const getUserId = (): string => {
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Not authenticated');
  }
  return uid;
};

const categoriesRef = (userId: string) => collection(getFirestoreDb(), 'users', userId, 'categories');

export class FirestoreCategoryRepository implements ICategoryRepository {
  async getAll(type?: TransactionType): Promise<Category[]> {
    const userId = getUserId();
    const snapshot = await getDocs(
      query(categoriesRef(userId), orderBy('sortOrder', 'asc')),
    );
    const categories = snapshot.docs.map((d) => mapCategoryDoc(d.data() as CategoryDoc));
    return type ? categories.filter((c) => c.type === type) : categories;
  }

  async getById(id: string): Promise<Category | null> {
    const userId = getUserId();
    const snap = await getDoc(doc(getFirestoreDb(), 'users', userId, 'categories', id));
    if (!snap.exists()) return null;
    return mapCategoryDoc(snap.data() as CategoryDoc);
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    const userId = getUserId();
    const ref = doc(categoriesRef(userId));
    const now = serverTimestamp();

    const existing = await this.getAll();
    const sameType = existing.filter((c) => c.type === data.type);
    const maxSort = sameType.reduce((max, c) => Math.max(max, c.sortOrder), 0);
    const sortOrder = maxSort + 1;

    const categoryData = {
      id: ref.id,
      name: data.name.trim(),
      type: data.type,
      icon: data.icon,
      color: data.color,
      isDefault: false,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(ref, categoryData);

    return {
      id: ref.id,
      name: data.name.trim(),
      type: data.type,
      icon: data.icon,
      color: data.color,
      isDefault: false,
      sortOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(data: UpdateCategoryDTO): Promise<Category> {
    const userId = getUserId();
    const ref = doc(getFirestoreDb(), 'users', userId, 'categories', data.id);

    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.type !== undefined) updates.type = data.type;
    if (data.icon !== undefined) updates.icon = data.icon;
    if (data.color !== undefined) updates.color = data.color;

    await updateDoc(ref, updates);

    const updated = await getDoc(ref);
    if (!updated.exists()) {
      throw new AppError('NOT_FOUND', 'Category not found');
    }
    return mapCategoryDoc(updated.data() as CategoryDoc);
  }

  async delete(id: string): Promise<void> {
    const userId = getUserId();
    await deleteDoc(doc(getFirestoreDb(), 'users', userId, 'categories', id));
  }

  async seedDefaults(): Promise<void> {
    // Handled during registration
  }
}

export const categoryRepository = new FirestoreCategoryRepository();
