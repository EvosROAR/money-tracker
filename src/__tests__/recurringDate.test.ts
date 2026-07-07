import { addDays, addMonths } from 'date-fns';

import { advanceDueDate, startOfDayDate } from '@/lib/utils/recurringDate';

describe('recurringDate utils', () => {
  const base = new Date(2026, 0, 15);

  it('normalizes to start of day', () => {
    const withTime = new Date(2026, 0, 15, 14, 30);
    expect(startOfDayDate(withTime).getHours()).toBe(0);
  });

  it('advances daily', () => {
    const next = advanceDueDate(base, 'daily');
    expect(next.getTime()).toBe(addDays(base, 1).getTime());
  });

  it('advances monthly', () => {
    const next = advanceDueDate(base, 'monthly');
    expect(next.getTime()).toBe(addMonths(base, 1).getTime());
  });
});
