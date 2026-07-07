import { Transaction } from '@/domain/entities/Transaction';
import {
  computeMonthReport,
  computeSpendingByCategory,
  getBudgetStatus,
  enrichBudgetsWithSpent,
} from '@/lib/utils/reports';

const makeTx = (overrides: Partial<Transaction>): Transaction => ({
  id: '1',
  userId: 'u1',
  type: 'expense',
  amount: 100_000,
  categoryId: 'cat1',
  categoryName: 'Food',
  categoryColor: '#f00',
  date: new Date(2026, 5, 10),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('reports utils', () => {
  const month = new Date(2026, 5, 1);
  const transactions = [
    makeTx({ type: 'income', amount: 5_000_000, categoryId: 'salary' }),
    makeTx({ amount: 200_000, categoryId: 'food' }),
    makeTx({ amount: 300_000, categoryId: 'food' }),
    makeTx({ amount: 150_000, categoryId: 'transport', date: new Date(2026, 4, 28) }),
  ];

  it('computes month income/expense report', () => {
    const report = computeMonthReport(transactions, month);
    expect(report.income).toBe(5_000_000);
    expect(report.expense).toBe(500_000);
    expect(report.balance).toBe(4_500_000);
  });

  it('aggregates spending by category', () => {
    const spending = computeSpendingByCategory(transactions, month);
    const food = spending.find((s) => s.categoryId === 'food');
    expect(food?.amount).toBe(500_000);
  });

  it('enriches budgets with spent amounts', () => {
    const budgets = enrichBudgetsWithSpent(
      [
        {
          id: 'b1',
          month: '2026-06',
          categoryId: 'food',
          categoryName: 'Food',
          limitAmount: 1_000_000,
          warningThreshold: 0.8,
          spentAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      transactions,
      month,
    );

    expect(budgets[0]?.spentAmount).toBe(500_000);
    expect(getBudgetStatus(budgets[0]!)).toBe('normal');

    const almostFull = { ...budgets[0]!, spentAmount: 850_000 };
    expect(getBudgetStatus(almostFull)).toBe('warning');
  });
});
