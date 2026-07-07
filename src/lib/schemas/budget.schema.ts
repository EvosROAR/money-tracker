import { z } from 'zod';

import { parseAmountInput } from '@/lib/utils/currency';

export const budgetSchema = z.object({
  month: z.string().min(7, 'Month is required'),
  categoryId: z.string().min(1, 'Category is required'),
  limitAmount: z
    .string()
    .min(1, 'Limit is required')
    .refine((value) => parseAmountInput(value) > 0, 'Limit must be greater than 0'),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
