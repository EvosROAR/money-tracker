import { z } from 'zod';

import { parseAmountInput } from '@/lib/utils/currency';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((value) => parseAmountInput(value) > 0, 'Amount must be greater than 0'),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().max(200).optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
