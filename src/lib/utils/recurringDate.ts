import { addDays, addMonths, addWeeks, addYears, startOfDay } from 'date-fns';

import { RecurringFrequency } from '@/domain/entities/RecurringTransaction';

export const startOfDayDate = (date: Date): Date => startOfDay(date);

export const advanceDueDate = (date: Date, frequency: RecurringFrequency): Date => {
  switch (frequency) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addWeeks(date, 1);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
    default:
      return addMonths(date, 1);
  }
};
