import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

import { getFirebaseAuth, getFirestoreDb } from '@/infrastructure/firebase/config';
import { AppError } from '@/domain/errors/AppError';
import {
  deserializeDocForRestore,
  formatBackupDate,
  serializeDocForBackup,
} from '@/lib/utils/backupSerialize';

const BACKUP_VERSION = 2;

export interface BackupData {
  version: number;
  exportedAt: string;
  categories: unknown[];
  transactions: unknown[];
  budgets: unknown[];
  recurring_transactions?: unknown[];
}

const getUserId = (): string => {
  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) {
    throw new AppError('AUTH_INVALID_CREDENTIALS', 'Not authenticated');
  }
  return uid;
};

export const exportBackup = async (): Promise<BackupData> => {
  const userId = getUserId();
  const db = getFirestoreDb();

  const [categoriesSnap, transactionsSnap, budgetsSnap, recurringSnap] = await Promise.all([
    getDocs(collection(db, 'users', userId, 'categories')),
    getDocs(collection(db, 'users', userId, 'transactions')),
    getDocs(collection(db, 'users', userId, 'budgets')),
    getDocs(collection(db, 'users', userId, 'recurring_transactions')),
  ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: formatBackupDate(new Date()),
    categories: categoriesSnap.docs.map((d) =>
      serializeDocForBackup(d.data() as Record<string, unknown>),
    ),
    transactions: transactionsSnap.docs.map((d) =>
      serializeDocForBackup(d.data() as Record<string, unknown>),
    ),
    budgets: budgetsSnap.docs.map((d) =>
      serializeDocForBackup(d.data() as Record<string, unknown>),
    ),
    recurring_transactions: recurringSnap.docs.map((d) =>
      serializeDocForBackup(d.data() as Record<string, unknown>),
    ),
  };
};

export const downloadBackupJson = (data: BackupData): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const datePart = data.exportedAt.slice(0, 10);
  anchor.href = url;
  anchor.download = `money-tracker-backup-${datePart}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

const isBackupData = (value: unknown): value is BackupData => {
  if (!value || typeof value !== 'object') return false;
  const data = value as BackupData;
  return (
    (data.version === BACKUP_VERSION || data.version === 1) &&
    Array.isArray(data.categories) &&
    Array.isArray(data.transactions) &&
    Array.isArray(data.budgets)
  );
};

export const restoreBackup = async (raw: unknown): Promise<void> => {
  if (!isBackupData(raw)) {
    throw new AppError('VALIDATION_ERROR', 'Invalid backup file');
  }

  const userId = getUserId();
  const db = getFirestoreDb();
  const batch = writeBatch(db);

  const clearCollection = async (
    name: 'categories' | 'transactions' | 'budgets' | 'recurring_transactions',
  ) => {
    const snap = await getDocs(collection(db, 'users', userId, name));
    snap.docs.forEach((d) => batch.delete(d.ref));
  };

  await clearCollection('categories');
  await clearCollection('transactions');
  await clearCollection('budgets');
  await clearCollection('recurring_transactions');

  raw.categories.forEach((item) => {
    const data = item as { id: string };
    batch.set(
      doc(db, 'users', userId, 'categories', data.id),
      deserializeDocForRestore(item as Record<string, unknown>),
    );
  });

  raw.transactions.forEach((item) => {
    const data = item as { id: string };
    batch.set(
      doc(db, 'users', userId, 'transactions', data.id),
      deserializeDocForRestore(item as Record<string, unknown>),
    );
  });

  raw.budgets.forEach((item) => {
    const data = item as { id: string };
    batch.set(
      doc(db, 'users', userId, 'budgets', data.id),
      deserializeDocForRestore(item as Record<string, unknown>),
    );
  });

  raw.recurring_transactions?.forEach((item) => {
    const data = item as { id: string };
    batch.set(
      doc(db, 'users', userId, 'recurring_transactions', data.id),
      deserializeDocForRestore(item as Record<string, unknown>),
    );
  });

  await batch.commit();
};

export const parseBackupFile = (text: string): unknown => JSON.parse(text) as unknown;
