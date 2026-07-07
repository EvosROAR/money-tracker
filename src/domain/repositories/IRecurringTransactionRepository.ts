import { RecurringFrequency } from '@/domain/entities/RecurringTransaction';
import { TransactionType } from '@/domain/entities/Transaction';

import { RecurringTransaction } from '../entities/RecurringTransaction';

export interface CreateRecurringTransactionDTO {
  type: TransactionType;
  amount: number;
  categoryId: string;
  note?: string;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateRecurringTransactionDTO {
  id: string;
  type?: TransactionType;
  amount?: number;
  categoryId?: string;
  note?: string;
  frequency?: RecurringFrequency;
  startDate?: Date;
  nextDueDate?: Date;
  endDate?: Date | null;
  isActive?: boolean;
}

export interface IRecurringTransactionRepository {
  getAll(): Promise<RecurringTransaction[]>;
  getActive(): Promise<RecurringTransaction[]>;
  getById(id: string): Promise<RecurringTransaction | null>;
  create(data: CreateRecurringTransactionDTO): Promise<RecurringTransaction>;
  update(data: UpdateRecurringTransactionDTO): Promise<RecurringTransaction>;
  delete(id: string): Promise<void>;
}
