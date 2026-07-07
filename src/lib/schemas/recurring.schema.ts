import { z } from 'zod';

import { parseAmountInput, parseDisplayAmount } from '@/lib/utils/currency';
import { parseDateInput } from '@/lib/utils/date';

const isPositiveAmount = (value: string): boolean => {
  const idrAmount = parseAmountInput(value);
  if (idrAmount > 0) return true;
  return parseDisplayAmount(value, 'USD') > 0;
};

export const recurringSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(isPositiveAmount, 'Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((value) => !Number.isNaN(parseDateInput(value).getTime()), 'Invalid date'),
  endDate: z
    .string()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(parseDateInput(value).getTime()),
      'Invalid end date',
    ),
  note: z.string().max(200, 'Note is too long').optional(),
});

export type RecurringFormData = z.infer<typeof recurringSchema>;
