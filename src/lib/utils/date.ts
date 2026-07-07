import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';

import { Transaction } from '@/domain/entities/Transaction';
import { SupportedLanguage } from '@/lib/constants';

export const formatDateInput = (date: Date): string => format(date, 'yyyy-MM-dd');

export const parseDateInput = (value: string): Date => {
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const formatTransactionDate = (
  date: Date,
  language: SupportedLanguage = 'id',
): string => {
  const locale = language === 'id' ? idLocale : enUS;
  return format(date, 'd MMM yyyy', { locale });
};

export const formatMonthYear = (date: Date, language: SupportedLanguage = 'id'): string => {
  const locale = language === 'id' ? idLocale : enUS;
  return format(date, 'MMMM yyyy', { locale });
};

export const getMonthRange = (month: Date) => ({
  startDate: startOfDay(startOfMonth(month)),
  endDate: endOfDay(endOfMonth(month)),
});

export type TimeOfDayKey = 'morning' | 'afternoon' | 'lateAfternoon' | 'evening';

export const getTimeOfDayKey = (
  date = new Date(),
  language: 'id' | 'en' = 'id',
): TimeOfDayKey => {
  const hour = date.getHours();

  if (language === 'en') {
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  // Indonesia: pagi · siang · sore · malam
  if (hour < 5 || hour >= 19) return 'evening';
  if (hour < 11) return 'morning';
  if (hour < 15) return 'afternoon';
  return 'lateAfternoon';
};

export const computeTransactionSummary = (transactions: Transaction[]) => {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
};

export const computeMonthExpense = (transactions: Transaction[], month: Date): number => {
  const interval = { start: startOfMonth(month), end: endOfMonth(month) };
  return transactions
    .filter((t) => t.type === 'expense' && isWithinInterval(t.date, interval))
    .reduce((sum, t) => sum + t.amount, 0);
};
