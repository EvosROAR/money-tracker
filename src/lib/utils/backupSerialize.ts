import { format, isValid, parse } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export const BACKUP_DATE_FORMAT = 'yyyy-MM-dd HH:mm';

export const formatBackupDate = (date: Date): string => format(date, BACKUP_DATE_FORMAT);

const isFirestoreTimestampLike = (
  value: unknown,
): value is { seconds: number; nanoseconds?: number; toDate?: () => Date } => {
  if (!value || typeof value !== 'object') return false;
  if ('toDate' in value && typeof value.toDate === 'function') return true;
  if ('seconds' in value && typeof (value as { seconds: unknown }).seconds === 'number') return true;
  return false;
};

const timestampLikeToDate = (value: {
  seconds: number;
  nanoseconds?: number;
  toDate?: () => Date;
}): Date => {
  if (value.toDate) return value.toDate();
  return new Date(value.seconds * 1000);
};

export const serializeValueForBackup = (value: unknown): unknown => {
  if (value instanceof Date) {
    return formatBackupDate(value);
  }

  if (isFirestoreTimestampLike(value)) {
    return formatBackupDate(timestampLikeToDate(value));
  }

  return value;
};

export const serializeDocForBackup = (data: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    result[key] = serializeValueForBackup(value);
  }

  return result;
};

const DATE_FIELD_PATTERN = /(At|Date|^date$)/;

export const deserializeDateForRestore = (value: unknown): unknown => {
  if (value instanceof Timestamp) return value;

  if (typeof value === 'string') {
    const parsed = parse(value, BACKUP_DATE_FORMAT, new Date());
    if (isValid(parsed)) return Timestamp.fromDate(parsed);

    const iso = new Date(value);
    if (isValid(iso)) return Timestamp.fromDate(iso);

    return value;
  }

  if (isFirestoreTimestampLike(value)) {
    return Timestamp.fromDate(timestampLikeToDate(value));
  }

  return value;
};

export const deserializeDocForRestore = (data: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = { ...data };

  for (const [key, value] of Object.entries(result)) {
    if (DATE_FIELD_PATTERN.test(key)) {
      result[key] = deserializeDateForRestore(value);
    }
  }

  return result;
};
