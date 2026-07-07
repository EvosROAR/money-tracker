import { format, parseISO } from 'date-fns';

import { Transaction } from '@/domain/entities/Transaction';
import { Budget } from '@/domain/entities/Budget';
import { getMonthRange } from '@/lib/utils/date';

export const formatMonthKey = (date: Date): string => format(date, 'yyyy-MM');

export const parseMonthKey = (monthKey: string): Date => {
  const parsed = parseISO(`${monthKey}-01`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
}

export const computeSpendingByCategory = (
  transactions: Transaction[],
  month: Date,
): CategorySpending[] => {
  const { startDate, endDate } = getMonthRange(month);
  const map = new Map<string, CategorySpending>();

  transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.date.getTime() >= startDate.getTime() &&
        t.date.getTime() <= endDate.getTime(),
    )
    .forEach((t) => {
      const existing = map.get(t.categoryId);
      if (existing) {
        existing.amount += t.amount;
      } else {
        map.set(t.categoryId, {
          categoryId: t.categoryId,
          categoryName: t.categoryName,
          categoryColor: t.categoryColor,
          amount: t.amount,
        });
      }
    });

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
};

export const computeSpentForCategory = (
  transactions: Transaction[],
  month: Date,
  categoryId: string,
): number => {
  const { startDate, endDate } = getMonthRange(month);
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.categoryId === categoryId &&
        t.date.getTime() >= startDate.getTime() &&
        t.date.getTime() <= endDate.getTime(),
    )
    .reduce((sum, t) => sum + t.amount, 0);
};

export const enrichBudgetsWithSpent = (
  budgets: Budget[],
  transactions: Transaction[],
  month: Date,
): Budget[] =>
  budgets.map((budget) => ({
    ...budget,
    spentAmount: computeSpentForCategory(transactions, month, budget.categoryId),
  }));

export const getBudgetStatus = (
  budget: Budget,
): 'normal' | 'warning' | 'exceeded' => {
  if (budget.spentAmount > budget.limitAmount) return 'exceeded';
  if (budget.spentAmount >= budget.limitAmount * budget.warningThreshold) return 'warning';
  return 'normal';
};

export interface IncomeExpenseReport {
  income: number;
  expense: number;
  balance: number;
}

export const computeMonthReport = (
  transactions: Transaction[],
  month: Date,
): IncomeExpenseReport => {
  const { startDate, endDate } = getMonthRange(month);
  const monthTx = transactions.filter(
    (t) =>
      t.date.getTime() >= startDate.getTime() && t.date.getTime() <= endDate.getTime(),
  );

  const income = monthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = monthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expense, balance: income - expense };
};
