import { isAfter, startOfDay } from 'date-fns';

import { recurringTransactionRepository } from '@/infrastructure/firebase/firestore/FirestoreRecurringTransactionRepository';
import { transactionRepository } from '@/infrastructure/firebase/firestore/FirestoreTransactionRepository';
import { advanceDueDate, startOfDayDate } from '@/lib/utils/recurringDate';

const MAX_GENERATIONS_PER_ITEM = 60;

export const processDueRecurringTransactions = async (): Promise<number> => {
  const activeItems = await recurringTransactionRepository.getActive();
  const today = startOfDay(new Date());
  let createdCount = 0;

  for (const item of activeItems) {
    let dueDate = startOfDayDate(item.nextDueDate);
    let generations = 0;
    let isStillActive = true;

    while (dueDate.getTime() <= today.getTime() && generations < MAX_GENERATIONS_PER_ITEM) {
      if (item.endDate && isAfter(dueDate, startOfDayDate(item.endDate))) {
        isStillActive = false;
        break;
      }

      await transactionRepository.create({
        type: item.type,
        amount: item.amount,
        categoryId: item.categoryId,
        note: item.note,
        date: dueDate,
      });

      createdCount += 1;
      generations += 1;
      dueDate = advanceDueDate(dueDate, item.frequency);
    }

    if (generations > 0) {
      if (item.endDate && isAfter(dueDate, startOfDayDate(item.endDate))) {
        isStillActive = false;
      }

      await recurringTransactionRepository.update({
        id: item.id,
        nextDueDate: dueDate,
        isActive: isStillActive,
      });
    }
  }

  return createdCount;
};
