import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  type: z.enum(['income', 'expense']),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
