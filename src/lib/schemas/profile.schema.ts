import { z } from 'zod';

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
