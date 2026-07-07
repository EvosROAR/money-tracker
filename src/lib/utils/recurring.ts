import { differenceInCalendarDays, startOfDay } from 'date-fns';

import { RecurringTransaction } from '@/domain/entities/RecurringTransaction';

export const RECURRING_REMINDER_DAYS = 7;

export const getUpcomingRecurring = (
  items: RecurringTransaction[],
  withinDays = RECURRING_REMINDER_DAYS,
  reference = new Date(),
): RecurringTransaction[] => {
  const today = startOfDay(reference);

  return items
    .filter((item) => item.isActive)
    .filter((item) => {
      const daysUntilDue = differenceInCalendarDays(startOfDay(item.nextDueDate), today);
      return daysUntilDue >= 0 && daysUntilDue <= withinDays;
    })
    .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());
};

export const getDaysUntilDue = (dueDate: Date, reference = new Date()): number =>
  differenceInCalendarDays(startOfDay(dueDate), startOfDay(reference));
